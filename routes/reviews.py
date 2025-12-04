"""
Rotas de Avaliações e Reviews
"""
from flask import Blueprint, jsonify, request, session
from app.services import review_service
from app.services.notification_service import notify_new_review
from routes.notifications import send_realtime_notification

reviews_bp = Blueprint('reviews', __name__)


def register_reviews_routes(app, socketio):
    """Registra as rotas de reviews"""
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    reviews_bp.socketio = socketio


@reviews_bp.route('/', methods=['POST'])
def create_review():
    """Cria uma nova avaliação"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    if session.get('tipo') != 'cliente':
        return jsonify({'success': False, 'message': 'Apenas clientes podem avaliar'}), 403
    
    try:
        data = request.get_json()
        appointment_id = data.get('appointment_id')
        barbeiro_id = data.get('barbeiro_id')
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        if not all([appointment_id, barbeiro_id, rating]):
            return jsonify({'success': False, 'message': 'Dados incompletos'}), 400
        
        if not (1 <= rating <= 5):
            return jsonify({'success': False, 'message': 'Rating deve ser entre 1 e 5'}), 400
        
        cliente_id = session['user_id']
        
        # Verifica se pode avaliar
        if not review_service.can_review_appointment(appointment_id, cliente_id):
            return jsonify({'success': False, 'message': 'Não é possível avaliar este agendamento'}), 400
        
        # Cria avaliação
        result = review_service.create_review(appointment_id, barbeiro_id, cliente_id, rating, comment)
        
        if result['success']:
            # Notifica barbeiro
            cliente_nome = session.get('usuario_nome', 'Um cliente')
            notif = notify_new_review(barbeiro_id, cliente_nome, rating)
            send_realtime_notification(reviews_bp.socketio, barbeiro_id, 'barbeiro', notif)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@reviews_bp.route('/<int:review_id>', methods=['PUT'])
def update_review(review_id):
    """Atualiza uma avaliação"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    if session.get('tipo') != 'cliente':
        return jsonify({'success': False, 'message': 'Apenas clientes podem editar avaliações'}), 403
    
    try:
        data = request.get_json()
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        if not rating or not (1 <= rating <= 5):
            return jsonify({'success': False, 'message': 'Rating inválido'}), 400
        
        cliente_id = session['user_id']
        result = review_service.update_review(review_id, cliente_id, rating, comment)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    """Deleta uma avaliação"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    if session.get('tipo') != 'cliente':
        return jsonify({'success': False, 'message': 'Apenas clientes podem deletar avaliações'}), 403
    
    try:
        cliente_id = session['user_id']
        result = review_service.delete_review(review_id, cliente_id)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@reviews_bp.route('/barbeiro/<int:barbeiro_id>', methods=['GET'])
def get_barbeiro_reviews(barbeiro_id):
    """Obtém avaliações de um barbeiro"""
    try:
        limit = int(request.args.get('limit', 50))
        reviews = review_service.get_barbeiro_reviews(barbeiro_id, limit)
        summary = review_service.get_barbeiro_rating_summary(barbeiro_id)
        
        return jsonify({
            'success': True,
            'reviews': reviews,
            'summary': summary
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@reviews_bp.route('/my-reviews', methods=['GET'])
def get_my_reviews():
    """Obtém avaliações do cliente logado"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    if session.get('tipo') != 'cliente':
        return jsonify({'success': False, 'message': 'Apenas clientes'}), 403
    
    try:
        cliente_id = session['user_id']
        reviews = review_service.get_cliente_reviews(cliente_id)
        
        return jsonify({
            'success': True,
            'reviews': reviews
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@reviews_bp.route('/pending', methods=['GET'])
def get_pending_reviews():
    """Obtém agendamentos pendentes de avaliação"""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Não autenticado'}), 401
    
    if session.get('tipo') != 'cliente':
        return jsonify({'success': False, 'message': 'Apenas clientes'}), 403
    
    try:
        cliente_id = session['user_id']
        appointments = review_service.get_pending_reviews(cliente_id)
        
        return jsonify({
            'success': True,
            'appointments': appointments
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@reviews_bp.route('/top-rated', methods=['GET'])
def get_top_rated():
    """Obtém barbeiros mais bem avaliados"""
    try:
        limit = int(request.args.get('limit', 10))
        barbers = review_service.get_top_rated_barbers(limit)
        
        return jsonify({
            'success': True,
            'barbers': barbers
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
