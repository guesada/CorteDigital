"""
Script de Teste de Conexão MySQL
Verifica se o MySQL está acessível com as credenciais configuradas
"""

def test_mysql_connection():
    """Testa a conexão com MySQL"""
    
    print("="*60)
    print("🧪 TESTE DE CONEXÃO MYSQL")
    print("="*60 + "\n")
    
    # Carregar configuração
    try:
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
        from config.config_database import MYSQL_CONFIG
        print("✅ Arquivo config/config_database.py encontrado")
    except ImportError:
        print("❌ Arquivo config/config_database.py não encontrado!")
        print("💡 Crie o arquivo com as credenciais do MySQL")
        return False
    
    print(f"\n📋 Configuração:")
    print(f"   Usuário: {MYSQL_CONFIG['user']}")
    print(f"   Host: {MYSQL_CONFIG['host']}")
    print(f"   Porta: {MYSQL_CONFIG['port']}")
    print(f"   Banco: {MYSQL_CONFIG['database']}")
    print(f"   Senha: {'(configurada)' if MYSQL_CONFIG['password'] else '(vazia)'}")
    
    # Testar PyMySQL
    print(f"\n1️⃣  Verificando PyMySQL...")
    try:
        import pymysql
        print("   ✅ PyMySQL instalado")
    except ImportError:
        print("   ❌ PyMySQL não instalado!")
        print("   💡 Execute: pip install pymysql")
        return False
    
    # Testar conexão
    print(f"\n2️⃣  Testando conexão com MySQL...")
    try:
        connection = pymysql.connect(
            user=MYSQL_CONFIG['user'],
            password=MYSQL_CONFIG['password'],
            host=MYSQL_CONFIG['host'],
            port=MYSQL_CONFIG['port']
        )
        print("   ✅ Conexão estabelecida com sucesso!")
        
        # Verificar versão
        cursor = connection.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()[0]
        print(f"   📊 Versão do MySQL: {version}")
        
        # Listar bancos
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall()]
        print(f"   📁 Bancos disponíveis: {len(databases)}")
        
        # Verificar se corte_digital existe
        if MYSQL_CONFIG['database'] in databases:
            print(f"   ✅ Banco '{MYSQL_CONFIG['database']}' já existe")
            
            # Listar tabelas
            cursor.execute(f"USE {MYSQL_CONFIG['database']}")
            cursor.execute("SHOW TABLES")
            tables = [table[0] for table in cursor.fetchall()]
            
            if tables:
                print(f"   📊 Tabelas encontradas: {len(tables)}")
                for table in tables:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    print(f"      • {table}: {count} registro(s)")
            else:
                print(f"   ℹ️  Banco existe mas está vazio")
        else:
            print(f"   ℹ️  Banco '{MYSQL_CONFIG['database']}' não existe (será criado)")
        
        cursor.close()
        connection.close()
        
        print("\n" + "="*60)
        print("✅ TESTE CONCLUÍDO COM SUCESSO!")
        print("="*60)
        print("\n🚀 Você pode executar: python app.py")
        print("="*60 + "\n")
        
        return True
        
    except pymysql.err.OperationalError as e:
        print(f"   ❌ Erro de conexão: {e}")
        print("\n💡 Possíveis soluções:")
        print("   1. Verifique se o MySQL está rodando")
        print("   2. Verifique usuário e senha em config_database.py")
        print("   3. Verifique se a porta está correta (padrão: 3306)")
        print("   4. Tente conectar manualmente: mysql -u root -p")
        return False
        
    except Exception as e:
        print(f"   ❌ Erro inesperado: {e}")
        return False

if __name__ == '__main__':
    import sys
    success = test_mysql_connection()
    sys.exit(0 if success else 1)
