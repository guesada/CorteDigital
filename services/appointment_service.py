"""Serviço de gerenciamento de agendamentos."""
from flask import session
from db import db, Appointment
from datetime import datetime
import uuid


def list_appointments_for_user():
    """Lista agendamentos do usuário atual."""
    email = session.get("usuario_email")
    tipo = session.get("usuario_tipo")
    
    if tipo == "barbeiro":
        # Barbeiro vê seus próprios agendamentos
        nome = session.get("usuario_nome")
        appointments = Appointment.query.filter_by(barbeiro=nome).all()
    else:
        # Cliente vê seus agendamentos
        appointments = Appointment.query.filter_by(cliente_email=email).all()
    
    return [apt.to_dict() for apt in appointments]


def list_appointments_for_barber(barber_id, date=None):
    """Lista agendamentos de um barbeiro específico."""
    query = Appointment.query.filter_by(barbeiro_id=barber_id)
    
    if date:
        query = query.filter_by(date=date)
    
    appointments = query.all()
    return [apt.to_dict() for apt in appointments]


def create_appointment(data):
    """Cria um novo agendamento."""
    appointment_id = str(uuid.uuid4())
    
    appointment = Appointment(
        id=appointment_id,
        cliente=session.get("usuario_nome"),
        cliente_email=session.get("usuario_email"),
        barbeiro=data.get("barberName"),
        barbeiro_id=data.get("barberId"),
        servico=data.get("serviceName"),
        servico_id=data.get("serviceId"),
        date=data.get("date"),
        time=data.get("time"),
        status="agendado",
        total_price=data.get("totalPrice", 0.0)
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    return appointment.to_dict()


def cancel_appointment_by_id(appointment_id):
    """Cancela um agendamento."""
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return False
    
    appointment.status = "cancelado"
    db.session.commit()
    return True


def update_appointment_status(appointment_id, status):
    """Atualiza o status de um agendamento."""
    appointment = Appointment.query.get(appointment_id)
    
    if not appointment:
        return False
    
    appointment.status = status
    db.session.commit()
    return True


def auto_complete_past_appointments():
    """Marca automaticamente como concluídos os agendamentos passados."""
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")
    
    # Buscar agendamentos agendados que já passaram
    past_appointments = Appointment.query.filter(
        Appointment.status == "agendado",
        db.or_(
            Appointment.date < current_date,
            db.and_(
                Appointment.date == current_date,
                Appointment.time < current_time
            )
        )
    ).all()
    
    count = 0
    for apt in past_appointments:
        apt.status = "concluido"
        count += 1
    
    if count > 0:
        db.session.commit()
    
    return count
