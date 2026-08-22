"""
Loads the trained RandomForest model + dataset, and generates predictions.
This ports the logic from your Streamlit prototype (RM_Scale_3) into
reusable functions the Flask routes can call.

Everything is cached in memory after the first load (like @st.cache_resource
in Streamlit) so repeated API calls are fast.
"""

import os
import pickle
import pandas as pd
import numpy as np

from config import Config

_cache = {}  # simple in-memory cache: {"model": ..., "scaler": ..., "features": ..., "df": ...}


def _find_first_existing(directory, candidates):
    for name in candidates:
        path = os.path.join(directory, name)
        if os.path.exists(path):
            return path
    return None


def load_model():
    """Load the trained RandomForest model, scaler, and feature list."""
    if "model" in _cache:
        return _cache["model"], _cache["scaler"], _cache["features"], _cache["model_name"]

    for prefix, scaler_prefix, features_prefix in Config.MODEL_CANDIDATES:
        model_path = os.path.join(Config.MODEL_DIR, f"{prefix}.pkl")
        scaler_path = os.path.join(Config.MODEL_DIR, f"{scaler_prefix}.pkl")
        features_path = os.path.join(Config.MODEL_DIR, f"{features_prefix}.pkl")

        if os.path.exists(model_path) and os.path.exists(scaler_path) and os.path.exists(features_path):
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            with open(scaler_path, "rb") as f:
                scaler = pickle.load(f)
            with open(features_path, "rb") as f:
                features = pickle.load(f)

            _cache["model"] = model
            _cache["scaler"] = scaler
            _cache["features"] = features
            _cache["model_name"] = prefix

            print(f"✅ Loaded model: {prefix}")
            return model, scaler, features, prefix

    raise FileNotFoundError(
        "No trained model found in backend/models/. "
        "Copy your rf_*.pkl, scaler_*.pkl, and features_*.pkl files there. "
        f"Looked in: {Config.MODEL_DIR}"
    )


def load_dataset():
    """Load the master ML dataset (whichever version exists)."""
    if "df" in _cache:
        return _cache["df"]

    path = _find_first_existing(Config.DATA_DIR, Config.DATASET_CANDIDATES)
    if path is None:
        raise FileNotFoundError(
            "No dataset CSV found in backend/data/. "
            "Copy your 12_master_ml_dataset.csv (or newer version) there. "
            f"Looked in: {Config.DATA_DIR}"
        )

    df = pd.read_csv(path, parse_dates=["date"]).sort_values("date").reset_index(drop=True)
    _cache["df"] = df
    print(f"✅ Loaded dataset: {os.path.basename(path)} ({len(df)} rows)")
    return df


def get_status(prob: float) -> str:
    if prob >= Config.ALERT_THRESHOLD:
        return "alert"
    elif prob >= Config.WATCH_THRESHOLD:
        return "watch"
    return "normal"


def get_all_predictions():
    """
    Returns a list of dicts, one per month:
    {date, probability, status, recession_label}
    """
    model, scaler, features, _ = load_model()
    df = load_dataset()

    df_clean = df[features + ["recession_label", "date"]].dropna().reset_index(drop=True)
    X = scaler.transform(df_clean[features].values)
    probs = model.predict_proba(X)[:, 1]

    results = []
    for i in range(len(df_clean)):
        results.append({
            "date": df_clean["date"].iloc[i].strftime("%Y-%m-%d"),
            "month": df_clean["date"].iloc[i].strftime("%Y-%m"),
            "probability": round(float(probs[i]), 4),
            "status": get_status(probs[i]),
            "recession_label": int(df_clean["recession_label"].iloc[i]),
        })
    return results


def get_current_prediction():
    """Returns the latest month's prediction with top contributing features."""
    model, scaler, features, model_name = load_model()
    all_preds = get_all_predictions()
    latest = all_preds[-1]

    # Top 5 most important features (global importance, not per-prediction SHAP —
    # that's a Phase 2 upgrade once you wire in the `shap` library)
    importances = model.feature_importances_
    top_idx = np.argsort(importances)[::-1][:5]
    top_features = [
        {"feature": features[i], "importance": round(float(importances[i]), 4)}
        for i in top_idx
    ]

    return {
        "date": latest["date"],
        "month": latest["month"],
        "probability": latest["probability"],
        "status": latest["status"],
        "model_version": model_name,
        "top_features": top_features,
    }


def get_month_detail(month_str: str):
    """
    month_str format: 'YYYY-MM'
    Returns full indicator breakdown for that month, or None if not found.
    """
    model, scaler, features, model_name = load_model()
    df = load_dataset()

    df["month"] = df["date"].dt.strftime("%Y-%m")
    row = df[df["month"] == month_str]

    if row.empty:
        return None

    row = row.iloc[0]
    X = scaler.transform(row[features].values.reshape(1, -1))
    prob = float(model.predict_proba(X)[0, 1])

    indicators = {f: (None if pd.isna(row[f]) else round(float(row[f]), 4)) for f in features}

    return {
        "date": row["date"].strftime("%Y-%m-%d"),
        "month": month_str,
        "probability": round(prob, 4),
        "status": get_status(prob),
        "recession_label": int(row["recession_label"]) if not pd.isna(row["recession_label"]) else None,
        "indicators": indicators,
    }
