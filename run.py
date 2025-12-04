"""
Corte Digital - Ponto de entrada da aplicação
Versão 2.0.0 - Arquitetura Profissional
"""
import os
import sys

# Desabilita criação de __pycache__
sys.dont_write_bytecode = True

from app import create_app, socketio

# Cria aplicação
app = create_app()

if __name__ == '__main__':
    # Configurações de execução
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    
    print(f"""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║              🚀 CORTE DIGITAL v2.0.0                     ║
    ║              Arquitetura Profissional                     ║
    ║                                                           ║
    ║  Ambiente: {app.config['ENV'].upper():^43} ║
    ║  Servidor: http://{host}:{port}                        ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    
    📚 Documentação API: http://{host}:{port}/api/v1/docs
    🔧 Health Check: http://{host}:{port}/health
    
    ✨ Features Ativas:
       • ✅ API REST v1
       • ✅ WebSocket (Chat & Notificações)
       • ✅ IA para Recomendações
       • ✅ Sistema de Cache
       • ✅ Validações Avançadas
       • ✅ Rate Limiting
       • ✅ Logging Estruturado
    
    🚀 Iniciando servidor...
    """)
    
    # Inicia servidor com SocketIO
    socketio.run(
        app,
        host=host,
        port=port,
        debug=debug,
        use_reloader=debug
    )
