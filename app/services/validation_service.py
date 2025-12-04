"""
Serviço de Validação - Email, Telefone e Dados
"""
import re
import secrets
from datetime import datetime, timedelta
from typing import Optional, Tuple
import phonenumbers
from email_validator import validate_email, EmailNotValidError

class ValidationService:
    """Serviço para validação de dados de usuários"""
    
    # Padrões de validação
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PHONE_PATTERN = re.compile(r'^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$')
    
    @staticmethod
    def validate_email_format(email: str) -> Tuple[bool, Optional[str]]:
        """
        Valida formato de email
        
        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        if not email:
            return False, "Email é obrigatório"
        
        try:
            # Validação básica de formato
            if not ValidationService.EMAIL_PATTERN.match(email):
                return False, "Formato de email inválido"
            
            # Validação avançada com email-validator
            valid = validate_email(email, check_deliverability=False)
            normalized_email = valid.email
            
            return True, None
            
        except EmailNotValidError as e:
            return False, str(e)
        except Exception as e:
            return False, "Erro ao validar email"
    
    @staticmethod
    def validate_phone_format(phone: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Valida formato de telefone brasileiro
        
        Returns:
            Tuple[bool, Optional[str], Optional[str]]: (is_valid, error_message, formatted_phone)
        """
        if not phone:
            return False, "Telefone é obrigatório", None
        
        try:
            # Remove caracteres não numéricos
            clean_phone = re.sub(r'\D', '', phone)
            
            # Verifica se tem DDD (11 dígitos) ou não (9 dígitos)
            if len(clean_phone) < 10 or len(clean_phone) > 11:
                return False, "Telefone deve ter 10 ou 11 dígitos", None
            
            # Adiciona código do país se não tiver
            if not clean_phone.startswith('55'):
                clean_phone = '55' + clean_phone
            
            # Valida com phonenumbers
            parsed = phonenumbers.parse('+' + clean_phone, None)
            
            if not phonenumbers.is_valid_number(parsed):
                return False, "Número de telefone inválido", None
            
            # Formata o número
            formatted = phonenumbers.format_number(
                parsed, 
                phonenumbers.PhoneNumberFormat.NATIONAL
            )
            
            return True, None, formatted
            
        except phonenumbers.NumberParseException:
            return False, "Formato de telefone inválido", None
        except Exception as e:
            return False, "Erro ao validar telefone", None
    
    @staticmethod
    def validate_cpf(cpf: str) -> Tuple[bool, Optional[str]]:
        """
        Valida CPF brasileiro
        
        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        if not cpf:
            return False, "CPF é obrigatório"
        
        # Remove caracteres não numéricos
        cpf = re.sub(r'\D', '', cpf)
        
        # Verifica se tem 11 dígitos
        if len(cpf) != 11:
            return False, "CPF deve ter 11 dígitos"
        
        # Verifica se todos os dígitos são iguais
        if cpf == cpf[0] * 11:
            return False, "CPF inválido"
        
        # Valida primeiro dígito verificador
        sum_digits = sum(int(cpf[i]) * (10 - i) for i in range(9))
        digit1 = (sum_digits * 10 % 11) % 10
        
        if int(cpf[9]) != digit1:
            return False, "CPF inválido"
        
        # Valida segundo dígito verificador
        sum_digits = sum(int(cpf[i]) * (11 - i) for i in range(10))
        digit2 = (sum_digits * 10 % 11) % 10
        
        if int(cpf[10]) != digit2:
            return False, "CPF inválido"
        
        return True, None
    
    @staticmethod
    def validate_password_strength(password: str) -> Tuple[bool, Optional[str], int]:
        """
        Valida força da senha
        
        Returns:
            Tuple[bool, Optional[str], int]: (is_valid, error_message, strength_score)
        """
        if not password:
            return False, "Senha é obrigatória", 0
        
        score = 0
        errors = []
        
        # Comprimento mínimo
        if len(password) < 8:
            errors.append("Senha deve ter no mínimo 8 caracteres")
        else:
            score += 1
        
        # Letra maiúscula
        if re.search(r'[A-Z]', password):
            score += 1
        else:
            errors.append("Senha deve conter letra maiúscula")
        
        # Letra minúscula
        if re.search(r'[a-z]', password):
            score += 1
        else:
            errors.append("Senha deve conter letra minúscula")
        
        # Número
        if re.search(r'\d', password):
            score += 1
        else:
            errors.append("Senha deve conter número")
        
        # Caractere especial
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 1
        
        # Comprimento extra
        if len(password) >= 12:
            score += 1
        
        is_valid = score >= 4
        error_message = "; ".join(errors) if errors else None
        
        return is_valid, error_message, score
    
    @staticmethod
    def generate_verification_token() -> str:
        """Gera token de verificação seguro"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_date_range(start_date: datetime, end_date: datetime) -> Tuple[bool, Optional[str]]:
        """
        Valida intervalo de datas
        
        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        if not start_date or not end_date:
            return False, "Datas são obrigatórias"
        
        if start_date > end_date:
            return False, "Data inicial deve ser anterior à data final"
        
        if start_date < datetime.now():
            return False, "Data inicial não pode ser no passado"
        
        # Máximo de 1 ano no futuro
        max_date = datetime.now() + timedelta(days=365)
        if end_date > max_date:
            return False, "Data final não pode ser superior a 1 ano"
        
        return True, None
    
    @staticmethod
    def sanitize_input(text: str, max_length: int = 255) -> str:
        """
        Remove caracteres perigosos e limita tamanho
        
        Args:
            text: Texto a ser sanitizado
            max_length: Tamanho máximo permitido
            
        Returns:
            str: Texto sanitizado
        """
        if not text:
            return ""
        
        # Remove tags HTML
        text = re.sub(r'<[^>]+>', '', text)
        
        # Remove caracteres de controle
        text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
        
        # Limita tamanho
        text = text[:max_length]
        
        # Remove espaços extras
        text = ' '.join(text.split())
        
        return text.strip()
    
    @staticmethod
    def validate_appointment_time(date_str: str, time_str: str) -> Tuple[bool, Optional[str]]:
        """
        Valida data e hora de agendamento
        
        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        try:
            # Combina data e hora
            datetime_str = f"{date_str} {time_str}"
            appointment_datetime = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M")
            
            # Verifica se é no passado
            if appointment_datetime < datetime.now():
                return False, "Não é possível agendar no passado"
            
            # Verifica se é muito no futuro (máximo 6 meses)
            max_future = datetime.now() + timedelta(days=180)
            if appointment_datetime > max_future:
                return False, "Agendamento não pode ser superior a 6 meses"
            
            # Verifica horário comercial (8h às 18h)
            hour = appointment_datetime.hour
            if hour < 8 or hour >= 18:
                return False, "Horário deve estar entre 8h e 18h"
            
            # Verifica se é dia útil (segunda a sábado)
            weekday = appointment_datetime.weekday()
            if weekday == 6:  # Domingo
                return False, "Não atendemos aos domingos"
            
            return True, None
            
        except ValueError:
            return False, "Formato de data/hora inválido"
        except Exception as e:
            return False, "Erro ao validar agendamento"


class RateLimiter:
    """Controle de taxa de requisições"""
    
    def __init__(self):
        self.requests = {}
    
    def is_allowed(self, identifier: str, max_requests: int = 10, window_seconds: int = 60) -> bool:
        """
        Verifica se requisição é permitida
        
        Args:
            identifier: Identificador único (IP, user_id, etc)
            max_requests: Número máximo de requisições
            window_seconds: Janela de tempo em segundos
            
        Returns:
            bool: True se permitido, False se bloqueado
        """
        now = datetime.now()
        
        # Limpa requisições antigas
        if identifier in self.requests:
            self.requests[identifier] = [
                req_time for req_time in self.requests[identifier]
                if (now - req_time).total_seconds() < window_seconds
            ]
        else:
            self.requests[identifier] = []
        
        # Verifica limite
        if len(self.requests[identifier]) >= max_requests:
            return False
        
        # Adiciona nova requisição
        self.requests[identifier].append(now)
        return True
    
    def get_remaining_requests(self, identifier: str, max_requests: int = 10) -> int:
        """Retorna número de requisições restantes"""
        if identifier not in self.requests:
            return max_requests
        
        return max(0, max_requests - len(self.requests[identifier]))


# Instância global do rate limiter
rate_limiter = RateLimiter()
