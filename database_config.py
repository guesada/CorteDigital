"""Configuração de conexão com o banco de dados MySQL."""
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()


def get_database_connection():
    """Retorna uma conexão com o banco de dados MySQL."""
    from urllib.parse import unquote
    
    # Parse DATABASE_URL do .env
    # Formato: root@localhost:3306@pjn%402024@CorteDigital
    database_url = os.getenv('DATABASE_URL', 'root@localhost:3306@pjn%402024@CorteDigital')
    
    # Parse manual (formato customizado)
    parts = database_url.split('@')
    if len(parts) >= 4:
        user = parts[0]
        host_port = parts[1].split(':')
        host = host_port[0]
        port = int(host_port[1]) if len(host_port) > 1 else 3306
        password = unquote(parts[2])  # Decodifica URL encoding (%40 -> @)
        database = parts[3]
    else:
        # Fallback para valores padrão
        user = 'root'
        host = 'localhost'
        port = 3306
        password = 'pjn@2024'
        database = 'CorteDigital'
    
    connection = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False
    )
    
    return connection
