#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de Teste Completo - Corte Digital
Verifica se todas as funcionalidades estão funcionando
"""

import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def test_imports():
    """Testa se todos os módulos podem ser importados"""
    print("🔍 Testando imports...")
    try:
        import flask
        print("  ✅ Flask instalado")
        
        import mysql.connector
        print("  ✅ MySQL Connector instalado")
        
        from flask_cors import CORS
        print("  ✅ Flask-CORS instalado")
        
        import db
        print("  ✅ Módulo db importado")
        
        import services
        print("  ✅ Módulo services importado")
        
        return True
    except ImportError as e:
        print(f"  ❌ Erro ao importar: {e}")
        return False

def test_database_connection():
    """Testa conexão com o banco de dados"""
    print("\n🔍 Testando conexão com banco de dados...")
    try:
        import db
        conn = db.get_db_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            print("  ✅ Conexão com banco de dados OK")
            return True
        else:
            print("  ❌ Não foi possível conectar ao banco")
            return False
    except Exception as e:
        print(f"  ❌ Erro na conexão: {e}")
        return False

def test_database_tables():
    """Verifica se as tabelas existem"""
    print("\n🔍 Verificando tabelas do banco...")
    try:
        import db
        conn = db.get_db_connection()
        cursor = conn.cursor()
        
        tables = ['Cliente', 'Barber', 'Appointment', 'Service']
        for table in tables:
            cursor.execute(f"SHOW TABLES LIKE '{table}'")
            result = cursor.fetchone()
            if result:
                print(f"  ✅ Tabela {table} existe")
            else:
                print(f"  ❌ Tabela {table} não encontrada")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"  ❌ Erro ao verificar tabelas: {e}")
        return False

def test_services_data():
    """Verifica se há serviços cadastrados"""
    print("\n🔍 Verificando serviços cadastrados...")
    try:
        import db
        conn = db.get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT COUNT(*) as total FROM Service")
        result = cursor.fetchone()
        total = result['total']
        
        if total > 0:
            print(f"  ✅ {total} serviço(s) cadastrado(s)")
            
            cursor.execute("SELECT nome, preco FROM Service LIMIT 3")
            services = cursor.fetchall()
            for service in services:
                print(f"     - {service['nome']}: R$ {service['preco']}")
        else:
            print("  ⚠️  Nenhum serviço cadastrado")
            print("     Execute: python scripts/seed_services.py")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"  ❌ Erro ao verificar serviços: {e}")
        return False

def test_barbers_data():
    """Verifica se há barbeiros cadastrados"""
    print("\n🔍 Verificando barbeiros cadastrados...")
    try:
        import db
        conn = db.get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT COUNT(*) as total FROM Barber")
        result = cursor.fetchone()
        total = result['total']
        
        if total > 0:
            print(f"  ✅ {total} barbeiro(s) cadastrado(s)")
            
            cursor.execute("SELECT nome, email FROM Barber LIMIT 3")
            barbers = cursor.fetchall()
            for barber in barbers:
                print(f"     - {barber['nome']} ({barber['email']})")
        else:
            print("  ⚠️  Nenhum barbeiro cadastrado")
            print("     Cadastre um barbeiro pela interface")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"  ❌ Erro ao verificar barbeiros: {e}")
        return False

def test_files_exist():
    """Verifica se os arquivos principais existem"""
    print("\n🔍 Verificando arquivos do projeto...")
    
    files = {
        'app.py': 'Arquivo principal',
        'db.py': 'Módulo de banco de dados',
        'services.py': 'Módulo de serviços',
        'requirements.txt': 'Dependências',
        'static/js/app.js': 'JavaScript principal',
        'static/js/novo-agendamento.js': 'Sistema de agendamento',
        'static/css/dashboard-intuitiva.css': 'CSS do dashboard',
        'static/css/novo-agendamento.css': 'CSS do agendamento',
        'templates/cliente_dashboard.html': 'Dashboard do cliente',
    }
    
    all_exist = True
    for file, desc in files.items():
        if os.path.exists(file):
            print(f"  ✅ {desc}: {file}")
        else:
            print(f"  ❌ {desc} não encontrado: {file}")
            all_exist = False
    
    return all_exist

def print_summary(results):
    """Imprime resumo dos testes"""
    print("\n" + "="*60)
    print("📊 RESUMO DOS TESTES")
    print("="*60)
    
    total = len(results)
    passed = sum(results.values())
    failed = total - passed
    
    for test_name, result in results.items():
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{status} - {test_name}")
    
    print("="*60)
    print(f"Total: {total} testes")
    print(f"✅ Passou: {passed}")
    print(f"❌ Falhou: {failed}")
    print("="*60)
    
    if failed == 0:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("✅ Sistema pronto para apresentação!")
    else:
        print(f"\n⚠️  {failed} teste(s) falharam")
        print("Por favor, corrija os problemas antes da apresentação")
    
    return failed == 0

def main():
    """Executa todos os testes"""
    print("="*60)
    print("🚀 TESTE COMPLETO - CORTE DIGITAL")
    print("="*60)
    
    results = {}
    
    # Executar testes
    results['Imports'] = test_imports()
    results['Arquivos'] = test_files_exist()
    results['Conexão BD'] = test_database_connection()
    results['Tabelas BD'] = test_database_tables()
    results['Serviços'] = test_services_data()
    results['Barbeiros'] = test_barbers_data()
    
    # Imprimir resumo
    success = print_summary(results)
    
    # Retornar código de saída
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
