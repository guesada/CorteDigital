#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Verificação Rápida do Sistema
"""

import os
import sys

def check_env_file():
    """Verifica se o arquivo .env existe"""
    if os.path.exists('.env'):
        print("✅ Arquivo .env encontrado")
        return True
    else:
        print("❌ Arquivo .env não encontrado")
        print("   Execute: copy .env.example .env")
        return False

def check_python_version():
    """Verifica versão do Python"""
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} (requer 3.8+)")
        return False

def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    deps = ['flask', 'flask_cors', 'pymysql', 'werkzeug', 'flask_sqlalchemy']
    all_installed = True
    
    for dep in deps:
        try:
            __import__(dep)
            print(f"✅ {dep} instalado")
        except ImportError:
            print(f"❌ {dep} não instalado")
            all_installed = False
    
    if not all_installed:
        print("\n   Execute: pip install -r requirements.txt")
    
    return all_installed

def check_files():
    """Verifica se os arquivos principais existem"""
    files = [
        'app.py',
        'db.py',
        'services.py',
        'static/js/app.js',
        'static/js/novo-agendamento.js',
        'templates/cliente_dashboard.html'
    ]
    
    all_exist = True
    for file in files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} não encontrado")
            all_exist = False
    
    return all_exist

def main():
    print("="*60)
    print("🔍 VERIFICAÇÃO RÁPIDA DO SISTEMA")
    print("="*60)
    
    print("\n📌 Versão do Python:")
    py_ok = check_python_version()
    
    print("\n📌 Arquivo de Configuração:")
    env_ok = check_env_file()
    
    print("\n📌 Dependências:")
    deps_ok = check_dependencies()
    
    print("\n📌 Arquivos do Projeto:")
    files_ok = check_files()
    
    print("\n" + "="*60)
    if py_ok and env_ok and deps_ok and files_ok:
        print("✅ SISTEMA OK - PRONTO PARA INICIAR!")
        print("\nPara iniciar o servidor:")
        print("  python app.py")
        print("\nDepois acesse:")
        print("  http://localhost:5001")
    else:
        print("⚠️  CORRIJA OS PROBLEMAS ACIMA ANTES DE INICIAR")
    print("="*60)

if __name__ == '__main__':
    main()
