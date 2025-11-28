"""Script para atualizar o banco de dados com novas tabelas."""
from app import app
from db import db

with app.app_context():
    print("🔄 Atualizando banco de dados...")
    
    # Criar novas tabelas
    db.create_all()
    
    print("✅ Banco de dados atualizado com sucesso!")
    print("📋 Novas tabelas criadas:")
    print("  - reviews (avaliações)")
    print("  - statistics (estatísticas)")
