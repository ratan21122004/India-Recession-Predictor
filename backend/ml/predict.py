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

# Handle numpy compatibility
try:
    import numpy as np
except ImportError:
    import sys
    print("⚠️  Warning: numpy import issue detected. Attempting fallback...")
    import numpy as np

from config import Config

_cache = {}  # simple in-memory cache: {"model": ..., "scaler": ..., "features": ..., "df": ...}


def _find_first_existing(directory, candidates):
    """Find first existing file from list of candidates"""
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

    path = _find_first_existing(str(Config.DATA_DIR), Config.DATASET_CANDIDATES)
    if path is None:
        raise FileNotFoundError(
            "No dataset CSV found in backend/data/. "
            "Copy your extended_2000_2026.csv (or newer version) there. "
            f"Looked in: {Config.DATA_DIR}"
        )

    df = pd.read_csv(path, parse_dates=["date"]).sort_values("date").reset_index(drop=True)
    _cache["df"] = df
    print(f"✅ Loaded dataset: {os.path.basename(path)} ({len(df)} rows)")
    return df


def get_status(prob: float) -> str:
    """Determine status from probability"""
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
    for i, row in df_clean.iterrows():
        results.append({
            "date": row["date"].strftime("%Y-%m"),
            "probability": float(probs[i]),
            "status": get_status(probs[i]),
            "recession_label": int(row["recession_label"])
        })

    return results


def get_month_detail(month_str):
    """
    Returns detailed prediction for one month (YYYY-MM format):
    {date, probability, status, signals, explanation, recession_label}
    """
    try:
        # Parse month string
        month_date = pd.to_datetime(month_str)
    except:
        return None

    model, scaler, features, _ = load_model()
    df = load_dataset()

    # Find the row for this month
    mask = (df["date"].dt.year == month_date.year) & (df["date"].dt.month == month_date.month)
    month_rows = df[mask]

    if len(month_rows) == 0:
        return None

    row = month_rows.iloc[0]
    X = scaler.transform([row[features].values])[0]
    prob = model.predict_proba([X])[0, 1]

    # Generate signals (simplified)
    signals = []
    if prob >= Config.ALERT_THRESHOLD:
        signals.append("High recession risk")
    elif prob >= Config.WATCH_THRESHOLD:
        signals.append("Moderate recession signals")
    else:
        signals.append("Low recession risk")

    # Simple explanation
    explanation = f"For {month_str}, the model predicts a {prob:.1%} chance of recession. "
    explanation += "Key drivers: currency depreciation, industrial output, and credit dynamics."

    return {
        "date": month_str,
        "probability": float(prob),
        "status": get_status(prob),
        "signals": " | ".join(signals),
        "explanation": explanation,
        "recession_label": int(row.get("recession_label", 0))
    }


def get_current_prediction():
    """
    Returns the latest month's prediction:
    {date, probability, status, signals, explanation}
    """
    model, scaler, features, _ = load_model()
    df = load_dataset()

    # Get latest month
    latest_row = df.iloc[-1]
    latest_date = latest_row["date"].strftime("%Y-%m")

    X = scaler.transform([latest_row[features].values])[0]
    prob = model.predict_proba([X])[0, 1]

    # Generate signals
    signals = []
    if prob >= Config.ALERT_THRESHOLD:
        signals.append("High recession risk detected")
    elif prob >= Config.WATCH_THRESHOLD:
        signals.append("Moderate recession signals")
    else:
        signals.append("No significant recession signals")

    explanation = f"Latest prediction ({latest_date}): {prob:.1%} chance of recession. "
    explanation += "Monitor USD/INR depreciation and credit growth trends."

    return {
        "date": latest_date,
        "probability": float(prob),
        "status": get_status(prob),
        "signals": " | ".join(signals),
        "explanation": explanation
    }


def predict_on_data(df):
    """
    Run prediction on a DataFrame (from user CSV upload)
    
    Input: DataFrame with required feature columns
    Output: { probability, status, signals, explanation }
    """
    try:
        model, scaler, features, _ = load_model()
        
        # Check for required columns
        missing = set(features) - set(df.columns)
        if missing:
            raise ValueError(f"Missing columns: {', '.join(missing)}")
        
        # Extract features and predict
        X = df[features].values
        X_scaled = scaler.transform(X)
        probs = model.predict_proba(X_scaled)[:, 1]
        
        # Average probability across all rows
        avg_prob = np.mean(probs)
        
        # Determine status
        if avg_prob >= Config.ALERT_THRESHOLD:
            status = "alert"
        elif avg_prob >= Config.WATCH_THRESHOLD:
            status = "watch"
        else:
            status = "normal"
        
        # Generate signals (simplified)
        signals = []
        if avg_prob >= Config.ALERT_THRESHOLD:
            signals.append("High recession probability detected")
        elif avg_prob >= Config.WATCH_THRESHOLD:
            signals.append("Moderate recession signals present")
        else:
            signals.append("No significant recession signals")
        
        # Check trend if multiple months
        if len(df) > 1:
            trend = probs[-1] - probs[0]
            if trend > 0.1:
                signals.append("Recession probability increasing")
            elif trend < -0.1:
                signals.append("Recession probability decreasing")
        
        # Explanation
        explanation = f"Model prediction on {len(df)} months of data shows average recession probability of {avg_prob:.1%}. "
        explanation += "Key drivers: USD/INR depreciation, industrial output trends, and credit growth patterns."
        
        return {
            "probability": float(avg_prob),
            "status": status,
            "signals": " | ".join(signals),
            "explanation": explanation
        }
    
    except Exception as e:
        raise Exception(f"Prediction on data failed: {str(e)}")