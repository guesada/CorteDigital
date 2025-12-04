"""
AI API - Endpoints de recomendações com IA
"""
from flask import Blueprint, jsonify, session
from app.core.database import get_db
from app.core.security import require_auth
from app.services.ai_service import AIRecommendationService
from datetime import datetime

bp = Blueprint('ai', __name__, url_prefix='/ai')


@bp.route('/patterns', methods=['GET'])
@require_auth
def get_patterns():
    """Retorna análise de padrões do usuário"""
    try:
        user_id = session['user_id']
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT date, time, service_name, barber_name, status
            FROM appointments
            WHERE user_id = ? AND status != 'cancelado'
            ORDER BY date DESC, time DESC
        ''', (user_id,))
        
        appointments = []
        for row in cursor.fetchall():
            appointments.append(dict(row))
        
        conn.close()
        
        # Analisa padrões
        patterns = AIRecommendationService.analyze_user_patterns(appointments)
        
        return jsonify({
            'success': True,
            'data': patterns
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/suggest-appointment', methods=['GET'])
@require_auth
def suggest_appointment():
    """Sugere próximos horários ideais"""
    try:
        user_id = session['user_id']
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT date, time, service_name, barber_name
            FROM appointments
            WHERE user_id = ? AND status != 'cancelado'
            ORDER BY date DESC, time DESC
        ''', (user_id,))
        
        appointments = []
        last_date = None
        
        for row in cursor.fetchall():
            apt = dict(row)
            appointments.append(apt)
            
            if not last_date:
                try:
                    last_date = datetime.strptime(apt['date'], '%Y-%m-%d')
                except:
                    pass
        
        conn.close()
        
        # Analisa padrões
        patterns = AIRecommendationService.analyze_user_patterns(appointments)
        
        # Gera sugestões
        suggestions = AIRecommendationService.suggest_next_appointment(
            patterns,
            last_date
        )
        
        return jsonify({
            'success': True,
            'data': {
                'suggestions': suggestions,
                'patterns': patterns
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/insights', methods=['GET'])
@require_auth
def get_insights():
    """Retorna insights personalizados"""
    try:
        user_id = session['user_id']
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT date, time, service_name, barber_name
            FROM appointments
            WHERE user_id = ? AND status != 'cancelado'
        ''', (user_id,))
        
        appointments = []
        for row in cursor.fetchall():
            appointments.append(dict(row))
        
        conn.close()
        
        # Analisa padrões
        patterns = AIRecommendationService.analyze_user_patterns(appointments)
        
        # Gera insights
        insights = AIRecommendationService.get_insights(patterns)
        
        return jsonify({
            'success': True,
            'data': insights
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/recommend-service', methods=['GET'])
@require_auth
def recommend_service():
    """Recomenda serviços baseado em padrões"""
    try:
        user_id = session['user_id']
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Busca agendamentos
        cursor.execute('''
            SELECT date, time, service_name, barber_name
            FROM appointments
            WHERE user_id = ? AND status != 'cancelado'
        ''', (user_id,))
        
        appointments = [dict(row) for row in cursor.fetchall()]
        
        # Busca serviços
        cursor.execute('SELECT id, nome, descricao, preco, duracao FROM services')
        services = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        # Analisa e recomenda
        patterns = AIRecommendationService.analyze_user_patterns(appointments)
        recommendations = AIRecommendationService.recommend_service(patterns, services)
        
        return jsonify({
            'success': True,
            'data': recommendations
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
