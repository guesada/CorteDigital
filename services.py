"""Serviços de acesso a dados usando SQLAlchemy (MySQL).

Este módulo substitui a persistência por JSON. Ele expõe funções usadas
pelas rotas para autenticação, consultas e mutações (agendamentos, estoque, etc.).
"""

from __future__ import annotations

from datetime import datetime
import json
import os
from typing import Any, Dict, List, Optional

from flask import session, current_app

from db import db, Cliente, Barber, Service, Appointment, DEFAULT_HORARIOS


# Função init_app removida - inicialização agora é feita no app.py


def usuario_atual() -> Optional[Dict[str, Any]]:
    email = session.get("usuario_email")
    tipo = session.get("usuario_tipo")
    if not email:
        return None
    
    # Buscar em clientes ou barbeiros dependendo do tipo
    if tipo == "barbeiro":
        u = Barber.query.filter_by(email=email).first()
    else:
        u = Cliente.query.filter_by(email=email).first()
    
    return u.to_dict() if u else None


def exigir_login(tipo: Optional[str] = None) -> bool:
    user = usuario_atual()
    if not user:
        return False
    if tipo and user.get("tipo") != tipo:
        return False
    return True


def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    # Tentar buscar como cliente
    u = Cliente.query.filter_by(email=email).first()
    if u and u.senha == password:
        return u.to_dict()
    
    # Tentar buscar como barbeiro
    b = Barber.query.filter_by(email=email).first()
    if b and b.senha == password:
        return b.to_dict()
    
    return None


def register_user(nome: str, email: str, senha: str, tipo: str = "cliente", telefone: str = None) -> bool:
    # Verificar se email já existe em clientes ou barbeiros
    if Cliente.query.filter_by(email=email).first() or Barber.query.filter_by(email=email).first():
        return False
    
    if tipo == "barbeiro":
        # Criar barbeiro com horários padrão
        b = Barber(
            nome=nome,
            email=email,
            senha=senha,
            telefone=telefone,
            foto="https://via.placeholder.com/150",
            especialidades=json.dumps(["Corte", "Barba"]),
            avaliacao=5.0,
            preco_base=50.0,
            disponibilidade=json.dumps(DEFAULT_HORARIOS)
        )
        db.session.add(b)
    else:
        # Criar cliente
        c = Cliente(nome=nome, email=email, senha=senha, telefone=telefone)
        db.session.add(c)
    
    db.session.commit()
    return True


def list_barbers() -> List[Dict[str, Any]]:
    return [b.to_dict() for b in Barber.query.all()]


def list_services() -> List[Dict[str, Any]]:
    # Retornar apenas os 3 serviços básicos
    return [s.to_dict() for s in Service.query.filter(
        Service.nome.in_(['Corte', 'Barba', 'Corte + Barba'])
    ).all()]


def list_notifications() -> List[Dict[str, Any]]:
    # Notificações foram removidas do sistema
    return []


def report_week() -> Dict[str, Any]:
    # Relatórios foram removidos do sistema
    return {}


def list_appointments_for_user() -> List[Dict[str, Any]]:
    """Lista agendamentos do usuário logado."""
    usuario = usuario_atual()
    if not usuario:
        return []
    
    if usuario["tipo"] == "barbeiro":
        # Barbeiro vê apenas seus próprios agendamentos
        return [a.to_dict() for a in Appointment.query.filter_by(barbeiro=usuario["name"]).order_by(Appointment.date.desc(), Appointment.time.desc()).all()]
    
    # Cliente vê apenas seus próprios agendamentos
    return [a.to_dict() for a in Appointment.query.filter_by(cliente_email=usuario["email"]).all()]


def list_appointments_for_barber(barber_id: int, date: Optional[str] = None) -> List[Dict[str, Any]]:
    # retorna agendamentos para um barbeiro específico, opcionalmente filtrando por data (YYYY-MM-DD)
    q = Appointment.query.filter_by(barbeiro_id=barber_id)
    if date:
        q = q.filter_by(date=date)
    return [a.to_dict() for a in q.all()]


def create_appointment(body: Dict[str, Any]) -> Dict[str, Any]:
    """Cria um novo agendamento."""
    usuario = usuario_atual()
    if not usuario:
        raise ValueError("Usuário não autenticado")
    
    # Validar se não é horário passado
    appointment_date = body["date"]
    appointment_time = body["time"]
    appointment_datetime = datetime.strptime(f"{appointment_date} {appointment_time}", "%Y-%m-%d %H:%M")
    
    if appointment_datetime <= datetime.now():
        raise ValueError("Não é possível agendar em horários passados")
    
    # Gerar ID único
    last = Appointment.query.order_by(Appointment.id.desc()).first()
    if last and last.id.startswith('APT'):
        apt_id = f"APT{int(last.id[3:]) + 1:05d}"
    else:
        apt_id = "APT00001"
    
    ap = Appointment(
        id=apt_id,
        cliente=usuario.get("name", "Cliente"),
        cliente_email=usuario.get("email", ""),
        barbeiro=body["barberName"],
        barbeiro_id=int(body["barberId"]),
        servico=body["serviceName"],
        servico_id=int(body["serviceId"]),
        date=body["date"],
        time=body["time"],
        status="agendado",
        total_price=float(body.get("total", 0)),
        created_at=datetime.utcnow().isoformat(),
    )
    
    db.session.add(ap)
    db.session.commit()
    return ap.to_dict()


def cancel_appointment_by_id(appointment_id: str) -> bool:
    ap = Appointment.query.get(appointment_id)
    if not ap:
        return False
    db.session.delete(ap)
    db.session.commit()
    return True


def update_appointment_status(appointment_id: str, status: str) -> bool:
    ap = Appointment.query.get(appointment_id)
    if not ap:
        return False
    ap.status = status
    db.session.commit()
    return True


def dados_iniciais() -> Dict[str, Any]:
    # Para compatibilidade: devolve um resumo dos dados iniciais; prefer usar funções específicas.
    return {
        "barbeiros": list_barbers(),
        "servicos": list_services(),
        "notificacoes": list_notifications(),
    }
