"""
Central configuration. Change DATA_DIR / MODEL_DIR here if you move files.
"""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    # Where your CSV datasets live (copy your 12_master_ml_dataset.csv etc. here)
    DATA_DIR = os.path.join(BASE_DIR, "data")

    # Where your trained model .pkl files live (rf_ft_finbert.pkl, scaler_*.pkl, features_*.pkl)
    MODEL_DIR = os.path.join(BASE_DIR, "models")

    # Where downloaded policy documents + FinBERT scores live
    POLICY_DIR = os.path.join(BASE_DIR, "policy_docs")

    # Alert / watch thresholds (from your PRD)
    ALERT_THRESHOLD = 0.60
    WATCH_THRESHOLD = 0.20

    # Model file name candidates, tried in order (matches your Streamlit notebook logic)
    MODEL_CANDIDATES = [
        ("rf_ft_finbert", "scaler_ft_finbert", "features_ft_finbert"),
        ("rf_scaled_v1", "scaler_scaled_v1", "features_scaled_v1"),
        ("rf_targeted", "scaler_targeted", "features_targeted"),
    ]

    # Dataset file candidates, tried in order
    DATASET_CANDIDATES = [
        "15_master_ft_finbert.csv",
        "14_master_scaled_features.csv",
        "13_master_ml_enhanced.csv",
        "12_master_ml_dataset.csv",
    ]
