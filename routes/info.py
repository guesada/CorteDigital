"""Rotas com informações gerais (barbeiros, serviços, notificações, relatórios)."""

from flask import Blueprint, jsonify

from services import list_barbers, list_services, list_notifications, report_week

info_bp = Blueprint("info", __name__, url_prefix="/api")


@info_bp.get("/barbers")
def listar_barbeiros():
    return jsonify({"success": True, "data": list_barbers()})


@info_bp.get("/services")
def listar_servicos():
    return jsonify({"success": True, "data": list_services()})


@info_bp.get("/notifications")
def listar_notificacoes():
    return jsonify({"success": True, "data": list_notifications()})


@info_bp.get("/reports/week")
def relatorio_semana():
    return jsonify({"success": True, "data": report_week()})
