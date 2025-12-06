"""Serviço de informações gerais (barbeiros, serviços, notificações, relatórios)."""
from db import db, Barber, Service, Appointment
from datetime import datetime, timedelta


def list_barbers():
    """Lista todos os barbeiros."""
    barbers = Barber.query.all()
    return [barber.to_dict() for barber in barbers]


def list_services():
    """Lista todos os serviços."""
    services = Service.query.all()
    return [service.to_dict() for service in services]


def list_notifications():
    """Lista notificações (placeholder - implementar conforme necessário)."""
    # TODO: Implementar sistema de notificações
    return []


def report_week():
    """Gera relatório da semana."""
    # Calcular data de início da semana (7 dias atrás)
    today = datetime.now()
    week_ago = today - timedelta(days=7)
    week_ago_str = week_ago.strftime("%Y-%m-%d")
    
    # Buscar agendamentos da semana
    appointments = Appointment.query.filter(Appointment.date >= week_ago_str).all()
    
    # Calcular estatísticas
    total_appointments = len(appointments)
    completed = len([a for a in appointments if a.status == "concluido"])
    cancelled = len([a for a in appointments if a.status == "cancelado"])
    pending = len([a for a in appointments if a.status == "agendado"])
    
    # Calcular receita (apenas agendamentos concluídos)
    revenue = sum(a.total_price or 0 for a in appointments if a.status == "concluido")
    
    return {
        "period": f"{week_ago_str} até {today.strftime('%Y-%m-%d')}",
        "total_appointments": total_appointments,
        "completed": completed,
        "cancelled": cancelled,
        "pending": pending,
        "revenue": revenue
    }
