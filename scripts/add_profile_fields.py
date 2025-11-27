"""Adicionar campos de telefone e endereço aos clientes."""
import sys
sys.path.insert(0, '.')

from app import app
from db import db
from sqlalchemy import text

def add_profile_fields():
    """Adiciona colunas telefone e endereco à tabela clientes."""
    with app.app_context():
        try:
            # Adicionar coluna telefone
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE clientes ADD COLUMN telefone VARCHAR(20)'))
                conn.commit()
            print('✅ Coluna telefone adicionada')
        except Exception as e:
            print(f'⚠️ Coluna telefone: {e}')
        
        try:
            # Adicionar coluna endereco
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE clientes ADD COLUMN endereco VARCHAR(300)'))
                conn.commit()
            print('✅ Coluna endereco adicionada')
        except Exception as e:
            print(f'⚠️ Coluna endereco: {e}')
        
        print('✅ Migração concluída!')

if __name__ == '__main__':
    add_profile_fields()
