#!/usr/bin/env python3
"""Script para criar a tabela de notificações no banco de dados."""

from app import app
from db import db

def create_notifications_table():
    """Cria a tabela de notificações usando SQLAlchemy."""
    try:
        with app.app_context():
            # Criar todas as tabelas (incluindo notifications)
            db.create_all()
            print("✅ Tabela 'notifications' criada com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao criar tabela: {e}")

if __name__ == "__main__":
    print("🔧 Criando tabela de notificações...")
    create_notifications_table()
