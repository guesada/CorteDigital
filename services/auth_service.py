"""Serviço de autenticação e autorização."""
from flask import session
from db import db, Cliente, Barber
from werkzeug.security import generate_password_hash, check_password_hash


def authenticate_user(email, password):
    """Autentica um usuário (cliente ou barbeiro)."""
    # Tentar como cliente
    cliente = Cliente.query.filter_by(email=email).first()
    if cliente and check_password_hash(cliente.senha, password):
        return {**cliente.to_dict(), "tipo": "cliente"}
    
    # Tentar como barbeiro
    barber = Barber.query.filter_by(email=email).first()
    if barber and check_password_hash(barber.senha, password):
        return {**barber.to_dict(), "tipo": "barbeiro"}
    
    return None


def register_user(nome, email, password, tipo="cliente", telefone=None):
    """Registra um novo usuário."""
    # Verificar se email já existe
    if Cliente.query.filter_by(email=email).first() or Barber.query.filter_by(email=email).first():
        return False
    
    senha_hash = generate_password_hash(password)
    
    if tipo == "barbeiro":
        user = Barber(nome=nome, email=email, senha=senha_hash, telefone=telefone)
    else:
        user = Cliente(nome=nome, email=email, senha=senha_hash, telefone=telefone)
    
    db.session.add(user)
    db.session.commit()
    return True


def exigir_login(tipo_requerido=None):
    """Verifica se o usuário está logado. Opcionalmente verifica o tipo."""
    if "usuario_email" not in session:
        return False
    
    if tipo_requerido and session.get("usuario_tipo") != tipo_requerido:
        return False
    
    return True


def usuario_atual():
    """Retorna os dados do usuário atual da sessão."""
    if not exigir_login():
        return None
    
    email = session.get("usuario_email")
    tipo = session.get("usuario_tipo")
    
    if tipo == "barbeiro":
        user = Barber.query.filter_by(email=email).first()
    else:
        user = Cliente.query.filter_by(email=email).first()
    
    return user.to_dict() if user else None
