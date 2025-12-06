"""
Serviço de chat em tempo real entre barbeiro e cliente
"""
from datetime import datetime
from db import db, ChatConversation, ChatMessage, Cliente, Barber
from sqlalchemy import or_, and_


def create_chat_tables():
    """Cria as tabelas necessárias para o sistema de chat"""
    try:
        # As tabelas são criadas automaticamente pelo SQLAlchemy
        db.create_all()
        print("✅ Tabelas de chat criadas com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao criar tabelas de chat: {e}")
        raise


def get_or_create_conversation(cliente_id, barbeiro_id):
    """Obtém ou cria uma conversa entre cliente e barbeiro"""
    # Verifica se já existe conversa
    conversation = ChatConversation.query.filter_by(
        cliente_id=cliente_id,
        barbeiro_id=barbeiro_id
    ).first()
    
    if conversation:
        return conversation.id
    
    # Cria nova conversa
    conversation = ChatConversation(
        cliente_id=cliente_id,
        barbeiro_id=barbeiro_id
    )
    db.session.add(conversation)
    db.session.commit()
    
    return conversation.id


def send_message(conversation_id, sender_id, sender_type, message):
    """Envia uma mensagem no chat"""
    print(f"💾 chat_service.send_message chamado:")
    print(f"   conversation_id={conversation_id}")
    print(f"   sender_id={sender_id}")
    print(f"   sender_type={sender_type}")
    print(f"   message={message}")
    
    # Cria a mensagem
    chat_message = ChatMessage(
        conversation_id=conversation_id,
        sender_id=sender_id,
        sender_type=sender_type,
        message=message
    )
    db.session.add(chat_message)
    db.session.flush()  # Para obter o ID
    
    print(f"✅ Mensagem inserida no banco, ID: {chat_message.id}")
    
    # Atualiza a conversa
    conversation = ChatConversation.query.get(conversation_id)
    conversation.last_message_at = datetime.utcnow()
    
    # Incrementa contador de não lidas para o destinatário
    if sender_type == 'cliente':
        conversation.barbeiro_unread += 1
    else:
        conversation.cliente_unread += 1
    
    db.session.commit()
    
    # Busca o nome do remetente
    if sender_type == 'cliente':
        sender = Cliente.query.get(sender_id)
    else:
        sender = Barber.query.get(sender_id)
    
    result = chat_message.to_dict()
    result['sender_nome'] = sender.nome if sender else 'Desconhecido'
    
    return result


def get_messages(conversation_id, limit=50):
    """Obtém mensagens de uma conversa"""
    messages = ChatMessage.query.filter_by(
        conversation_id=conversation_id
    ).order_by(ChatMessage.created_at.asc()).limit(limit).all()
    
    result = []
    for msg in messages:
        msg_dict = msg.to_dict()
        
        # Busca o nome do remetente
        if msg.sender_type == 'cliente':
            sender = Cliente.query.get(msg.sender_id)
        else:
            sender = Barber.query.get(msg.sender_id)
        
        msg_dict['sender_nome'] = sender.nome if sender else 'Desconhecido'
        result.append(msg_dict)
    
    return result


def mark_as_read(conversation_id, user_id):
    """Marca mensagens como lidas"""
    # Marca mensagens como lidas
    ChatMessage.query.filter(
        ChatMessage.conversation_id == conversation_id,
        ChatMessage.sender_id != user_id,
        ChatMessage.is_read == False
    ).update({ChatMessage.is_read: True})
    
    # Reseta contador de não lidas
    conversation = ChatConversation.query.get(conversation_id)
    
    if conversation.cliente_id == user_id:
        conversation.cliente_unread = 0
    else:
        conversation.barbeiro_unread = 0
    
    db.session.commit()


def get_user_conversations(user_id, user_tipo):
    """Obtém todas as conversas de um usuário"""
    if user_tipo == 'cliente':
        conversations = ChatConversation.query.filter_by(
            cliente_id=user_id
        ).order_by(ChatConversation.last_message_at.desc()).all()
    else:
        conversations = ChatConversation.query.filter_by(
            barbeiro_id=user_id
        ).order_by(ChatConversation.last_message_at.desc()).all()
    
    result = []
    for conv in conversations:
        # Busca o outro usuário
        if user_tipo == 'cliente':
            other_user = Barber.query.get(conv.barbeiro_id)
            unread_count = conv.cliente_unread
        else:
            other_user = Cliente.query.get(conv.cliente_id)
            unread_count = conv.barbeiro_unread
        
        # Busca última mensagem
        last_msg = ChatMessage.query.filter_by(
            conversation_id=conv.id
        ).order_by(ChatMessage.created_at.desc()).first()
        
        result.append({
            'id': conv.id,
            'last_message_at': conv.last_message_at.isoformat() if conv.last_message_at else None,
            'unread_count': unread_count,
            'other_user_id': other_user.id if other_user else None,
            'other_user_nome': other_user.nome if other_user else 'Desconhecido',
            'last_message': last_msg.message if last_msg else None
        })
    
    return result


def get_total_unread(user_id, user_tipo):
    """Obtém total de mensagens não lidas"""
    if user_tipo == 'cliente':
        conversations = ChatConversation.query.filter_by(cliente_id=user_id).all()
        return sum(conv.cliente_unread for conv in conversations)
    else:
        conversations = ChatConversation.query.filter_by(barbeiro_id=user_id).all()
        return sum(conv.barbeiro_unread for conv in conversations)


# Função auxiliar para compatibilidade com código antigo
def get_database_connection():
    """Retorna conexão do banco (para compatibilidade)"""
    from database_config import get_database_connection as get_conn
    return get_conn()
