"""
Corte Digital - Sistema Profissional de Agendamento
Versão 2.0.0
"""
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

from app.core.config import get_config
from app.core.database import init_db
from app.core.exceptions import register_error_handlers

# Instância global do SocketIO
socketio = SocketIO()


def create_app(config_name=None):
    """
    Cria e configura a aplicação Flask
    
    Args:
        config_name: Nome do ambiente (development, production)
        
    Returns:
        Flask app configurada
    """
    app = Flask(__name__)
    
    # Carrega configurações
    config = get_config(config_name)
    app.config.from_object(config)
    
    # Inicializa extensões
    CORS(app, 
         origins=app.config['CORS_ORIGINS'],
         supports_credentials=app.config['CORS_SUPPORTS_CREDENTIALS'])
    
    socketio.init_app(
        app,
        cors_allowed_origins=app.config['CORS_ORIGINS'],
        async_mode=app.config['SOCKETIO_ASYNC_MODE']
    )
    
    # Inicializa banco de dados
    init_db(app)
    
    # Registra blueprints
    register_blueprints(app)
    
    # Registra error handlers
    register_error_handlers(app)
    
    print(f"✅ App inicializada - Ambiente: {app.config['ENV']}")
    
    return app


def register_blueprints(app):
    """Registra todos os blueprints"""
    
    # API v1
    from app.api.v1 import api_v1
    app.register_blueprint(api_v1, url_prefix='/api/v1')
    
    # Rotas legacy
    from routes import register_routes
    from routes.chat import register_chat_routes, register_socketio_events
    from routes.notifications import register_notifications_routes, register_notification_events
    from routes.analytics import register_analytics_routes
    from routes.reviews import register_reviews_routes
    
    register_routes(app)
    register_chat_routes(app)
    register_notifications_routes(app)
    register_analytics_routes(app)
    register_reviews_routes(app, socketio)
    
    # Eventos SocketIO
    register_socketio_events(socketio)
    register_notification_events(socketio)
    
    print("✅ Blueprints registrados")


__version__ = '2.0.0'
