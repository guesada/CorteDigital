"""
Script de Reset Rápido do Banco de Dados - Corte Digital
Remove o banco atual e cria um novo com dados de demonstração.

Uso:
    python reset_database.py
"""

import os
import shutil
from datetime import datetime
import subprocess
import sys

DB_FILE = "corte_digital.db"
BACKUP_DIR = "backups"

def main():
    print("\n" + "=" * 60)
    print("🔄 RESET DO BANCO DE DADOS")
    print("=" * 60)
    
    # Verificar se existe banco
    if os.path.exists(DB_FILE):
        print(f"\n📁 Banco de dados encontrado: {DB_FILE}")
        
        # Criar backup
        if not os.path.exists(BACKUP_DIR):
            os.makedirs(BACKUP_DIR)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = os.path.join(BACKUP_DIR, f"backup_{timestamp}.db")
        
        try:
            shutil.copy2(DB_FILE, backup_file)
            print(f"💾 Backup criado: {backup_file}")
        except Exception as e:
            print(f"⚠️  Erro ao criar backup: {e}")
        
        # Remover banco antigo
        try:
            os.remove(DB_FILE)
            print(f"🗑️  Banco antigo removido")
        except Exception as e:
            print(f"❌ Erro ao remover banco: {e}")
            return
    else:
        print("\nℹ️  Nenhum banco de dados encontrado")
    
    # Criar novo banco
    print("\n🔧 Criando novo banco de dados...")
    print("=" * 60 + "\n")
    
    try:
        result = subprocess.run(
            [sys.executable, "setup_database.py"],
            capture_output=False,
            text=True
        )
        
        if result.returncode == 0:
            print("\n" + "=" * 60)
            print("✅ RESET CONCLUÍDO COM SUCESSO!")
            print("=" * 60)
            print("\n💡 O banco de dados foi recriado com dados de demonstração.")
            print("   Você pode iniciar a aplicação agora.\n")
        else:
            print("\n❌ Erro ao criar novo banco de dados")
    
    except FileNotFoundError:
        print("\n❌ Arquivo setup_database.py não encontrado!")
        print("   Certifique-se de estar na pasta correta do projeto.\n")
    except Exception as e:
        print(f"\n❌ Erro ao executar setup: {e}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada.\n")
