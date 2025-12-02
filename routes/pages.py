"""Rotas de páginas HTML."""
from flask import Blueprint, redirect, render_template, session, url_for
from services import exigir_login

pages_bp = Blueprint("pages", __name__)


@pages_bp.route("/")
def index():
    """Página inicial."""
    return render_template("index.html")


@pages_bp.route("/cliente")
def cliente_dashboard():
    """Dashboard do cliente."""
    if not exigir_login("cliente"):
        return redirect(url_for("pages.index"))
    return render_template("cliente_dashboard.html", nome=session.get("usuario_nome"))


@pages_bp.route("/barbeiro")
def barbeiro_dashboard():
    """Dashboard do barbeiro."""
    if not exigir_login("barbeiro"):
        return redirect(url_for("pages.index"))
    return render_template("barbeiro_dashboard.html", nome=session.get("usuario_nome"))


@pages_bp.route("/chat")
def chat():
    """Página de chat."""
    from services import usuario_atual
    
    # Verifica se está logado
    user_data = usuario_atual()
    if not user_data:
        return redirect(url_for("pages.index"))
    
    # Atualiza sessão com dados necessários para o chat
    session["user_id"] = user_data["id"]
    session["tipo"] = user_data["tipo"]
    
    return render_template(
        "chat.html",
        nome=user_data.get("nome", "Usuário"),
        tipo=user_data.get("tipo", "cliente"),
        user_id=user_data.get("id")
    )


@pages_bp.route("/chat/config.js")
def chat_config():
    """Configuração JavaScript do chat."""
    if "user_id" not in session:
        return "window.userType='cliente';window.userId=null;window.userName='Usuário';", 200, {'Content-Type': 'application/javascript'}
    
    return render_template(
        "chat_config.js",
        nome=session.get("usuario_nome", "Usuário"),
        tipo=session.get("tipo", "cliente"),
        user_id=session.get("user_id")
    ), 200, {'Content-Type': 'application/javascript'}


@pages_bp.route("/logout")
def logout():
    """Logout do usuário."""
    session.clear()
    return redirect(url_for("pages.index"))
