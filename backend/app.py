"""
India Recession Predictor — Backend
Phase 1: Flask API serving predictions from the trained RandomForest model.
No database yet (that's Phase 2). Data is read directly from CSV/pkl files.

Run with:
    python app.py
"""

from flask import Flask
from flask_cors import CORS

from config import Config
from routes.health import health_bp
from routes.recession import recession_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow the React frontend (running on localhost:8443) to call this API
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(recession_bp, url_prefix="/api/v1/recession")

    return app


if __name__ == "__main__":
    app = create_app()
    print("\n🇮🇳  India Recession Predictor API")
    print("   Running at: http://localhost:5000")
    print("   Health check: http://localhost:5000/api/v1/health\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
