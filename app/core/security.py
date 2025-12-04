"""
Security - Autenticação e autorização
"""
from functools import wraps
from flask import session, jsonify


def require_auth(f):
    """Decorator que requer autenticação"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401
        return f(*args, **kwargs)
    return decorated_function


def require_role(role):
    """Decorator que requer role específica"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'success': False, 'message': 'Não autenticado'}), 401
            
            user_role = session.get('user_role', 'cliente')
            if user_role != role:
                return jsonify({'success': False, 'message': 'Sem permissão'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
