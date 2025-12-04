"""
Exceptions - Tratamento centralizado de erros
"""
from flask import jsonify
from werkzeug.exceptions import HTTPException


class APIException(Exception):
    """Exceção base da API"""
    status_code = 400
    
    def __init__(self, message, status_code=None, payload=None):
        super().__init__()
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload
    
    def to_dict(self):
        rv = dict(self.payload or ())
        rv['success'] = False
        rv['message'] = self.message
        return rv


class ValidationError(APIException):
    """Erro de validação"""
    status_code = 400


class AuthenticationError(APIException):
    """Erro de autenticação"""
    status_code = 401


class AuthorizationError(APIException):
    """Erro de autorização"""
    status_code = 403


class NotFoundError(APIException):
    """Recurso não encontrado"""
    status_code = 404


class ConflictError(APIException):
    """Conflito de dados"""
    status_code = 409


class RateLimitError(APIException):
    """Limite de requisições excedido"""
    status_code = 429


def register_error_handlers(app):
    """Registra handlers de erro"""
    
    @app.errorhandler(APIException)
    def handle_api_exception(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return jsonify({
            'success': False,
            'message': error.description
        }), error.code
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Recurso não encontrado'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Erro interno: {error}')
        return jsonify({
            'success': False,
            'message': 'Erro interno do servidor'
        }), 500
    
    print("✅ Error handlers registrados")
