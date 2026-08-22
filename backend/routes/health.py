"""
Simple health check endpoint — confirms the API is alive and the
model/dataset load correctly. Hit this first when testing.
"""

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health():
    status = {"api": "ok"}

    try:
        from ml.predict import load_model
        load_model()
        status["model"] = "ok"
    except Exception as e:
        status["model"] = f"error: {str(e)}"

    try:
        from ml.predict import load_dataset
        load_dataset()
        status["dataset"] = "ok"
    except Exception as e:
        status["dataset"] = f"error: {str(e)}"

    return jsonify(status)
