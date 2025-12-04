"""
Appointments API - Endpoints de agendamentos
"""
from flask import Blueprint, request, jsonify, session
from app.core.database import get_db
from app.core.security import require_auth
from app.core.exceptions import ValidationError, NotFoundError
from app.services.validation_service import ValidationService
from datetime import datetime

bp = Blueprint('appointments', __name__, url_prefix='/appointments')


@bp.route('', methods=['GET'])
@require_auth
def list_appointments():
    """Lista agendamentos do usuário"""
    try:
        user_id = session['user_id']
        user_role = session['user_role']
        
        conn = get_db()
        cursor = conn.cursor()
        
        if user_role == 'barbeiro':
            # Barbeiro vê seus agendamentos
            cursor.execute('''
                SELECT * FROM appointments 
                WHERE barber_id = ?
                ORDER BY date DESC, time DESC
            ''', (user_id,))
        else:
            # Cliente vê seus agendamentos
            cursor.execute('''
                SELECT * FROM appointments 
                WHERE user_id = ?
                ORDER BY date DESC, time DESC
            ''', (user_id,))
        
        appointments = []
        for row in cursor.fetchall():
            appointments.append(dict(row))
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': appointments,
            'total': len(appointments)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('', methods=['POST'])
@require_auth
def create_appointment():
    """Cria novo agendamento"""
    try:
        data = request.get_json()
        user_id = session['user_id']
        
        # Validar dados
        barber_id = data.get('barberId')
        service_id = data.get('serviceId')
        date = data.get('date')
        time = data.get('time')
        
        if not all([barber_id, service_id, date, time]):
            raise ValidationError('Todos os campos são obrigatórios')
        
        # Validar data e hora
        is_valid, error = ValidationService.validate_appointment_time(date, time)
        if not is_valid:
            raise ValidationError(error)
        
        # Verificar disponibilidade
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id FROM appointments
            WHERE barber_id = ? AND date = ? AND time = ? AND status != 'cancelado'
        ''', (barber_id, date, time))
        
        if cursor.fetchone():
            conn.close()
            raise ValidationError('Horário não disponível')
        
        # Buscar informações do serviço e barbeiro
        cursor.execute('SELECT nome, preco FROM services WHERE id = ?', (service_id,))
        service = cursor.fetchone()
        
        cursor.execute('SELECT nome FROM barbers WHERE id = ?', (barber_id,))
        barber = cursor.fetchone()
        
        if not service or not barber:
            conn.close()
            raise NotFoundError('Serviço ou barbeiro não encontrado')
        
        # Criar agendamento
        cursor.execute('''
            INSERT INTO appointments 
            (user_id, barber_id, barber_name, service_id, service_name, date, time, status, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, barber_id, barber['nome'], service_id, service['nome'], 
              date, time, 'pendente', service['preco']))
        
        appointment_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Agendamento criado com sucesso',
            'data': {
                'id': appointment_id,
                'date': date,
                'time': time,
                'status': 'pendente'
            }
        }), 201
        
    except (ValidationError, NotFoundError) as e:
        raise e
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/<int:appointment_id>', methods=['GET'])
@require_auth
def get_appointment(appointment_id):
    """Retorna detalhes de um agendamento"""
    try:
        user_id = session['user_id']
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM appointments WHERE id = ?', (appointment_id,))
        appointment = cursor.fetchone()
        conn.close()
        
        if not appointment:
            raise NotFoundError('Agendamento não encontrado')
        
        # Verificar permissão
        if appointment['user_id'] != user_id and appointment['barber_id'] != user_id:
            raise ValidationError('Sem permissão para visualizar este agendamento')
        
        return jsonify({
            'success': True,
            'data': dict(appointment)
        })
        
    except (ValidationError, NotFoundError) as e:
        raise e
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/<int:appointment_id>/cancel', methods=['POST'])
@require_auth
def cancel_appointment(appointment_id):
    """Cancela um agendamento"""
    try:
        user_id = session['user_id']
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM appointments WHERE id = ?', (appointment_id,))
        appointment = cursor.fetchone()
        
        if not appointment:
            conn.close()
            raise NotFoundError('Agendamento não encontrado')
        
        # Verificar permissão
        if appointment['user_id'] != user_id:
            conn.close()
            raise ValidationError('Sem permissão para cancelar este agendamento')
        
        # Verificar se pode cancelar
        if appointment['status'] == 'cancelado':
            conn.close()
            raise ValidationError('Agendamento já está cancelado')
        
        if appointment['status'] == 'concluido':
            conn.close()
            raise ValidationError('Não é possível cancelar agendamento concluído')
        
        # Cancelar
        cursor.execute('''
            UPDATE appointments 
            SET status = 'cancelado'
            WHERE id = ?
        ''', (appointment_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Agendamento cancelado com sucesso'
        })
        
    except (ValidationError, NotFoundError) as e:
        raise e
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
