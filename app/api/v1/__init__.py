"""
API v1 - Versão 1 da API REST
"""
from flask import Blueprint

# Blueprint principal da API v1
api_v1 = Blueprint('api_v1', __name__)

# Importa rotas
from app.api.v1 import auth, appointments, ai

# Registra sub-blueprints
api_v1.register_blueprint(auth.bp)
api_v1.register_blueprint(appointments.bp)
api_v1.register_blueprint(ai.bp)

__all__ = ['api_v1']
