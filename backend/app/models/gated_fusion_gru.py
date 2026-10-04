"""
Two-Branch Spatiotemporal Gated Fusion Model for Bus Delay Prediction
Implementing the exact architecture described in the research paper:
- Branch 1: 2-layer GRU (Hidden Size 64, Dropout 0.20) for 12-stop sequence
- Branch 2: Context Encoder (Dense -> ReLU) for 14-dim spatiotemporal context
- Gated Fusion Mechanism: g = sigmoid(W_g [h; c] + b_g), z = g*h + (1-g)*c
- Linear Prediction Head: output delay (minutes)
"""
import torch
import torch.nn as nn
from typing import Dict, Tuple, Optional


class TwoBranchGatedFusionModel(nn.Module):
    def __init__(
        self,
        seq_feature_dim: int = 3,
        seq_len: int = 12,
        context_feature_dim: int = 14,
        hidden_size: int = 64,
        num_gru_layers: int = 2,
        dropout_rate: float = 0.20,
    ):
        super().__init__()
        self.seq_feature_dim = seq_feature_dim
        self.seq_len = seq_len
        self.context_feature_dim = context_feature_dim
        self.hidden_size = hidden_size

        # Branch 1: Sequence Encoder (2-layer GRU with Dropout)
        self.gru = nn.GRU(
            input_size=seq_feature_dim,
            hidden_size=hidden_size,
            num_layers=num_gru_layers,
            batch_first=True,
            dropout=dropout_rate if num_gru_layers > 1 else 0.0,
        )

        # Branch 2: Context Encoder (Dense + ReLU)
        self.context_encoder = nn.Sequential(
            nn.Linear(context_feature_dim, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
        )

        # Gated Fusion Unit
        # Gate: g = sigmoid(W_g [h; c] + b_g)
        self.gate_linear = nn.Linear(hidden_size * 2, hidden_size)
        self.gate_activation = nn.Sigmoid()

        # Linear Prediction Head
        self.prediction_head = nn.Linear(hidden_size, 1)

    def forward(
        self,
        x_seq: torch.Tensor,
        x_ctx: torch.Tensor,
        return_intermediates: bool = False,
    ) -> Tuple[torch.Tensor, Optional[Dict[str, torch.Tensor]]]:
        """
        Forward pass.
        Args:
            x_seq: (Batch, 12, 3) - Sequence of [delay, segment_travel_time, dwell_time]
            x_ctx: (Batch, 14) - Static/Dynamic Context features
            return_intermediates: If True, returns dict of intermediate activations (h, c, g, z)
        Returns:
            predicted_delay: (Batch, 1) or (Batch,)
            intermediates: dict of tensors if return_intermediates=True
        """
        # 1. Branch 1: Sequence Representation h
        gru_out, h_n = self.gru(x_seq)
        # Take the top layer final hidden state
        h = h_n[-1]  # Shape: (Batch, hidden_size)

        # 2. Branch 2: Context Representation c
        c = self.context_encoder(x_ctx)  # Shape: (Batch, hidden_size)

        # 3. Gated Fusion
        # Concatenate [h; c]
        hc_concat = torch.cat([h, c], dim=-1)  # Shape: (Batch, hidden_size * 2)
        # Compute dynamic gate g
        g = self.gate_activation(self.gate_linear(hc_concat))  # Shape: (Batch, hidden_size)
        # Gated fusion combination: z = g * h + (1 - g) * c
        z = (g * h) + ((1.0 - g) * c)  # Shape: (Batch, hidden_size)

        # 4. Linear Prediction Head
        predicted_delay = self.prediction_head(z)  # Shape: (Batch, 1)

        if return_intermediates:
            intermediates = {
                "sequence_repr_h": h,
                "context_repr_c": c,
                "gate_weights_g": g,
                "fused_vector_z": z,
                "avg_gate_value": g.mean().item(),
                "sequence_weight": g.mean().item(),
                "context_weight": (1.0 - g.mean()).item(),
            }
            return predicted_delay, intermediates

        return predicted_delay, None


class CompositeDelayLoss(nn.Module):
    """
    Paper loss function: Loss = MAE + 0.5 * MSE
    """
    def __init__(self, mse_weight: float = 0.5):
        super().__init__()
        self.mse_weight = mse_weight
        self.mae = nn.L1Loss()
        self.mse = nn.MSELoss()

    def forward(self, pred: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        loss_mae = self.mae(pred, target)
        loss_mse = self.mse(pred, target)
        return loss_mae + (self.mse_weight * loss_mse)
