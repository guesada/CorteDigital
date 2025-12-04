"""
Serviço de Recomendações com IA
Analisa padrões de agendamento e sugere horários ideais
"""
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from collections import Counter, defaultdict
import statistics

class AIRecommendationService:
    """Serviço de recomendações inteligentes baseado em padrões"""
    
    @staticmethod
    def analyze_user_patterns(user_appointments: List[Dict]) -> Dict:
        """
        Analisa padrões de agendamento do usuário
        
        Args:
            user_appointments: Lista de agendamentos do usuário
            
        Returns:
            Dict com análise de padrões
        """
        if not user_appointments:
            return {
                'preferred_days': [],
                'preferred_times': [],
                'preferred_services': [],
                'preferred_barbers': [],
                'average_interval_days': None,
                'patterns_found': False
            }
        
        # Análise de dias da semana preferidos
        weekdays = []
        times = []
        services = []
        barbers = []
        dates = []
        
        for apt in user_appointments:
            try:
                # Data e hora
                apt_date = datetime.strptime(apt['date'], '%Y-%m-%d')
                weekdays.append(apt_date.weekday())
                dates.append(apt_date)
                
                # Hora
                if 'time' in apt:
                    times.append(apt['time'])
                
                # Serviço
                if 'service_name' in apt:
                    services.append(apt['service_name'])
                
                # Barbeiro
                if 'barber_name' in apt:
                    barbers.append(apt['barber_name'])
                    
            except (ValueError, KeyError):
                continue
        
        # Calcula padrões
        weekday_counter = Counter(weekdays)
        time_counter = Counter(times)
        service_counter = Counter(services)
        barber_counter = Counter(barbers)
        
        # Dias da semana mais comuns
        preferred_days = [
            {
                'day': day,
                'day_name': ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][day],
                'count': count,
                'percentage': round(count / len(weekdays) * 100, 1)
            }
            for day, count in weekday_counter.most_common(3)
        ]
        
        # Horários mais comuns
        preferred_times = [
            {
                'time': time,
                'count': count,
                'percentage': round(count / len(times) * 100, 1)
            }
            for time, count in time_counter.most_common(3)
        ] if times else []
        
        # Serviços mais comuns
        preferred_services = [
            {
                'service': service,
                'count': count,
                'percentage': round(count / len(services) * 100, 1)
            }
            for service, count in service_counter.most_common(3)
        ] if services else []
        
        # Barbeiros mais comuns
        preferred_barbers = [
            {
                'barber': barber,
                'count': count,
                'percentage': round(count / len(barbers) * 100, 1)
            }
            for barber, count in barber_counter.most_common(3)
        ] if barbers else []
        
        # Intervalo médio entre agendamentos
        average_interval = None
        if len(dates) >= 2:
            sorted_dates = sorted(dates)
            intervals = [
                (sorted_dates[i+1] - sorted_dates[i]).days
                for i in range(len(sorted_dates) - 1)
            ]
            if intervals:
                average_interval = round(statistics.mean(intervals), 1)
        
        return {
            'preferred_days': preferred_days,
            'preferred_times': preferred_times,
            'preferred_services': preferred_services,
            'preferred_barbers': preferred_barbers,
            'average_interval_days': average_interval,
            'patterns_found': len(user_appointments) >= 3,
            'total_appointments': len(user_appointments)
        }
    
    @staticmethod
    def suggest_next_appointment(
        patterns: Dict,
        last_appointment_date: Optional[datetime] = None,
        available_slots: List[Dict] = None
    ) -> List[Dict]:
        """
        Sugere próximos horários de agendamento baseado em padrões
        
        Args:
            patterns: Padrões analisados do usuário
            last_appointment_date: Data do último agendamento
            available_slots: Slots disponíveis
            
        Returns:
            Lista de sugestões ordenadas por relevância
        """
        suggestions = []
        
        if not patterns.get('patterns_found'):
            # Sem padrões suficientes, retorna sugestões genéricas
            return AIRecommendationService._get_generic_suggestions(available_slots)
        
        # Calcula data sugerida baseada no intervalo médio
        suggested_date = None
        if last_appointment_date and patterns.get('average_interval_days'):
            suggested_date = last_appointment_date + timedelta(days=patterns['average_interval_days'])
            
            # Ajusta para dia útil se cair em domingo
            if suggested_date.weekday() == 6:
                suggested_date += timedelta(days=1)
        
        # Dias preferidos
        preferred_days = [p['day'] for p in patterns.get('preferred_days', [])]
        
        # Horários preferidos
        preferred_times = [p['time'] for p in patterns.get('preferred_times', [])]
        
        # Gera sugestões
        today = datetime.now()
        for days_ahead in range(1, 31):  # Próximos 30 dias
            check_date = today + timedelta(days=days_ahead)
            
            # Pula domingos
            if check_date.weekday() == 6:
                continue
            
            # Calcula score de relevância
            score = 0
            reasons = []
            
            # Bonus se for dia preferido
            if check_date.weekday() in preferred_days:
                score += 30
                day_name = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][check_date.weekday()]
                reasons.append(f"Você costuma agendar às {day_name}s")
            
            # Bonus se for próximo da data sugerida
            if suggested_date:
                days_diff = abs((check_date - suggested_date).days)
                if days_diff <= 3:
                    score += 40 - (days_diff * 10)
                    reasons.append(f"Baseado no seu intervalo médio de {patterns['average_interval_days']} dias")
            
            # Bonus para datas mais próximas (mas não muito próximas)
            if 3 <= days_ahead <= 7:
                score += 20
            elif 8 <= days_ahead <= 14:
                score += 10
            
            # Para cada horário preferido
            for pref_time in preferred_times[:2]:  # Top 2 horários
                suggestion = {
                    'date': check_date.strftime('%Y-%m-%d'),
                    'date_formatted': check_date.strftime('%d/%m/%Y'),
                    'day_name': ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][check_date.weekday()],
                    'time': pref_time,
                    'score': score + 20,  # Bonus por horário preferido
                    'reasons': reasons + [f"Você costuma agendar às {pref_time}"],
                    'confidence': 'high' if score >= 50 else 'medium'
                }
                suggestions.append(suggestion)
        
        # Ordena por score e retorna top 5
        suggestions.sort(key=lambda x: x['score'], reverse=True)
        return suggestions[:5]
    
    @staticmethod
    def _get_generic_suggestions(available_slots: List[Dict] = None) -> List[Dict]:
        """Retorna sugestões genéricas quando não há padrões"""
        suggestions = []
        today = datetime.now()
        
        # Horários populares genéricos
        popular_times = ['09:00', '10:00', '14:00', '15:00', '16:00']
        
        for days_ahead in [3, 7, 10, 14, 21]:
            check_date = today + timedelta(days=days_ahead)
            
            # Pula domingos
            if check_date.weekday() == 6:
                check_date += timedelta(days=1)
            
            for time in popular_times[:2]:
                suggestions.append({
                    'date': check_date.strftime('%Y-%m-%d'),
                    'date_formatted': check_date.strftime('%d/%m/%Y'),
                    'day_name': ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][check_date.weekday()],
                    'time': time,
                    'score': 10,
                    'reasons': ['Horário popular'],
                    'confidence': 'low'
                })
        
        return suggestions[:5]
    
    @staticmethod
    def recommend_service(patterns: Dict, all_services: List[Dict]) -> List[Dict]:
        """
        Recomenda serviços baseado em padrões
        
        Args:
            patterns: Padrões do usuário
            all_services: Lista de todos os serviços disponíveis
            
        Returns:
            Lista de serviços recomendados
        """
        if not patterns.get('patterns_found'):
            # Retorna serviços mais populares
            return sorted(all_services, key=lambda x: x.get('popularity', 0), reverse=True)[:3]
        
        preferred_services = [p['service'] for p in patterns.get('preferred_services', [])]
        
        recommendations = []
        
        for service in all_services:
            score = 0
            reasons = []
            
            # Serviço já usado
            if service['nome'] in preferred_services:
                score += 50
                reasons.append('Você já usou este serviço')
            
            # Serviços complementares
            if 'Corte' in preferred_services and service['nome'] == 'Barba':
                score += 30
                reasons.append('Complementa seu corte de cabelo')
            
            if 'Barba' in preferred_services and service['nome'] == 'Corte':
                score += 30
                reasons.append('Complementa sua barba')
            
            # Combos
            if service['nome'] == 'Corte + Barba' and ('Corte' in preferred_services or 'Barba' in preferred_services):
                score += 40
                reasons.append('Combo econômico dos seus serviços favoritos')
            
            recommendations.append({
                **service,
                'recommendation_score': score,
                'recommendation_reasons': reasons
            })
        
        # Ordena por score
        recommendations.sort(key=lambda x: x['recommendation_score'], reverse=True)
        return recommendations[:5]
    
    @staticmethod
    def recommend_barber(patterns: Dict, all_barbers: List[Dict]) -> List[Dict]:
        """
        Recomenda barbeiros baseado em padrões
        
        Args:
            patterns: Padrões do usuário
            all_barbers: Lista de todos os barbeiros
            
        Returns:
            Lista de barbeiros recomendados
        """
        if not patterns.get('patterns_found'):
            return all_barbers
        
        preferred_barbers = [p['barber'] for p in patterns.get('preferred_barbers', [])]
        
        recommendations = []
        
        for barber in all_barbers:
            score = 0
            reasons = []
            
            # Barbeiro já usado
            if barber['nome'] in preferred_barbers:
                score += 100
                count = next((p['count'] for p in patterns['preferred_barbers'] if p['barber'] == barber['nome']), 0)
                reasons.append(f'Você já agendou {count}x com este profissional')
            
            recommendations.append({
                **barber,
                'recommendation_score': score,
                'recommendation_reasons': reasons
            })
        
        # Ordena por score
        recommendations.sort(key=lambda x: x['recommendation_score'], reverse=True)
        return recommendations
    
    @staticmethod
    def get_insights(patterns: Dict) -> List[Dict]:
        """
        Gera insights sobre os padrões do usuário
        
        Args:
            patterns: Padrões analisados
            
        Returns:
            Lista de insights
        """
        insights = []
        
        if not patterns.get('patterns_found'):
            return [{
                'type': 'info',
                'icon': '💡',
                'title': 'Comece sua jornada',
                'message': 'Faça mais agendamentos para receber recomendações personalizadas!'
            }]
        
        # Insight sobre dia preferido
        if patterns.get('preferred_days'):
            top_day = patterns['preferred_days'][0]
            insights.append({
                'type': 'success',
                'icon': '📅',
                'title': 'Seu dia favorito',
                'message': f"Você prefere agendar às {top_day['day_name']}s ({top_day['percentage']}% dos agendamentos)"
            })
        
        # Insight sobre horário
        if patterns.get('preferred_times'):
            top_time = patterns['preferred_times'][0]
            insights.append({
                'type': 'success',
                'icon': '⏰',
                'title': 'Seu horário ideal',
                'message': f"Você costuma agendar às {top_time['time']} ({top_time['percentage']}% das vezes)"
            })
        
        # Insight sobre frequência
        if patterns.get('average_interval_days'):
            interval = patterns['average_interval_days']
            if interval <= 15:
                frequency = 'quinzenal'
            elif interval <= 30:
                frequency = 'mensal'
            else:
                frequency = f'a cada {int(interval)} dias'
            
            insights.append({
                'type': 'info',
                'icon': '📊',
                'title': 'Sua frequência',
                'message': f"Você costuma voltar {frequency}"
            })
        
        # Insight sobre serviço favorito
        if patterns.get('preferred_services'):
            top_service = patterns['preferred_services'][0]
            insights.append({
                'type': 'success',
                'icon': '✂️',
                'title': 'Seu serviço favorito',
                'message': f"{top_service['service']} ({top_service['percentage']}% dos agendamentos)"
            })
        
        # Insight sobre fidelidade
        total = patterns.get('total_appointments', 0)
        if total >= 10:
            insights.append({
                'type': 'achievement',
                'icon': '🏆',
                'title': 'Cliente VIP',
                'message': f"Você já fez {total} agendamentos! Obrigado pela confiança!"
            })
        elif total >= 5:
            insights.append({
                'type': 'achievement',
                'icon': '⭐',
                'title': 'Cliente frequente',
                'message': f"{total} agendamentos realizados. Continue assim!"
            })
        
        return insights
