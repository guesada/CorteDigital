"""Rotas de autenticação (login e registro)."""

from flask import Blueprint, jsonify, request, session

from services import authenticate_user, register_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/users")


@auth_bp.post("/login")
def api_login():
    body = request.get_json() or {}
    email = (body.get("email") or "").strip().lower()
    password = (body.get("password") or "").strip()

    if not email or not password:
        return jsonify({"success": False, "message": "Email e senha são obrigatórios"}), 400

    usuario = authenticate_user(email, password)
    if not usuario:
        return jsonify({"success": False, "message": "Credenciais inválidas"}), 401

    session["usuario_email"] = usuario["email"]
    session["usuario_nome"] = usuario["nome"]
    session["usuario_tipo"] = usuario["tipo"]

    return jsonify(
        {
            "success": True,
            "user": {
                "name": usuario["nome"],
                "email": email,
                "userType": usuario["tipo"],
            },
        }
    )


@auth_bp.post("/register")
def api_register():
    body = request.get_json() or {}
    nome = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = (body.get("password") or "").strip()
    tipo = body.get("userType") or "cliente"

    if not nome or not email or not password:
        return jsonify({"success": False, "message": "Todos os campos são obrigatórios"}), 400

    ok = register_user(nome, email, password, tipo)
    if not ok:
        return jsonify({"success": False, "message": "Email já cadastrado"}), 400
    return jsonify({"success": True})
