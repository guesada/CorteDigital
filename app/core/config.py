"""
Configurações Centralizadas da Aplicação
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuração base"""
    
    # App
    APP_NAME = "Corte Digital"
    APP_VERSION = "2.0.0"
    SECRET_KEY = os.getenv('SECRET_KEY', 'corte_digital_2025_secret_key')
    
    # Database
    DATABASE_PATH = os.getenv('DATABASE_PATH', 'corte_digital.db')
    
    # Session
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # CORS
    CORS_ORIGINS = ['http://localhost:5001', 'http://127.0.0.1:5001']
    CORS_SUPPORTS_CREDENTIALS = True
    
    # SocketIO
    SOCKETIO_MESSAGE_QUEUE = None
    SOCKETIO_ASYNC_MODE = 'threading'
    
    # Logging
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'logs/app.log'
    LOG_MAX_BYTES = 10485760
    LOG_BACKUP_COUNT = 10
    
    # Cache
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300


class DevelopmentConfig(Config):
    """Desenvolvimento"""
    DEBUG = True
    ENV = 'development'
    LOG_LEVEL = 'DEBUG'


class ProductionConfig(Config):
    """Produção"""
    DEBUG = False
    ENV = 'production'
    SESSION_COOKIE_SECURE = True
    SOCKETIO_ASYNC_MODE = 'gevent'


def get_config(env_name=None):
    """Retorna configuração baseada no ambiente"""
    if env_name is None:
        env_name = os.getenv('FLASK_ENV', 'development')
    
    configs = {
        'development': DevelopmentConfig,
        'production': ProductionConfig
    }
    
    return configs.get(env_name, DevelopmentConfig)
