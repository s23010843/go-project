# ML helper

This folder contains a minimal example pipeline to train a price-prediction model from the project `prices.json` file.

Usage

- Install dependencies:

```bash
pip install -r requirements.txt
```

- Train a model (saves to `ml/model.joblib`):

```bash
python3 ml/train.py
```

- Predict a price:

```bash
python3 ml/predict.py --crop Wheat --market Central
```

Notes

- This is a minimal example using one-hot encoding of `crop` and `market` and a RandomForestRegressor. The provided `prices.json` dataset is small — treat results as illustrative.
