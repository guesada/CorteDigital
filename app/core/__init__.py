"""
Core - Módulos fundamentais da aplicação
"""
from app.core.config import get_config
from app.core.database import get_db_connection
from app.core.security import require_auth, require_role

__all__ = [
    'get_config',
    'get_db_connection',
    'require_auth',
    'require_role'
]
