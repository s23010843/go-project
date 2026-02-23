#!/usr/bin/env python3
import argparse
from pathlib import Path

import joblib
import pandas as pd


def main():
    parser = argparse.ArgumentParser(description="Predict price for a crop at a market using saved model")
    parser.add_argument("--crop", required=True, help="Crop name, e.g. Wheat")
    parser.add_argument("--market", required=True, help="Market name, e.g. Central")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    model_file = repo_root / "ml" / "model.joblib"
    if not model_file.exists():
        raise SystemExit(f"Model not found. Train first with ml/train.py (created model at {model_file})")

    data = joblib.load(model_file)
    model = data["model"]
    columns = data["columns"]

    # Build input row with same dummies
    row = {c: 0 for c in columns}
    crop_key = f"crop_{args.crop}"
    market_key = f"market_{args.market}"
    if crop_key in row:
        row[crop_key] = 1
    if market_key in row:
        row[market_key] = 1

    df = pd.DataFrame([row])
    pred = model.predict(df)[0]
    print(f"Predicted price for {args.crop} at {args.market}: {pred:.2f}")


if __name__ == "__main__":
    main()
