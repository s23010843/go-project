#!/usr/bin/env python3
import json
import os
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split


def main():
    repo_root = Path(__file__).resolve().parents[1]
    data_path = repo_root / "prices.json"
    if not data_path.exists():
        raise SystemExit(f"prices.json not found at {data_path}")

    df = pd.read_json(data_path)
    if df.empty:
        raise SystemExit("prices.json is empty")

    X = pd.get_dummies(df[["crop", "market"]])
    y = df["price"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    print(f"Trained RandomForestRegressor — MAE: {mae:.2f}")

    out_dir = repo_root / "ml"
    out_dir.mkdir(parents=True, exist_ok=True)
    model_file = out_dir / "model.joblib"
    joblib.dump({"model": model, "columns": X.columns.tolist()}, model_file)
    print(f"Saved model to {model_file}")


if __name__ == "__main__":
    main()
