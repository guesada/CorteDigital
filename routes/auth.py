"""Rotas de autenticação e perfil."""
from flask import Blueprint, jsonify, request, session
from services import authenticate_user, register_user, exigir_login, usuario_atual
from db import db, Cliente, Barber

auth_bp = Blueprint("auth", __name__, url_prefix="/api/users")


@auth_bp.post("/login")
def api_login():
    body = request.get_json() or {}
    email = (body.get("email") or "").strip().lower()
    password = (body.get("password") or "").strip()

    if not email or not password:
        return jsonify({"success": False, "message": "Email e senha obrigatórios"}), 400

    usuario = authenticate_user(email, password)
    if not usuario:
        return jsonify({"success": False, "message": "Credenciais inválidas"}), 401

    session["usuario_email"] = usuario["email"]
    session["usuario_nome"] = usuario["nome"]
    session["usuario_tipo"] = usuario["tipo"]

    return jsonify({
        "success": True,
        "user": {
            "name": usuario["nome"],
            "email": email,
            "userType": usuario["tipo"],
        },
    })


@auth_bp.post("/register")
def api_register():
    body = request.get_json() or {}
    nome = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = (body.get("password") or "").strip()
    tipo = body.get("userType") or "cliente"

    if not all([nome, email, password]):
        return jsonify({"success": False, "message": "Todos os campos obrigatórios"}), 400

    if not register_user(nome, email, password, tipo):
        return jsonify({"success": False, "message": "Email já cadastrado"}), 400
    
    return jsonify({"success": True})


@auth_bp.route("/profile", methods=["GET", "PUT"])
def user_profile():
    """Obter ou atualizar perfil do usuário."""
    if not exigir_login():
        return jsonify({"success": False, "message": "Não autenticado"}), 401
    
    user_data = usuario_atual()
    if not user_data:
        return jsonify({"success": False, "message": "Usuário não encontrado"}), 404
    
    if request.method == "GET":
        return jsonify({"success": True, "data": user_data})
    
    # PUT - Atualizar perfil
    body = request.get_json() or {}
    email = session.get('usuario_email')
    tipo = session.get('usuario_tipo')
    
    # Buscar usuário
    Model = Barber if tipo == 'barbeiro' else Cliente
    user = Model.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({"success": False, "message": "Usuário não encontrado"}), 404
    
    # Atualizar campos permitidos
    if 'nome' in body and body['nome']:
        user.nome = body['nome']
        session['usuario_nome'] = body['nome']  # Atualizar sessão
    
    if 'email' in body and body['email']:
        # Verificar se o email já existe para outro usuário
        existing = Model.query.filter(Model.email == body['email'], Model.id != user.id).first()
        if existing:
            return jsonify({"success": False, "message": "Email já cadastrado"}), 400
        user.email = body['email']
        session['usuario_email'] = body['email']  # Atualizar sessão
    
    if 'telefone' in body:
        user.telefone = body['telefone']
    
    if 'endereco' in body:
        user.endereco = body['endereco']
    
    db.session.commit()
    
    return jsonify({"success": True, "data": user.to_dict()})
