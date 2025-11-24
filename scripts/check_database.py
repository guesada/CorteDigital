"""
Script para verificar o conteúdo do banco de dados MySQL Railway
"""

import pymysql

def check_database():
    """Verifica o conteúdo de todas as tabelas"""
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
        
        print("=" * 60)
        print("📊 VERIFICAÇÃO DO BANCO DE DADOS")
        print("=" * 60)
        print()
        
        with connection.cursor() as cursor:
            # Lista de tabelas
            tables = ['users', 'barbers', 'services', 'appointments', 'products', 'notifications', 'reports']
            
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
                result = cursor.fetchone()
                count = result['count']
                
                print(f"📋 {table.upper()}")
                print(f"   Total de registros: {count}")
                
                if count > 0:
                    cursor.execute(f"SELECT * FROM {table} LIMIT 3")
                    rows = cursor.fetchall()
                    print(f"   Primeiros registros:")
                    for i, row in enumerate(rows, 1):
                        print(f"   {i}. {row}")
                else:
                    print(f"   ⚠️  Tabela vazia")
                
                print()
        
        connection.close()
        
        print("=" * 60)
        print("✅ Verificação concluída!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    check_database()
