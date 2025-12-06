"""Services Package - Serviços principais da aplicação."""

# Serviços de autenticação
from .auth_service import (
    authenticate_user,
    register_user,
    exigir_login,
    usuario_atual
)

# Serviços de agendamento
from .appointment_service import (
    list_appointments_for_user,
    list_appointments_for_barber,
    create_appointment,
    cancel_appointment_by_id,
    update_appointment_status,
    auto_complete_past_appointments
)

# Serviços de informações
from .info_service import (
    list_barbers,
    list_services,
    list_notifications,
    report_week
)

# Serviços especializados
try:
    from . import chat_service
    from . import notification_service
    from . import analytics_service
    from . import review_service
except ImportError:
    pass


def init_app(app):
    """Inicializa serviços com a aplicação Flask."""
    from db import db
    import os
    
    # Configurar banco de dados ANTES de init_app
    # Parse DATABASE_URL do .env: root@localhost:3306@pjn%402024@CorteDigital
    from urllib.parse import quote_plus
    database_url = os.getenv('DATABASE_URL', 'root@localhost:3306@pjn%402024@CorteDigital')
    
    # Parse manual (formato customizado)
    parts = database_url.split('@')
    if len(parts) >= 4:
        user = parts[0]
        host_port = parts[1].split(':')
        host = host_port[0]
        port = host_port[1] if len(host_port) > 1 else '3306'
        # Decodifica %40 para @ e depois recodifica para SQLAlchemy
        password_raw = parts[2].replace('%40', '@')
        password = quote_plus(password_raw)
        database = parts[3]
        
        # Formato SQLAlchemy
        sqlalchemy_uri = f'mysql+pymysql://{user}:{password}@{host}:{port}/{database}'
    else:
        # Fallback
        sqlalchemy_uri = 'mysql+pymysql://root:pjn%402024@localhost:3306/CorteDigital'
    
    app.config['SQLALCHEMY_DATABASE_URI'] = sqlalchemy_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        db.create_all()


__all__ = [
    'authenticate_user',
    'register_user',
    'exigir_login',
    'usuario_atual',
    'list_appointments_for_user',
    'list_appointments_for_barber',
    'create_appointment',
    'cancel_appointment_by_id',
    'update_appointment_status',
    'auto_complete_past_appointments',
    'list_barbers',
    'list_services',
    'list_notifications',
    'report_week',
    'init_app',
    'chat_service',
    'notification_service',
    'analytics_service',
    'review_service'
]
