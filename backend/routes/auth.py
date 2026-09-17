"""
Authentication routes (login, register)
"""

from flask import Blueprint, request, jsonify
from database import get_db
from auth import hash_password, verify_password, generate_jwt_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user
    
    Request JSON:
    {
        "email": "researcher@example.com",
        "password": "secure_password",
        "username": "Dr. Priya"
    }
    
    Response: { success, token, user_id, email }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        username = data.get('username', email.split('@')[0])
        
        # Validate
        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400
        
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        
        # Check if user exists
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "Email already registered"}), 409
        
        # Create user
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (email, password_hash, username)
            VALUES (?, ?, ?)
        ''', (email, password_hash, username))
        conn.commit()
        
        user_id = cursor.lastrowid
        conn.close()
        
        # Generate token
        token = generate_jwt_token(user_id, email)
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "email": email,
            "username": username,
            "token": token
        }), 201
    
    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login user
    
    Request JSON:
    {
        "email": "researcher@example.com",
        "password": "secure_password"
    }
    
    Response: { success, token, user_id, email, username }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400
        
        # Get user
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id, password_hash, username FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Verify password
        if not verify_password(user['password_hash'], password):
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Generate token
        token = generate_jwt_token(user['id'], email)
        
        return jsonify({
            "success": True,
            "user_id": user['id'],
            "email": email,
            "username": user['username'],
            "token": token
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500