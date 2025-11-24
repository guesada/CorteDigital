"""
Script para recriar tabelas com nova estrutura
"""

import pymysql
from app import app
from db import db

def recreate():
    print("=" * 60)
    print("🔄 RECRIANDO TABELAS")
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
            # 1. Dropar todas as tabelas
            print("1️⃣  Removendo tabelas antigas...")
            tables = ['users', 'barbers', 'clientes']
            for table in tables:
                try:
                    cursor.execute(f"DROP TABLE IF EXISTS {table}")
                    print(f"   ✓ {table}")
                except:
                    pass
            connection.commit()
            print("   ✅ Tabelas removidas")
            print()
            
            # 2. Criar novas tabelas
            print("2️⃣  Criando novas tabelas...")
            with app.app_context():
                db.create_all()
            print("   ✅ Tabelas criadas")
            print()
            
            # 3. Inserir dados de teste
            print("3️⃣  Inserindo dados de teste...")
            
            # Cliente de teste
            cursor.execute(
                "INSERT INTO clientes (nome, email, senha) VALUES (%s, %s, %s)",
                ('Leonardo', 'leoguesada08@gmail.com', 'paocomleite')
            )
            print("   ✓ Cliente: Leonardo")
            
            # Barbeiro de teste
            horarios = '["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]'
            especialidades = '["Corte", "Barba", "Corte + Barba"]'
            
            cursor.execute(
                """INSERT INTO barbers 
                   (nome, email, senha, foto, especialidades, avaliacao, preco_base, disponibilidade) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    'Miguel',
                    'migray007@gmail.com',
                    'paocomleite124!',
                    'https://via.placeholder.com/150',
                    especialidades,
                    5.0,
                    50.0,
                    horarios
                )
            )
            print("   ✓ Barbeiro: Miguel")
            
            connection.commit()
            print("   ✅ Dados inseridos")
            print()
            
            # 4. Verificar resultado
            print("4️⃣  Verificando resultado...")
            cursor.execute("SELECT * FROM clientes")
            clientes = cursor.fetchall()
            print(f"   - Clientes: {len(clientes)}")
            for c in clientes:
                print(f"     • {c['nome']} ({c['email']})")
            
            cursor.execute("SELECT * FROM barbers")
            barbers = cursor.fetchall()
            print(f"   - Barbeiros: {len(barbers)}")
            for b in barbers:
                print(f"     • {b['nome']} ({b['email']})")
            print()
            
    finally:
        connection.close()
    
    print("=" * 60)
    print("✅ RECRIAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 60)
    print()
    print("📝 Estrutura:")
    print("   - Tabela 'clientes' (apenas clientes)")
    print("   - Tabela 'barbers' (barbeiros com login)")
    print()
    print("🎯 Próximos passos:")
    print("   1. Reinicie o servidor: python app.py")
    print("   2. Login como cliente: leoguesada08@gmail.com / paocomleite")
    print("   3. Login como barbeiro: migray007@gmail.com / paocomleite124!")
    print("   4. Barbeiros agora aparecem na lista!")
    print()

if __name__ == "__main__":
    recreate()
