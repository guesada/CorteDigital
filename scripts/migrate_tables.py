"""
Script para migrar estrutura de tabelas:
- users -> clientes (apenas clientes)
- barbeiros vão para tabela barbers
"""

import pymysql
from app import app
from db import db

def migrate():
    print("=" * 60)
    print("🔄 MIGRAÇÃO DE TABELAS")
    print("=" * 60)
    print()
    
    connection = pymysql.connect(
        host='maglev.proxy.rlwy.net',
        port=49057,
        user='root',
        password='uPRPSSlaUKFXRddDlKgQJXICUlOyCIly',
        database='railway',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    try:
        with connection.cursor() as cursor:
            # 1. Buscar usuários existentes
            print("1️⃣  Buscando usuários existentes...")
            cursor.execute("SELECT * FROM users")
            users = cursor.fetchall()
            print(f"   Encontrados: {len(users)} usuários")
            
            clientes = [u for u in users if u['tipo'] == 'cliente']
            barbeiros = [u for u in users if u['tipo'] == 'barbeiro']
            print(f"   - Clientes: {len(clientes)}")
            print(f"   - Barbeiros: {len(barbeiros)}")
            print()
            
            # 2. Dropar tabelas antigas
            print("2️⃣  Removendo tabelas antigas...")
            cursor.execute("DROP TABLE IF EXISTS users")
            cursor.execute("DROP TABLE IF EXISTS barbers")
            connection.commit()
            print("   ✅ Tabelas removidas")
            print()
            
            # 3. Criar novas tabelas
            print("3️⃣  Criando novas tabelas...")
            with app.app_context():
                db.create_all()
            print("   ✅ Tabelas criadas")
            print()
            
            # 4. Migrar clientes
            print("4️⃣  Migrando clientes...")
            for cliente in clientes:
                cursor.execute(
                    "INSERT INTO clientes (nome, email, senha) VALUES (%s, %s, %s)",
                    (cliente['nome'], cliente['email'], cliente['senha'])
                )
            connection.commit()
            print(f"   ✅ {len(clientes)} clientes migrados")
            print()
            
            # 5. Migrar barbeiros
            print("5️⃣  Migrando barbeiros...")
            horarios = '["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]'
            especialidades = '["Corte", "Barba", "Corte + Barba"]'
            
            for barbeiro in barbeiros:
                cursor.execute(
                    """INSERT INTO barbers 
                       (nome, email, senha, foto, especialidades, avaliacao, preco_base, disponibilidade) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                    (
                        barbeiro['nome'],
                        barbeiro['email'],
                        barbeiro['senha'],
                        'https://via.placeholder.com/150',
                        especialidades,
                        5.0,
                        50.0,
                        horarios
                    )
                )
            connection.commit()
            print(f"   ✅ {len(barbeiros)} barbeiros migrados")
            print()
            
            # 6. Verificar resultado
            print("6️⃣  Verificando resultado...")
            cursor.execute("SELECT COUNT(*) as count FROM clientes")
            count_clientes = cursor.fetchone()['count']
            print(f"   - Clientes na nova tabela: {count_clientes}")
            
            cursor.execute("SELECT COUNT(*) as count FROM barbers")
            count_barbers = cursor.fetchone()['count']
            print(f"   - Barbeiros na nova tabela: {count_barbers}")
            print()
            
    finally:
        connection.close()
    
    print("=" * 60)
    print("✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 60)
    print()
    print("📝 Resumo:")
    print(f"   - Tabela 'users' removida")
    print(f"   - Tabela 'clientes' criada com {len(clientes)} registros")
    print(f"   - Tabela 'barbers' atualizada com {len(barbeiros)} registros")
    print()
    print("🎯 Próximos passos:")
    print("   1. Reinicie o servidor: python app.py")
    print("   2. Faça login como cliente ou barbeiro")
    print("   3. Barbeiros agora aparecem na lista!")
    print()

if __name__ == "__main__":
    migrate()
