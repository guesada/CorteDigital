"""
Script para testar autenticação e sessão
"""

import requests

BASE_URL = "http://127.0.0.1:5001"

def test_auth():
    print("=" * 60)
    print("🔐 TESTE DE AUTENTICAÇÃO")
    print("=" * 60)
    print()
    
    # Criar sessão para manter cookies
    session = requests.Session()
    
    # 1. Tentar acessar appointments sem login
    print("1️⃣  Tentando acessar /api/appointments sem login...")
    response = session.get(f"{BASE_URL}/api/appointments")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print()
    
    # 2. Registrar novo usuário
    print("2️⃣  Registrando novo usuário...")
    register_data = {
        "name": "Teste Cliente",
        "email": "teste@cliente.com",
        "password": "123456",
        "userType": "cliente"
    }
    response = session.post(f"{BASE_URL}/api/users/register", json=register_data)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print()
    
    # 3. Fazer login
    print("3️⃣  Fazendo login...")
    login_data = {
        "email": "teste@cliente.com",
        "password": "123456"
    }
    response = session.post(f"{BASE_URL}/api/users/login", json=login_data)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print(f"   Cookies: {session.cookies.get_dict()}")
    print()
    
    # 4. Tentar acessar appointments COM login
    print("4️⃣  Tentando acessar /api/appointments COM login...")
    response = session.get(f"{BASE_URL}/api/appointments")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print()
    
    # 5. Verificar barbeiros
    print("5️⃣  Listando barbeiros...")
    response = session.get(f"{BASE_URL}/api/barbers")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print()
    
    # 6. Verificar serviços
    print("6️⃣  Listando serviços...")
    response = session.get(f"{BASE_URL}/api/services")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print()
    
    print("=" * 60)
    if response.status_code == 200:
        print("✅ AUTENTICAÇÃO FUNCIONANDO!")
    else:
        print("❌ PROBLEMA NA AUTENTICAÇÃO")
    print("=" * 60)

if __name__ == "__main__":
    print("\n⚠️  Certifique-se de que o servidor está rodando em http://127.0.0.1:5001\n")
    input("Pressione ENTER para continuar...")
    test_auth()
