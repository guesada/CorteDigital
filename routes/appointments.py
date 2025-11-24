"""Rotas relacionadas a agendamentos."""

from flask import Blueprint, jsonify, request

from services import (
    exigir_login,
    list_appointments_for_user,
    create_appointment,
    cancel_appointment_by_id,
    update_appointment_status,
    usuario_atual,
)
from services import list_appointments_for_barber

appointments_bp = Blueprint("appointments", __name__, url_prefix="/api/appointments")


@appointments_bp.route("", methods=["GET", "POST"])
def appointments_root():
    if not exigir_login():
        return jsonify({"success": False, "message": "Não autenticado"}), 401

    if request.method == "GET":
        return jsonify({"success": True, "data": list_appointments_for_user()})

    body = request.get_json() or {}
    required = ["barberId", "barberName", "serviceId", "serviceName", "date", "time"]
    if not all(body.get(field) for field in required):
        return jsonify({"success": False, "message": "Dados incompletos para agendamento"}), 400

    barber_id = int(body.get("barberId"))
    date = body.get("date")
    time = body.get("time")
    
    # Validar data não pode ser no passado
    from datetime import datetime
    try:
        appointment_date = datetime.strptime(date, "%Y-%m-%d").date()
        today = datetime.now().date()
        if appointment_date < today:
            return jsonify({"success": False, "message": "Não é possível agendar em datas passadas"}), 400
        
        # Se for hoje, validar horário
        if appointment_date == today:
            appointment_time = datetime.strptime(time, "%H:%M").time()
            now_time = datetime.now().time()
            if appointment_time <= now_time:
                return jsonify({"success": False, "message": "Não é possível agendar em horários que já passaram"}), 400
    except ValueError:
        return jsonify({"success": False, "message": "Data ou horário inválido"}), 400

    # Verifica conflito: mesmo barbeiro, mesma data e hora, status diferente de 'cancelado'
    existing = [a for a in list_appointments_for_barber(barber_id, date) if a.get("time") == time and a.get("status") != "cancelado"]
    if existing:
        return jsonify({"success": False, "message": "Horário já agendado"}), 409

    novo = create_appointment(body)
    
    # Criar notificação para o barbeiro
    try:
        from routes.notifications import create_notification
        from datetime import datetime
        
        # Formatar data e hora para exibição
        date_obj = datetime.strptime(date, "%Y-%m-%d")
        date_formatted = date_obj.strftime("%d/%m/%Y")
        
        # Pegar nome do cliente
        user = usuario_atual()
        client_name = user.get('name', 'Cliente')
        service_name = body.get('serviceName', 'Serviço')
        
        notification_message = f"{client_name} agendou {service_name} para {date_formatted} às {time}"
        
        create_notification(
            user_id=barber_id,
            title='Novo Agendamento',
            message=notification_message,
            notification_type='new-appointment',
            data=str(novo.get('id', ''))
        )
    except Exception as e:
        print(f"Erro ao criar notificação: {e}")
        # Não falhar a criação do agendamento se a notificação falhar
    
    return jsonify({"success": True, "data": novo}), 201


@appointments_bp.delete("/<appointment_id>")
def cancel_appointment(appointment_id: str):
    if not exigir_login():
        return jsonify({"success": False, "message": "Não autenticado"}), 401

    ok = cancel_appointment_by_id(appointment_id)
    if not ok:
        return jsonify({"success": False, "message": "Agendamento não encontrado"}), 404
    return jsonify({"success": True})


@appointments_bp.patch("/<appointment_id>/status")
def update_status(appointment_id: str):
    if not exigir_login("barbeiro"):
        return jsonify({"success": False, "message": "Apenas barbeiros podem atualizar status"}), 401

    body = request.get_json() or {}
    status = body.get("status")
    if not status:
        return jsonify({"success": False, "message": "Status é obrigatório"}), 400

    ok = update_appointment_status(appointment_id, status)
    if not ok:
        return jsonify({"success": False, "message": "Agendamento não encontrado"}), 404
    return jsonify({"success": True})


@appointments_bp.get('/for_barber/<int:barber_id>')
def appointments_for_barber(barber_id: int):
    if not exigir_login():
        return jsonify({"success": False, "message": "Não autenticado"}), 401
    date = request.args.get('date')
    data = list_appointments_for_barber(barber_id, date)
    return jsonify({"success": True, "data": data})
