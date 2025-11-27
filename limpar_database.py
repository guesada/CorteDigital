"""
Script para Limpar o Banco de Dados - Corte Digital
Remove completamente o banco de dados e todos os backups.

⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!
Todos os dados serão perdidos permanentemente.

Uso:
    python limpar_database.py
"""

import os
import shutil
from datetime import datetime

# Configurações
DB_FILE = "corte_digital.db"
BACKUP_DIR = "backups"

def exibir_banner():
    """Exibe banner de aviso."""
    print("\n" + "=" * 60)
    print("⚠️  LIMPEZA COMPLETA DO BANCO DE DADOS")
    print("=" * 60)
    print("\n🚨 ATENÇÃO: Esta operação é IRREVERSÍVEL!")
    print("   Todos os dados serão perdidos permanentemente.\n")

def listar_arquivos():
    """Lista arquivos que serão removidos."""
    arquivos = []
    
    if os.path.exists(DB_FILE):
        size = os.path.getsize(DB_FILE) / 1024  # KB
        arquivos.append(f"   • {DB_FILE} ({size:.2f} KB)")
    
    if os.path.exists(BACKUP_DIR):
        backups = os.listdir(BACKUP_DIR)
        if backups:
            arquivos.append(f"   • Pasta {BACKUP_DIR}/ ({len(backups)} arquivos)")
    
    return arquivos

def confirmar_operacao():
    """Solicita confirmação do usuário."""
    print("📋 Arquivos que serão removidos:")
    
    arquivos = listar_arquivos()
    
    if not arquivos:
        print("   (Nenhum arquivo encontrado)")
        return False
    
    for arquivo in arquivos:
        print(arquivo)
    
    print("\n" + "=" * 60)
    print("⚠️  CONFIRMAÇÃO NECESSÁRIA")
    print("=" * 60)
    
    resposta1 = input("\nDigite 'LIMPAR' para confirmar: ").strip()
    
    if resposta1 != "LIMPAR":
        print("\n❌ Operação cancelada.")
        return False
    
    resposta2 = input("\nTem certeza absoluta? (sim/não): ").strip().lower()
    
    if resposta2 not in ['sim', 's', 'yes', 'y']:
        print("\n❌ Operação cancelada.")
        return False
    
    return True

def criar_backup_final():
    """Cria um backup final antes de deletar."""
    if not os.path.exists(DB_FILE):
        return None
    
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = os.path.join(BACKUP_DIR, f"FINAL_BACKUP_{timestamp}.db")
    
    try:
        shutil.copy2(DB_FILE, backup_file)
        return backup_file
    except Exception as e:
        print(f"⚠️  Erro ao criar backup final: {e}")
        return None

def remover_banco_dados():
    """Remove o arquivo do banco de dados."""
    if os.path.exists(DB_FILE):
        try:
            os.remove(DB_FILE)
            print(f"   ✅ {DB_FILE} removido")
            return True
        except Exception as e:
            print(f"   ❌ Erro ao remover {DB_FILE}: {e}")
            return False
    else:
        print(f"   ℹ️  {DB_FILE} não existe")
        return True

def remover_backups():
    """Remove a pasta de backups."""
    if os.path.exists(BACKUP_DIR):
        try:
            shutil.rmtree(BACKUP_DIR)
            print(f"   ✅ Pasta {BACKUP_DIR}/ removida")
            return True
        except Exception as e:
            print(f"   ❌ Erro ao remover {BACKUP_DIR}/: {e}")
            return False
    else:
        print(f"   ℹ️  Pasta {BACKUP_DIR}/ não existe")
        return True

def limpar_cache():
    """Remove arquivos de cache Python."""
    cache_dirs = ['__pycache__', 'routes/__pycache__']
    removidos = 0
    
    for cache_dir in cache_dirs:
        if os.path.exists(cache_dir):
            try:
                shutil.rmtree(cache_dir)
                removidos += 1
            except Exception:
                pass
    
    if removidos > 0:
        print(f"   ✅ {removidos} pasta(s) de cache removida(s)")

def main():
    """Função principal."""
    exibir_banner()
    
    # Verificar se há algo para limpar
    if not os.path.exists(DB_FILE) and not os.path.exists(BACKUP_DIR):
        print("ℹ️  Nenhum arquivo encontrado para limpar.")
        print("   O banco de dados já está limpo.\n")
        return
    
    # Confirmar operação
    if not confirmar_operacao():
        return
    
    print("\n" + "=" * 60)
    print("🗑️  INICIANDO LIMPEZA")
    print("=" * 60 + "\n")
    
    # Criar backup final (opcional)
    print("💾 Criando backup final de segurança...")
    backup_final = criar_backup_final()
    if backup_final:
        print(f"   ✅ Backup salvo em: {backup_final}")
        print("   ℹ️  Este backup será mantido na pasta backups/")
        
        manter_backup = input("\nDeseja manter este backup? (s/n): ").strip().lower()
        if manter_backup not in ['s', 'sim', 'y', 'yes']:
            try:
                os.remove(backup_final)
                print("   🗑️  Backup final removido")
            except Exception:
                pass
    
    print("\n🗑️  Removendo arquivos...")
    
    # Remover banco de dados
    sucesso_db = remover_banco_dados()
    
    # Remover backups
    sucesso_backup = remover_backups()
    
    # Limpar cache
    limpar_cache()
    
    # Resultado final
    print("\n" + "=" * 60)
    
    if sucesso_db and sucesso_backup:
        print("✅ LIMPEZA CONCLUÍDA COM SUCESSO!")
        print("=" * 60)
        print("\n📋 Próximos passos:")
        print("   1. Execute: python setup_database.py")
        print("   2. Para criar um novo banco de dados\n")
    else:
        print("⚠️  LIMPEZA CONCLUÍDA COM AVISOS")
        print("=" * 60)
        print("\nAlguns arquivos não puderam ser removidos.")
        print("Verifique as mensagens acima.\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário.\n")
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}\n")
