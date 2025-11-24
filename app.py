from flask import Flask, jsonify
from flask_cors import CORS

from routes import register_routes
import services

app = Flask(__name__)

# Configurar CORS para permitir credenciais (cookies de sessão)
CORS(app, supports_credentials=True, origins=["http://localhost:5001", "http://127.0.0.1:5001"])

app.secret_key = "corte_digital_2025_secret_key"
app.config["JSON_SORT_KEYS"] = False
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True

# Inicializa a conexão com o banco e dados iniciais
services.init_app(app)

register_routes(app)


@app.errorhandler(404)
def handler_404(_):
    return jsonify({"success": False, "message": "Rota não encontrada"}), 404


@app.errorhandler(500)
def handler_500(erro):
    return jsonify({"success": False, "message": str(erro)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
