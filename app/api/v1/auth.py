"""
Auth API - Endpoints de autenticação
"""
from flask import Blueprint, request, jsonify, session
from app.core.database import get_db
from app.core.exceptions import ValidationError, AuthenticationError
from app.services.validation_service import ValidationService

bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/login', methods=['POST'])
def login():
    """Login de usuário"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validação
        if not email or not password:
            raise ValidationError('Email e senha são obrigatórios')
        
        # Validar formato de email
        is_valid, error = ValidationService.validate_email_format(email)
        if not is_valid:
            raise ValidationError(error)
        
        # Buscar usuário
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise AuthenticationError('Email ou senha incorretos')
        
        # Verificar senha (simplificado - usar bcrypt em produção)
        if user['password'] != password:
            raise AuthenticationError('Email ou senha incorretos')
        
        # Criar sessão
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['user_email'] = user['email']
        session['user_role'] = user['role']
        
        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'data': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'role': user['role']
            }
        })
        
    except (ValidationError, AuthenticationError) as e:
        raise e
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/register', methods=['POST'])
def register():
    """Registro de novo usuário"""
    try:
        data = request.get_json()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        password = data.get('password', '')
        
        # Validações
        if not all([name, email, phone, password]):
            raise ValidationError('Todos os campos são obrigatórios')
        
        # Validar email
        is_valid, error = ValidationService.validate_email_format(email)
        if not is_valid:
            raise ValidationError(f'Email: {error}')
        
        # Validar telefone
        is_valid, error, formatted_phone = ValidationService.validate_phone_format(phone)
        if not is_valid:
            raise ValidationError(f'Telefone: {error}')
        
        # Validar senha
        is_valid, error, score = ValidationService.validate_password_strength(password)
        if not is_valid:
            raise ValidationError(f'Senha: {error}')
        
        # Verificar se email já existe
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            raise ValidationError('Email já cadastrado')
        
        # Criar usuário
        cursor.execute('''
            INSERT INTO users (name, email, phone, password, role)
            VALUES (?, ?, ?, ?, ?)
        ''', (name, email, formatted_phone, password, 'cliente'))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Criar sessão
        session['user_id'] = user_id
        session['user_name'] = name
        session['user_email'] = email
        session['user_role'] = 'cliente'
        
        return jsonify({
            'success': True,
            'message': 'Cadastro realizado com sucesso',
            'data': {
                'id': user_id,
                'name': name,
                'email': email,
                'role': 'cliente'
            }
        }), 201
        
    except ValidationError as e:
        raise e
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@bp.route('/logout', methods=['POST'])
def logout():
    """Logout de usuário"""
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logout realizado com sucesso'
    })


@bp.route('/me', methods=['GET'])
def get_current_user():
    """Retorna dados do usuário logado"""
    if 'user_id' not in session:
        raise AuthenticationError('Não autenticado')
    
    return jsonify({
        'success': True,
        'data': {
            'id': session['user_id'],
            'name': session['user_name'],
            'email': session['user_email'],
            'role': session['user_role']
        }
    })
