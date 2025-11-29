from flask import Flask, jsonify
from flask_cors import CORS
import os

from routes import register_routes
from db import db

app = Flask(__name__)

# Configurar CORS para permitir credenciais (cookies de sessão)
CORS(app, supports_credentials=True, origins=["http://localhost:5001", "http://127.0.0.1:5001"])

app.secret_key = "corte_digital_2025_secret_key"
app.config["JSON_SORT_KEYS"] = False
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True

# ===== CONFIGURAÇÃO DO BANCO DE DADOS =====
# Usar SQLite local para portabilidade
db_path = os.path.join(os.path.dirname(__file__), 'corte_digital.db')
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Inicializar banco de dados
db.init_app(app)

# Criar tabelas e popular com dados de exemplo se necessário
with app.app_context():
    from init_database import init_database_with_sample_data
    init_database_with_sample_data(app, db)

register_routes(app)


@app.errorhandler(404)
def handler_404(_):
    return jsonify({"success": False, "message": "Rota não encontrada"}), 404


@app.errorhandler(500)
def handler_500(erro):
    return jsonify({"success": False, "message": str(erro)}), 500


@app.errorhandler(Exception)
def handler_exception(erro):
    """Captura todos os erros não tratados."""
    import traceback
    traceback.print_exc()
    return jsonify({"success": False, "message": str(erro)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
