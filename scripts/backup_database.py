"""
Script para fazer backup do banco de dados
Útil para transferir dados entre máquinas
"""
import shutil
import os
from datetime import datetime

def backup_database():
    """Cria um backup do banco de dados atual"""
    
    db_file = 'database/corte_digital.db'
    
    if not os.path.exists(db_file):
        print("❌ Banco de dados não encontrado!")
        return
    
    # Criar pasta de backups se não existir
    backup_dir = 'backups'
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    # Nome do backup com timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = os.path.join(backup_dir, f'corte_digital_backup_{timestamp}.db')
    
    # Copiar arquivo
    shutil.copy2(db_file, backup_file)
    
    file_size = os.path.getsize(backup_file) / 1024  # KB
    
    print("="*60)
    print("✅ BACKUP CRIADO COM SUCESSO!")
    print("="*60)
    print(f"\n📁 Arquivo: {backup_file}")
    print(f"📊 Tamanho: {file_size:.2f} KB")
    print(f"🕐 Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("\n💡 Para restaurar em outra máquina:")
    print("   1. Copie o arquivo de backup")
    print("   2. Renomeie para 'corte_digital.db'")
    print("   3. Coloque na pasta do projeto")
    print("   4. Execute o app.py")
    print("="*60 + "\n")

if __name__ == '__main__':
    backup_database()
