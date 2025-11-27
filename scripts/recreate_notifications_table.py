#!/usr/bin/env python3
"""Script para recriar a tabela de notificações com a estrutura correta."""

from app import app
from db import db, Notification

def recreate_notifications_table():
    """Dropa e recria a tabela de notificações."""
    try:
        with app.app_context():
            # Dropar tabela se existir
            print("🗑️  Dropando tabela antiga...")
            db.session.execute(db.text("DROP TABLE IF EXISTS notifications"))
            db.session.commit()
            
            # Criar nova tabela
            print("🔧 Criando nova tabela...")
            Notification.__table__.create(db.engine)
            
            print("✅ Tabela 'notifications' recriada com sucesso!")
            print("\n📋 Estrutura da tabela:")
            print("  - id (INT, PRIMARY KEY)")
            print("  - user_id (INT, NOT NULL)")
            print("  - title (VARCHAR(255), NOT NULL)")
            print("  - message (TEXT, NOT NULL)")
            print("  - type (VARCHAR(50), DEFAULT 'info')")
            print("  - data (TEXT)")
            print("  - created_at (DATETIME)")
            print("  - is_read (BOOLEAN, DEFAULT FALSE)")
        
    except Exception as e:
        print(f"❌ Erro ao recriar tabela: {e}")

if __name__ == "__main__":
    print("🔧 Recriando tabela de notificações...")
    recreate_notifications_table()
