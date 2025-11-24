"""
Script para adicionar serviços padrão
"""

import pymysql

def seed_services():
    print("=" * 60)
    print("✂️  ADICIONANDO SERVIÇOS PADRÃO")
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
    
    services = [
        {
            'nome': 'Corte',
            'preco': 30.0,
            'duracao': 30,
            'descricao': 'Corte de cabelo masculino'
        },
        {
            'nome': 'Barba',
            'preco': 25.0,
            'duracao': 20,
            'descricao': 'Barba completa com acabamento'
        },
        {
            'nome': 'Corte + Barba',
            'preco': 50.0,
            'duracao': 45,
            'descricao': 'Combo completo: corte e barba'
        },
        {
            'nome': 'Sobrancelha',
            'preco': 15.0,
            'duracao': 15,
            'descricao': 'Design de sobrancelha'
        },
        {
            'nome': 'Pigmentação',
            'preco': 80.0,
            'duracao': 60,
            'descricao': 'Pigmentação de barba ou cabelo'
        }
    ]
    
    try:
        with connection.cursor() as cursor:
            # Limpar serviços existentes
            cursor.execute("DELETE FROM services")
            
            # Inserir serviços
            for service in services:
                cursor.execute(
                    """INSERT INTO services (nome, preco, duracao, descricao) 
                       VALUES (%s, %s, %s, %s)""",
                    (service['nome'], service['preco'], service['duracao'], service['descricao'])
                )
                print(f"   ✓ {service['nome']} - R$ {service['preco']:.2f}")
            
            connection.commit()
            print()
            print(f"✅ {len(services)} serviços adicionados!")
            
    finally:
        connection.close()
    
    print("=" * 60)

if __name__ == "__main__":
    seed_services()
