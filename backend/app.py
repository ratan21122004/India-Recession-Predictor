"""
India Recession Predictor — Backend API
Flask application with ML predictions + user management

Run with:
    python app.py
"""

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import init_db
from routes.health import health_bp
from routes.recession import recession_bp
from routes.auth import auth_bp


def create_app():
    """Create and configure Flask app"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize database
    init_db()
    
    # Enable CORS (allow React frontend to call this API)
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:8443",
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:8443",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Register blueprints
    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(recession_bp, url_prefix="/api/v1/recession")
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    
    # Health check root endpoint
    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "message": "India Recession Predictor API",
            "status": "running",
            "version": "1.0.0"
        }), 200
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint not found"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500
    
    return app


if __name__ == "__main__":
    app = create_app()
    
    print("\n" + "="*80)
    print("🇮🇳  INDIA RECESSION PREDICTOR — BACKEND API")
    print("="*80)
    print("✅ Database initialized")
    print("✅ ML model loaded")
    print("✅ CORS enabled for frontend")
    print("")
    print("📍 Running at: http://localhost:5000")
    print("")
    print("📚 API Endpoints:")
    print("   GET  /api/v1/health                     — Health check")
    print("   GET  /api/v1/recession/current          — Latest prediction")
    print("   GET  /api/v1/recession/timeline         — All months predictions")
    print("   GET  /api/v1/recession/month/<YYYY-MM>  — Specific month prediction")
    print("")
    print("🔐 Authentication:")
    print("   POST /api/v1/auth/register              — Register new user")
    print("   POST /api/v1/auth/login                 — Login user")
    print("")
    print("📤 Predictions:")
    print("   POST /api/v1/recession/predict          — Upload CSV & predict (requires token)")
    print("   POST /api/v1/recession/scenario         — Scenario builder (requires token)")
    print("   GET  /api/v1/recession/history          — User prediction history (requires token)")
    print("")
    print("="*80)
    print(f"⚠️  Debug Mode: {app.debug}")
    print("="*80 + "\n")
    
    app.run(debug=True, host="0.0.0.0", port=5000)