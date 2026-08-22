"""
Prediction endpoints — matches the TRD API spec (Phase 1 subset):

  GET /api/v1/recession/current          -> latest month's prediction
  GET /api/v1/recession/timeline         -> every month's prediction
  GET /api/v1/recession/month/<YYYY-MM>  -> full breakdown for one month

Episodes/comparator/forecast endpoints come in Phase 2, once the
302-month extended dataset (Scale_4_ExtendData2000) is merged in.
"""

from flask import Blueprint, jsonify
from ml.predict import get_current_prediction, get_all_predictions, get_month_detail

recession_bp = Blueprint("recession", __name__)


@recession_bp.route("/current", methods=["GET"])
def current():
    try:
        return jsonify(get_current_prediction())
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@recession_bp.route("/timeline", methods=["GET"])
def timeline():
    try:
        return jsonify(get_all_predictions())
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@recession_bp.route("/month/<month_str>", methods=["GET"])
def month(month_str):
    try:
        detail = get_month_detail(month_str)
        if detail is None:
            return jsonify({"error": f"No data for month {month_str}"}), 404
        return jsonify(detail)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
