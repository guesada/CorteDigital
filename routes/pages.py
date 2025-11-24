"""Rotas de páginas HTML (landing, dashboards e logout)."""

from flask import Blueprint, redirect, render_template, session, url_for

from services import exigir_login

pages_bp = Blueprint("pages", __name__)


@pages_bp.route("/")
def index():
    return render_template("index.html")


@pages_bp.route("/cliente")
def cliente_dashboard():
    if not exigir_login("cliente"):
        return redirect(url_for("pages.index"))
    return render_template("cliente_dashboard.html", nome=session.get("usuario_nome"))


@pages_bp.route("/barbeiro")
def barbeiro_dashboard():
    if not exigir_login("barbeiro"):
        return redirect(url_for("pages.index"))
    return render_template("barbeiro_dashboard.html", nome=session.get("usuario_nome"))


@pages_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("pages.index"))
