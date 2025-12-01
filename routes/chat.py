"""
Rotas do sistema de chat
"""
from flask import Blueprint, request, jsonify, session
from flask_socketio import emit, join_room, leave_room
import chat_service

chat_bp = Blueprint('chat', __name__)


def register_chat_routes(app):
    """Registra as rotas HTTP do chat"""
    app.register_blueprint(chat_bp, url_prefix='/api/chat')


def register_socketio_events(socketio):
    """Registra os eventos WebSocket do chat"""
    
    @socketio.on('connect')
    def handle_connect():
        """Cliente conectou ao WebSocket"""
        if 'user_id' not in session:
            return False
        
        user_id = session['user_id']
        join_room(f'user_{user_id}')
        emit('connected', {'user_id': user_id})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Cliente desconectou do WebSocket"""
        if 'user_id' in session:
            user_id = session['user_id']
            leave_room(f'user_{user_id}')
    
    @socketio.on('join_conversation')
    def handle_join_conversation(data):
        """Usuário entrou em uma conversa"""
        if 'user_id' not in session:
            return
        
        conversation_id = data.get('conversation_id')
        if conversation_id:
            join_room(f'conversation_{conversation_id}')
            
            # Marca mensagens como lidas
            user_id = session['user_id']
            chat_service.mark_as_read(conversation_id, user_id)
            
            # Notifica que as mensagens foram lidas
            emit('messages_read', {
                'conversation_id': conversation_id,
                'user_id': user_id
            }, room=f'conversation_{conversation_id}')
    
    @socketio.on('leave_conversation')
    def handle_leave_conversation(data):
        """Usuário saiu de uma conversa"""
        conversation_id = data.get('conversation_id')
        if conversation_id:
            leave_room(f'conversation_{conversation_id}')
    
    @socketio.on('send_message')
    def handle_send_message(data):
        """Envia uma mensagem"""
        if 'user_id' not in session:
            emit('error', {'message': 'Não autenticado'})
            return
        
        conversation_id = data.get('conversation_id')
        message_text = data.get('message', '').strip()
        
        if not conversation_id or not message_text:
            emit('error', {'message': 'Dados inválidos'})
            return
        
        try:
            user_id = session['user_id']
            user_tipo = session['tipo']
            message = chat_service.send_message(conversation_id, user_id, user_tipo, message_text)
            
            # Envia mensagem para todos na conversa
            emit('new_message', message, room=f'conversation_{conversation_id}')
            
            # Notifica destinatário sobre nova mensagem (para atualizar lista de conversas)
            # Determina o destinatário
            conn = chat_service.get_database_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT cliente_id, barbeiro_id FROM chat_conversations
                WHERE id = %s
            """, (conversation_id,))
            conv = cursor.fetchone()
            cursor.close()
            conn.close()
            
            recipient_id = conv['barbeiro_id'] if user_tipo == 'cliente' else conv['cliente_id']
            
            emit('conversation_updated', {
                'conversation_id': conversation_id,
                'last_message': message_text,
                'unread_increment': 1
            }, room=f'user_{recipient_id}')
            
        except Exception as e:
            emit('error', {'message': str(e)})
    
    @socketio.on('typing')
    def handle_typing(data):
        """Usuário está digitando"""
        if 'user_id' not in session:
            return
        
        conversation_id = data.get('conversation_id')
        is_typing = data.get('is_typing', False)
        
        if conversation_id:
            emit('user_typing', {
                'user_id': session['user_id'],
                'is_typing': is_typing
            }, room=f'conversation_{conversation_id}', include_self=False)


@chat_bp.route('/conversations', methods=['GET'])
def get_conversations():
    """Obtém lista de conversas do usuário"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    try:
        user_id = session['user_id']
        user_tipo = session['tipo']
        
        conversations = chat_service.get_user_conversations(user_id, user_tipo)
        total_unread = chat_service.get_total_unread(user_id, user_tipo)
        
        return jsonify({
            'success': True,
            'conversations': conversations,
            'total_unread': total_unread
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@chat_bp.route('/conversation/<int:other_user_id>', methods=['GET'])
def get_or_create_conversation(other_user_id):
    """Obtém ou cria conversa com outro usuário"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    try:
        user_id = session['user_id']
        user_tipo = session['tipo']
        
        # Determina quem é cliente e quem é barbeiro
        if user_tipo == 'cliente':
            cliente_id = user_id
            barbeiro_id = other_user_id
        else:
            cliente_id = other_user_id
            barbeiro_id = user_id
        
        conversation_id = chat_service.get_or_create_conversation(cliente_id, barbeiro_id)
        
        return jsonify({
            'success': True,
            'conversation_id': conversation_id
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@chat_bp.route('/messages/<int:conversation_id>', methods=['GET'])
def get_messages(conversation_id):
    """Obtém mensagens de uma conversa"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    try:
        messages = chat_service.get_messages(conversation_id)
        
        return jsonify({
            'success': True,
            'messages': messages
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@chat_bp.route('/mark-read/<int:conversation_id>', methods=['POST'])
def mark_read(conversation_id):
    """Marca mensagens como lidas"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    try:
        user_id = session['user_id']
        chat_service.mark_as_read(conversation_id, user_id)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
