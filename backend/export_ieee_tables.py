"""
IEEE Conference Paper Results Exporter
Generates publication-ready LaTeX tables, Markdown tables, and metric summaries
for inserting directly into your IEEE Conference Paper manuscript.
"""
import json
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CHECKPOINTS_DIR = Path(__file__).resolve().parent / "app" / "data" / "checkpoints"
SUMMARY_FILE = CHECKPOINTS_DIR / "training_summary.json"


def export_ieee_tables():
    if not SUMMARY_FILE.exists():
        print(f"Error: {SUMMARY_FILE} not found. Please run training pipeline first.")
        return

    with open(SUMMARY_FILE, "r") as f:
        data = json.load(f)

    benchmarks = data.get("benchmark_table", [])
    ablations = data.get("ablation_table", [])

    print("\n" + "=" * 80)
    print(" IEEE CONFERENCE PAPER — READY-TO-USE LATEX & MARKDOWN RESULTS TABLES")
    print("=" * 80)

    # ---------------------------------------------------------
    # 1. LaTeX Code for Table 1: Model Benchmark Comparison
    # ---------------------------------------------------------
    print("\n" + "-" * 80)
    print(">>> 1. LATEX CODE: TABLE I (MODEL COMPARISON ON CHRONOLOGICAL TEST SET)")
    print("-" * 80)
    latex_table1 = r"""\begin{table}[htbp]
\caption{Comparative Performance of Proposed and Baseline Bus Delay Prediction Models on Chronological Test Set}
\label{tab:model_comparison}
\centering
\begin{tabular}{lcccccc}
\hline
\textbf{Model Architecture} & \textbf{MAE (min)} & \textbf{RMSE (min)} & \textbf{MAPE (\%)} & \textbf{$R^2$} & \textbf{Acc$_1$ (\%)} & \textbf{Acc$_3$ (\%)} \\
\hline
"""
    for b in benchmarks:
        name = b["model"]
        mae = f"{b['mae']:.2f}"
        rmse = f"{b['rmse']:.2f}"
        mape = f"{b['mape']:.1f}"
        r2 = f"{b['r2']:.2f}"
        acc1 = f"{b.get('acc1', 0.0):.1f}"
        acc3 = f"{b['acc3']:.1f}"
        
        if "Proposed" in name:
            latex_table1 += f"\\textbf{{{name}}} & \\textbf{{{mae}}} & \\textbf{{{rmse}}} & \\textbf{{{mape}}} & \\textbf{{{r2}}} & \\textbf{{{acc1}}} & \\textbf{{{acc3}}} \\\\\n"
        else:
            latex_table1 += f"{name} & {mae} & {rmse} & {mape} & {r2} & {acc1} & {acc3} \\\\\n"

    latex_table1 += r"""\hline
\end{tabular}
\end{table}"""
    print(latex_table1)

    # ---------------------------------------------------------
    # 2. LaTeX Code for Table 2: Ablation Study
    # ---------------------------------------------------------
    print("\n" + "-" * 80)
    print(">>> 2. LATEX CODE: TABLE II (ABLATION STUDY OF ARCHITECTURE COMPONENTS)")
    print("-" * 80)
    latex_table2 = r"""\begin{table}[htbp]
\caption{Ablation Study Isolating Structural Components of the Proposed Gated Fusion Architecture}
\label{tab:ablation_study}
\centering
\begin{tabular}{lcccc}
\hline
\textbf{Architecture Configuration} & \textbf{MAE (min)} & \textbf{$\Delta$ MAE (min)} & \textbf{Acc$_3$ (\%)} & \textbf{$\Delta$ Acc$_3$ (\%)} \\
\hline
"""
    for a in ablations:
        cfg = a["configuration"]
        mae = f"{a['mae']:.2f}"
        delta_mae = a.get("delta_mae", "+0.00")
        acc3 = f"{a['acc3']:.1f}"
        gain_acc3 = a.get("gain_acc3", "0.0%")
        
        if "Proposed" in cfg or "Full Gated" in cfg:
            latex_table2 += f"\\textbf{{{cfg}}} & \\textbf{{{mae}}} & \\textbf{{{delta_mae}}} & \\textbf{{{acc3}}} & \\textbf{{{gain_acc3}}} \\\\\n"
        else:
            latex_table2 += f"{cfg} & {mae} & {delta_mae} & {acc3} & {gain_acc3} \\\\\n"

    latex_table2 += r"""\hline
\end{tabular}
\end{table}"""
    print(latex_table2)

    # ---------------------------------------------------------
    # 3. Markdown Formatted Tables
    # ---------------------------------------------------------
    print("\n" + "-" * 80)
    print(">>> 3. MARKDOWN TABLE: MODEL BENCHMARK COMPARISON")
    print("-" * 80)
    print("| Model Architecture | MAE (min) | RMSE (min) | MAPE (%) | R² | Acc₁ (≤1m) | Acc₃ (≤3m) | Acc₅ (≤5m) |")
    print("| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |")
    for b in benchmarks:
        print(f"| **{b['model']}** | {b['mae']:.2f} | {b['rmse']:.2f} | {b['mape']:.1f}% | {b['r2']:.2f} | {b.get('acc1', 0.0):.1f}% | {b['acc3']:.1f}% | {b.get('acc5', 0.0):.1f}% |")

    print("\n" + "-" * 80)
    print(">>> 4. MARKDOWN TABLE: ABLATION STUDY")
    print("-" * 80)
    print("| Configuration | MAE (min) | Acc₃ (%) | Δ MAE vs Proposed | Key Finding |")
    print("| :--- | :---: | :---: | :---: | :--- |")
    for a in ablations:
        print(f"| **{a['configuration']}** | {a['mae']:.2f} | {a['acc3']:.1f}% | {a.get('delta_mae', '')} | {a.get('description', '')} |")

    # Save output to a text/latex file for convenience
    output_path = CHECKPOINTS_DIR / "ieee_paper_tables.tex"
    with open(output_path, "w") as f:
        f.write("% IEEE Conference Paper Tables Generated from Gated Fusion Run\n\n")
        f.write(latex_table1 + "\n\n" + latex_table2 + "\n")
    print(f"\nSaved LaTeX file to: {output_path}\n")


if __name__ == "__main__":
    export_ieee_tables()
