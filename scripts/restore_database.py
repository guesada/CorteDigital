"""
Script para restaurar backup do banco de dados
"""
import shutil
import os
import sys

def restore_database(backup_file):
    """Restaura um backup do banco de dados"""
    
    if not os.path.exists(backup_file):
        print(f"❌ Arquivo de backup não encontrado: {backup_file}")
        return False
    
    db_file = 'database/corte_digital.db'
    
    # Fazer backup do banco atual se existir
    if os.path.exists(db_file):
        backup_current = f'{db_file}.old'
        shutil.copy2(db_file, backup_current)
        print(f"ℹ️  Backup do banco atual salvo em: {backup_current}")
    
    # Restaurar backup
    shutil.copy2(backup_file, db_file)
    
    file_size = os.path.getsize(db_file) / 1024  # KB
    
    print("="*60)
    print("✅ BANCO DE DADOS RESTAURADO COM SUCESSO!")
    print("="*60)
    print(f"\n📁 Arquivo restaurado: {db_file}")
    print(f"📊 Tamanho: {file_size:.2f} KB")
    print("\n🚀 Você pode iniciar o sistema agora!")
    print("="*60 + "\n")
    
    return True

def list_backups():
    """Lista todos os backups disponíveis"""
    backup_dir = 'backups'
    
    if not os.path.exists(backup_dir):
        print("❌ Pasta de backups não encontrada!")
        return []
    
    backups = [f for f in os.listdir(backup_dir) if f.endswith('.db')]
    
    if not backups:
        print("❌ Nenhum backup encontrado!")
        return []
    
    print("="*60)
    print("📦 BACKUPS DISPONÍVEIS")
    print("="*60 + "\n")
    
    for i, backup in enumerate(backups, 1):
        backup_path = os.path.join(backup_dir, backup)
        size = os.path.getsize(backup_path) / 1024
        mtime = os.path.getmtime(backup_path)
        from datetime import datetime
        date = datetime.fromtimestamp(mtime).strftime('%d/%m/%Y %H:%M:%S')
        
        print(f"{i}. {backup}")
        print(f"   Tamanho: {size:.2f} KB")
        print(f"   Data: {date}\n")
    
    return backups

if __name__ == '__main__':
    if len(sys.argv) > 1:
        # Restaurar backup específico
        backup_file = sys.argv[1]
        restore_database(backup_file)
    else:
        # Listar backups e pedir para escolher
        backups = list_backups()
        
        if backups:
            print("="*60)
            try:
                choice = int(input("Digite o número do backup para restaurar (0 para cancelar): "))
                if choice > 0 and choice <= len(backups):
                    backup_file = os.path.join('backups', backups[choice - 1])
                    restore_database(backup_file)
                else:
                    print("❌ Operação cancelada")
            except ValueError:
                print("❌ Entrada inválida")
