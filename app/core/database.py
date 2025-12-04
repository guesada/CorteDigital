"""
Database - Gerenciamento de conexões e operações
"""
import sqlite3
import os
from contextlib import contextmanager


def get_db_connection():
    """Retorna conexão com banco de dados"""
    db_path = os.getenv('DATABASE_PATH', 'corte_digital.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    """Context manager para conexão com banco"""
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def init_db(app):
    """Inicializa banco de dados"""
    with app.app_context():
        create_tables()
        print("✅ Banco de dados inicializado")


def create_tables():
    """Cria todas as tabelas necessárias"""
    from services import chat_service, notification_service, review_service
    
    # Tabelas do sistema de chat
    chat_service.create_chat_tables()
    
    # Tabelas de notificações
    notification_service.create_notifications_table()
    
    # Tabelas de avaliações
    review_service.create_reviews_table()
    
    print("✅ Tabelas criadas")


def seed_database():
    """Popula banco com dados de teste"""
    # TODO: Implementar seed de dados
    pass
