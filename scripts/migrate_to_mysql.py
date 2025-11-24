"""
Script de migração para MySQL Railway
Testa a conexão e cria as tabelas necessárias
"""

import pymysql
from app import app
from db import db

def test_connection():
    """Testa a conexão com o banco MySQL Railway"""
    try:
        connection = pymysql.connect(
            host='maglev.proxy.rlwy.net',
            port=49057,
            user='root',
            password='uPRPSSlaUKFXRddDlKgQJXICUlOyCIly',
            database='railway',
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        print("✅ Conexão com MySQL Railway estabelecida com sucesso!")
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"📊 Versão do MySQL: {version['VERSION()']}")
            
            cursor.execute("SELECT DATABASE()")
            db_name = cursor.fetchone()
            print(f"🗄️  Database atual: {db_name['DATABASE()']}")
            
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            if tables:
                print(f"📋 Tabelas existentes: {len(tables)}")
                for table in tables:
                    print(f"   - {list(table.values())[0]}")
            else:
                print("📋 Nenhuma tabela encontrada (banco vazio)")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        return False

def create_tables():
    """Cria todas as tabelas no banco de dados"""
    try:
        with app.app_context():
            print("\n🔨 Criando tabelas...")
            db.create_all()
            print("✅ Tabelas criadas com sucesso!")
            
            # Verificar tabelas criadas
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"\n📋 Tabelas no banco ({len(tables)}):")
            for table in tables:
                print(f"   ✓ {table}")
                
            return True
            
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 MIGRAÇÃO PARA MYSQL RAILWAY")
    print("=" * 60)
    print()
    
    # Teste de conexão
    print("1️⃣  Testando conexão com o banco...")
    if not test_connection():
        print("\n❌ Falha na conexão. Verifique as credenciais.")
        return
    
    print("\n" + "=" * 60)
    
    # Criação de tabelas
    print("2️⃣  Criando estrutura do banco...")
    if not create_tables():
        print("\n❌ Falha ao criar tabelas.")
        return
    
    print("\n" + "=" * 60)
    print("✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 60)
    print()
    print("📝 Próximos passos:")
    print("   1. Execute: python app.py")
    print("   2. Acesse: http://localhost:5001")
    print("   3. Crie novos usuários via interface")
    print()

if __name__ == "__main__":
    main()
