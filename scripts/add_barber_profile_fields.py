"""Adicionar campos de telefone e endereço aos barbeiros."""
import sys
sys.path.insert(0, '.')

from app import app
from db import db
from sqlalchemy import text

def add_barber_profile_fields():
    """Adiciona colunas telefone e endereco à tabela barbers."""
    with app.app_context():
        try:
            # Adicionar coluna telefone
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE barbers ADD COLUMN telefone VARCHAR(20)'))
                conn.commit()
            print('✅ Coluna telefone adicionada aos barbeiros')
        except Exception as e:
            print(f'⚠️ Coluna telefone: {e}')
        
        try:
            # Adicionar coluna endereco
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE barbers ADD COLUMN endereco VARCHAR(300)'))
                conn.commit()
            print('✅ Coluna endereco adicionada aos barbeiros')
        except Exception as e:
            print(f'⚠️ Coluna endereco: {e}')
        
        print('✅ Migração de barbeiros concluída!')

if __name__ == '__main__':
    add_barber_profile_fields()
