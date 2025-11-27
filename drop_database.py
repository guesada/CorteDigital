"""
Script para Deletar o Banco de Dados - Corte Digital
Remove apenas o arquivo do banco de dados (sem backup).

⚠️  ATENÇÃO: Operação irreversível!

Uso:
    python drop_database.py
"""

import os

DB_FILE = "corte_digital.db"

def main():
    print("\n" + "=" * 60)
    print("🗑️  DROP DATABASE")
    print("=" * 60)
    
    if not os.path.exists(DB_FILE):
        print(f"\nℹ️  Arquivo '{DB_FILE}' não existe.")
        print("   Nada para deletar.\n")
        return
    
    # Mostrar informações do arquivo
    size = os.path.getsize(DB_FILE) / 1024  # KB
    print(f"\n📁 Arquivo encontrado: {DB_FILE}")
    print(f"📊 Tamanho: {size:.2f} KB")
    
    # Confirmar
    print("\n⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!")
    resposta = input("Deseja deletar o banco de dados? (s/N): ").strip().lower()
    
    if resposta not in ['s', 'sim', 'y', 'yes']:
        print("\n❌ Operação cancelada.\n")
        return
    
    # Deletar
    try:
        os.remove(DB_FILE)
        print(f"\n✅ Arquivo '{DB_FILE}' deletado com sucesso!")
        print("\n💡 Para criar um novo banco, execute:")
        print("   python setup_database.py\n")
    except Exception as e:
        print(f"\n❌ Erro ao deletar arquivo: {e}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada.\n")
