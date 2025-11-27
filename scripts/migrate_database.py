"""Migrar dados do banco antigo para o novo."""
import sys
sys.path.insert(0, '.')

from sqlalchemy import create_engine, text
from app import app
from db import db

# Banco antigo (Railway)
OLD_DB = "mysql+pymysql://root:uPRPSSlaUKFXRddDlKgQJXICUlOyCIly@maglev.proxy.rlwy.net:49057/railway"

# Banco novo (Local)
NEW_DB = "mysql+pymysql://root:pjn%402024@localhost:3306/cortedigital"


def migrate_data():
    """Migra todos os dados do banco antigo para o novo."""
    print("🔄 Iniciando migração de dados...")
    
    # Conectar aos bancos
    old_engine = create_engine(OLD_DB)
    
    with app.app_context():
        # Criar todas as tabelas no novo banco
        print("📦 Criando estrutura no novo banco...")
        db.create_all()
        
        # Tabelas para migrar (na ordem correta devido a foreign keys)
        tables = [
            'clientes',
            'barbers', 
            'services',
            'appointments',
            'products',
            'notifications',
            'reports'
        ]
        
        for table in tables:
            try:
                print(f"\n📋 Migrando tabela: {table}")
                
                # Ler dados do banco antigo
                with old_engine.connect() as old_conn:
                    result = old_conn.execute(text(f"SELECT * FROM {table}"))
                    rows = result.fetchall()
                    columns = result.keys()
                    
                    if not rows:
                        print(f"  ⚠️  Tabela {table} está vazia")
                        continue
                    
                    print(f"  📊 Encontrados {len(rows)} registros")
                    
                    # Inserir no novo banco
                    for row in rows:
                        # Criar dicionário com os dados
                        data = dict(zip(columns, row))
                        
                        # Montar query de insert
                        cols = ', '.join(data.keys())
                        placeholders = ', '.join([f":{k}" for k in data.keys()])
                        query = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"
                        
                        try:
                            db.session.execute(text(query), data)
                        except Exception as e:
                            print(f"  ⚠️  Erro ao inserir registro: {e}")
                            continue
                    
                    db.session.commit()
                    print(f"  ✅ {len(rows)} registros migrados")
                    
            except Exception as e:
                print(f"  ❌ Erro ao migrar {table}: {e}")
                db.session.rollback()
                continue
        
        print("\n✅ Migração concluída!")
        print("\n📊 Resumo:")
        
        # Mostrar contagem de registros
        with db.engine.connect() as conn:
            for table in tables:
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    print(f"  {table}: {count} registros")
                except:
                    pass


if __name__ == '__main__':
    migrate_data()
