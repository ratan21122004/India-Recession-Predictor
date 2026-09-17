"""
Configuration for India Recession Predictor Backend
"""

import os
from pathlib import Path

class Config:
    """Base configuration"""
    
    # Paths
    BASE_DIR = Path(__file__).parent
    MODEL_DIR = BASE_DIR / "models"
    DATA_DIR = BASE_DIR / "data"
    DATABASE = BASE_DIR / "predictions.db"
    UPLOAD_DIR = BASE_DIR / "uploads"
    
    # Model candidates (will use first one that exists)
    MODEL_CANDIDATES = [
        ("rf_extended_2000", "scaler_extended_2000", "features_extended_2000"),
        ("rf_extended", "scaler_extended", "features_extended"),
    ]
    
    # Dataset candidates
    DATASET_CANDIDATES = [
        "extended_2000_2026.csv",
        "extended_2000_2026_with_sentiment.csv",
        "12_master_ml_dataset.csv",
    ]
    
    # Thresholds for status
    ALERT_THRESHOLD = 0.60
    WATCH_THRESHOLD = 0.40
    
    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"
    DEBUG = True
    
    # Create directories if they don't exist
    MODEL_DIR.mkdir(exist_ok=True)
    DATA_DIR.mkdir(exist_ok=True)
    UPLOAD_DIR.mkdir(exist_ok=True)