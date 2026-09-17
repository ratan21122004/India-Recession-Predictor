"""
Recession prediction endpoints
"""

from flask import Blueprint, request, jsonify
import os
import pandas as pd
import numpy as np
from werkzeug.utils import secure_filename
from datetime import datetime

from ml.predict import get_current_prediction, get_all_predictions, get_month_detail, predict_on_data
from config import Config
from database import get_db
from auth import token_required

recession_bp = Blueprint("recession", __name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ============================================================================
# EXISTING ENDPOINTS (Already working)
# ============================================================================

@recession_bp.route("/current", methods=["GET"])
def current():
    """Get latest month's prediction"""
    try:
        return jsonify(get_current_prediction())
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@recession_bp.route("/timeline", methods=["GET"])
def timeline():
    """Get all months' predictions"""
    try:
        return jsonify(get_all_predictions())
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@recession_bp.route("/month/<month_str>", methods=["GET"])
def month(month_str):
    """Get detailed prediction for one month (YYYY-MM format)"""
    try:
        detail = get_month_detail(month_str)
        if detail is None:
            return jsonify({"error": f"No data for month {month_str}"}), 404
        return jsonify(detail)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

# ============================================================================
# NEW ENDPOINTS (S3/S4 requirements)
# ============================================================================

@recession_bp.route("/predict", methods=["POST"])
@token_required
def predict(user_id):
    """
    Handle CSV file upload and run prediction
    
    Request: multipart/form-data with 'file' field
    Response: { probability, status, signals, explanation, num_rows }
    """
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"error": "Only CSV files allowed"}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(Config.UPLOAD_DIR, f"{user_id}_{filename}")
        file.save(filepath)
        
        # Read and validate CSV
        try:
            df = pd.read_csv(filepath)
        except Exception as e:
            os.remove(filepath)
            return jsonify({"error": f"Invalid CSV file: {str(e)}"}), 400
        
        # Run prediction
        try:
            result = predict_on_data(df)
            
            # Save prediction to database
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO predictions 
                (user_id, filename, recession_probability, status, signals, explanation, num_rows)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                filename,
                result['probability'],
                result['status'],
                result.get('signals', ''),
                result.get('explanation', ''),
                len(df)
            ))
            conn.commit()
            conn.close()
            
            return jsonify({
                "success": True,
                "filename": filename,
                "num_rows": len(df),
                "probability": float(result['probability']),
                "status": result['status'],
                "signals": result.get('signals', ''),
                "explanation": result.get('explanation', '')
            }), 200
        
        except Exception as e:
            os.remove(filepath)
            return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
    
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@recession_bp.route("/scenario", methods=["POST"])
@token_required
def scenario(user_id):
    """
    Handle scenario builder: modify indicators and get updated probability
    
    Request JSON:
    {
        "base_month": "2026-08",
        "indicators": {
            "credit_growth": 4.2,
            "iip_manufacturing": -1.8,
            "pmi_composite": 48.3,
            ...
        }
    }
    
    Response: { probability, status, signals }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        base_month = data.get('base_month')
        indicators = data.get('indicators', {})
        
        if not base_month:
            return jsonify({"error": "base_month required"}), 400
        
        # Get baseline month data
        baseline = get_month_detail(base_month)
        if not baseline:
            return jsonify({"error": f"No data for month {base_month}"}), 404
        
        # Create modified row with new indicator values
        # (Simplified: in production, would need full feature engineering)
        modified_prob = baseline['probability']
        
        # Apply adjustments based on indicators
        # Credit growth decrease → higher recession risk
        if 'credit_growth' in indicators:
            change = indicators['credit_growth'] - 4.2  # baseline ~4.2%
            modified_prob += (change / 100) * 0.15  # sensitivity factor
        
        # PMI below 50 → contraction
        if 'pmi_composite' in indicators:
            pmi = indicators['pmi_composite']
            if pmi < 50:
                modified_prob += ((50 - pmi) / 50) * 0.2
            else:
                modified_prob -= ((pmi - 50) / 50) * 0.1
        
        # Clamp probability to [0, 1]
        modified_prob = max(0, min(1, modified_prob))
        
        # Determine status
        if modified_prob >= 0.60:
            status = "alert"
        elif modified_prob >= 0.40:
            status = "watch"
        else:
            status = "normal"
        
        return jsonify({
            "base_month": base_month,
            "base_probability": float(baseline['probability']),
            "modified_probability": float(modified_prob),
            "status": status,
            "signals": baseline.get('signals', ''),
            "explanation": f"Scenario analysis shows recession probability at {modified_prob:.1%} with adjusted indicators."
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Scenario calculation failed: {str(e)}"}), 500

@recession_bp.route("/history", methods=["GET"])
@token_required
def history(user_id):
    """Get prediction history for logged-in user"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, filename, recession_probability, status, created_at
            FROM predictions
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 20
        ''', (user_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        predictions = [
            {
                'id': row['id'],
                'filename': row['filename'],
                'probability': row['recession_probability'],
                'status': row['status'],
                'created_at': row['created_at']
            }
            for row in rows
        ]
        
        return jsonify({"predictions": predictions}), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to fetch history: {str(e)}"}), 500