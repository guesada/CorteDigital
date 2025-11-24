from flask import Blueprint, jsonify, request, session
from datetime import datetime
from db import db, Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/api/notifications/check', methods=['GET'])
def check_notifications():
    """Verificar novas notificações para o usuário logado"""
    try:
        # Verificar se está autenticado
        email = session.get('usuario_email')
        tipo = session.get('usuario_tipo')
        
        if not email:
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401
        
        # Buscar o ID do usuário
        from db import Barber, Cliente
        if tipo == 'barbeiro':
            user = Barber.query.filter_by(email=email).first()
        else:
            user = Cliente.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'success': False, 'message': 'Usuário não encontrado'}), 401
        
        user_id = user.id
        
        # Pegar timestamp da última verificação (em milissegundos)
        last_check_ms = request.headers.get('X-Last-Check', '0')
        try:
            last_check_timestamp = datetime.fromtimestamp(int(last_check_ms) / 1000)
        except:
            last_check_timestamp = datetime(1970, 1, 1)
        
        # Buscar notificações não lidas criadas após last_check
        new_notifications = Notification.query.filter(
            Notification.user_id == user_id,
            Notification.created_at > last_check_timestamp,
            Notification.is_read == False
        ).order_by(Notification.created_at.desc()).all()
        
        # Contar total de não lidas
        unread_count = Notification.query.filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
        
        # Formatar notificações
        notifications_list = [notif.to_dict() for notif in new_notifications]
        
        return jsonify({
            'success': True,
            'notifications': notifications_list,
            'unreadCount': unread_count
        })
        
    except Exception as e:
        print(f"Erro ao verificar notificações: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@notifications_bp.route('/api/notifications/<int:notification_id>/read', methods=['POST'])
def mark_as_read(notification_id):
    """Marcar notificação como lida"""
    try:
        # Verificar se está autenticado
        email = session.get('usuario_email')
        tipo = session.get('usuario_tipo')
        
        if not email:
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401
        
        # Buscar o ID do usuário
        from db import Barber, Cliente
        if tipo == 'barbeiro':
            user = Barber.query.filter_by(email=email).first()
        else:
            user = Cliente.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'success': False, 'message': 'Usuário não encontrado'}), 401
        
        user_id = user.id
        
        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=user_id
        ).first()
        
        if not notification:
            return jsonify({'success': False, 'message': 'Notificação não encontrada'}), 404
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"Erro ao marcar notificação como lida: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@notifications_bp.route('/api/notifications/mark-all-read', methods=['POST'])
def mark_all_read():
    """Marcar todas as notificações como lidas"""
    try:
        # Verificar se está autenticado
        email = session.get('usuario_email')
        tipo = session.get('usuario_tipo')
        
        if not email:
            return jsonify({'success': False, 'message': 'Não autenticado'}), 401
        
        # Buscar o ID do usuário
        from db import Barber, Cliente
        if tipo == 'barbeiro':
            user = Barber.query.filter_by(email=email).first()
        else:
            user = Cliente.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'success': False, 'message': 'Usuário não encontrado'}), 401
        
        user_id = user.id
        
        Notification.query.filter_by(
            user_id=user_id,
            is_read=False
        ).update({'is_read': True})
        
        db.session.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"Erro ao marcar todas como lidas: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


def create_notification(user_id, title, message, notification_type='info', data=None):
    """Função auxiliar para criar notificações"""
    try:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            data=data
        )
        
        db.session.add(notification)
        db.session.commit()
        
        return notification.id
        
    except Exception as e:
        print(f"Erro ao criar notificação: {e}")
        db.session.rollback()
        return None
