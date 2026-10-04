"""
Ablation Study Models for Empirical Architecture Verification
1. Sequence Only (GRU-only, no context)
2. Context Only (Dense Context-only, no historical sequence)
3. Concatenation without Gate (Direct Linear layer on [h; c])
4. Full Gated Fusion (Proposed model with dynamic gate g)
"""
import torch
import torch.nn as nn
from typing import Dict, Tuple, Optional
from app.models.gated_fusion_gru import TwoBranchGatedFusionModel


class SequenceOnlyModel(nn.Module):
    """Ablation 1: Sequence Only (2-layer GRU without context)"""
    def __init__(self, seq_feature_dim: int = 3, hidden_size: int = 64, num_gru_layers: int = 2, dropout_rate: float = 0.20):
        super().__init__()
        self.gru = nn.GRU(
            input_size=seq_feature_dim,
            hidden_size=hidden_size,
            num_layers=num_gru_layers,
            batch_first=True,
            dropout=dropout_rate if num_gru_layers > 1 else 0.0,
        )
        self.head = nn.Linear(hidden_size, 1)

    def forward(self, x_seq: torch.Tensor, x_ctx: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, Dict]:
        _, h_n = self.gru(x_seq)
        h = h_n[-1]
        out = self.head(h)
        return out, {"model": "Sequence Only (GRU)", "h": h}


class ContextOnlyModel(nn.Module):
    """Ablation 2: Context Only (Dense + ReLU without sequence)"""
    def __init__(self, context_feature_dim: int = 14, hidden_size: int = 64, dropout_rate: float = 0.20):
        super().__init__()
        self.context_encoder = nn.Sequential(
            nn.Linear(context_feature_dim, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
        )
        self.head = nn.Linear(hidden_size, 1)

    def forward(self, x_seq: Optional[torch.Tensor], x_ctx: torch.Tensor) -> Tuple[torch.Tensor, Dict]:
        c = self.context_encoder(x_ctx)
        out = self.head(c)
        return out, {"model": "Context Only (MLP)", "c": c}


class ConcatNoGateModel(nn.Module):
    """Ablation 3: Concatenation without Gate ([h; c] -> Linear Head)"""
    def __init__(
        self,
        seq_feature_dim: int = 3,
        context_feature_dim: int = 14,
        hidden_size: int = 64,
        num_gru_layers: int = 2,
        dropout_rate: float = 0.20,
    ):
        super().__init__()
        self.gru = nn.GRU(
            input_size=seq_feature_dim,
            hidden_size=hidden_size,
            num_layers=num_gru_layers,
            batch_first=True,
            dropout=dropout_rate if num_gru_layers > 1 else 0.0,
        )
        self.context_encoder = nn.Sequential(
            nn.Linear(context_feature_dim, hidden_size),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
        )
        # Directly predicts from 128-dim concatenated vector
        self.head = nn.Linear(hidden_size * 2, 1)

    def forward(self, x_seq: torch.Tensor, x_ctx: torch.Tensor) -> Tuple[torch.Tensor, Dict]:
        _, h_n = self.gru(x_seq)
        h = h_n[-1]
        c = self.context_encoder(x_ctx)
        concat = torch.cat([h, c], dim=-1)
        out = self.head(concat)
        return out, {"model": "Concatenation without Gate", "concat_repr": concat}
