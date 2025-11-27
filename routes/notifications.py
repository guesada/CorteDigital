"""Rotas de notificações."""
from flask import Blueprint, jsonify, request, session
from datetime import datetime
from db import db, Notification, Barber, Cliente

notifications_bp = Blueprint('notifications', __name__)


def get_user_id():
    """Retorna ID do usuário logado ou None."""
    email = session.get('usuario_email')
    tipo = session.get('usuario_tipo')
    
    if not email:
        return None
    
    Model = Barber if tipo == 'barbeiro' else Cliente
    user = Model.query.filter_by(email=email).first()
    return user.id if user else None


@notifications_bp.route('/api/notifications/check', methods=['GET'])
def check_notifications():
    """Verificar novas notificações."""
    user_id = get_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    # Timestamp da última verificação
    last_check_ms = request.headers.get('X-Last-Check', '0')
    try:
        last_check = datetime.fromtimestamp(int(last_check_ms) / 1000)
    except:
        last_check = datetime(1970, 1, 1)
    
    # Buscar novas notificações
    new_notifs = Notification.query.filter(
        Notification.user_id == user_id,
        Notification.created_at > last_check,
        Notification.is_read == False
    ).order_by(Notification.created_at.desc()).all()
    
    # Contar não lidas
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    
    return jsonify({
        'success': True,
        'notifications': [n.to_dict() for n in new_notifs],
        'unreadCount': unread_count
    })


@notifications_bp.route('/api/notifications/<int:notification_id>/read', methods=['POST'])
def mark_as_read(notification_id):
    """Marcar como lida."""
    user_id = get_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not notif:
        return jsonify({'success': False, 'message': 'Não encontrada'}), 404
    
    notif.is_read = True
    db.session.commit()
    return jsonify({'success': True})


@notifications_bp.route('/api/notifications/mark-all-read', methods=['POST'])
def mark_all_read():
    """Marcar todas como lidas."""
    user_id = get_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'success': True})


def create_notification(user_id, title, message, notification_type='info', data=None):
    """Criar notificação."""
    try:
        notif = Notification(user_id=user_id, title=title, message=message,
                            type=notification_type, data=data)
        db.session.add(notif)
        db.session.commit()
        return notif.id
    except Exception as e:
        print(f"Erro ao criar notificação: {e}")
        db.session.rollback()
        return None
