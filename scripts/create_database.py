"""Criar banco de dados cortedigital."""
import pymysql

def create_database():
    """Cria o banco de dados cortedigital se não existir."""
    try:
        # Conectar ao MySQL sem especificar banco
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='pjn@2024',
            port=3306
        )
        
        cursor = connection.cursor()
        
        # Criar banco se não existir
        cursor.execute("CREATE DATABASE IF NOT EXISTS cortedigital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print("✅ Banco de dados 'cortedigital' criado/verificado com sucesso!")
        
        # Verificar se foi criado
        cursor.execute("SHOW DATABASES LIKE 'cortedigital'")
        result = cursor.fetchone()
        
        if result:
            print("✅ Banco de dados está pronto para uso!")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Erro ao criar banco de dados: {e}")
        print("\nVerifique:")
        print("  1. MySQL está rodando")
        print("  2. Usuário 'root' existe")
        print("  3. Senha 'pjn@2024' está correta")


if __name__ == '__main__':
    create_database()
