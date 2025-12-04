"""
Serviço de Analytics e Estatísticas
Dashboard com gráficos e métricas
"""
from datetime import datetime, timedelta
from app.core.database import get_db as get_database_connection


def get_dashboard_stats(user_id, user_type):
    """Obtém estatísticas para o dashboard"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        if user_type == 'barbeiro':
            return get_barber_stats(cursor, user_id)
        else:
            return get_client_stats(cursor, user_id)
    finally:
        cursor.close()
        conn.close()


def get_barber_stats(cursor, barbeiro_id):
    """Estatísticas do barbeiro"""
    stats = {}
    
    # Total de agendamentos
    cursor.execute("""
        SELECT COUNT(*) as total FROM appointments
        WHERE barbeiro_id = %s
    """, (barbeiro_id,))
    stats['total_appointments'] = cursor.fetchone()['total']
    
    # Agendamentos este mês
    cursor.execute("""
        SELECT COUNT(*) as total FROM appointments
        WHERE barbeiro_id = %s 
        AND MONTH(data) = MONTH(CURRENT_DATE())
        AND YEAR(data) = YEAR(CURRENT_DATE())
    """, (barbeiro_id,))
    stats['appointments_this_month'] = cursor.fetchone()['total']
    
    # Faturamento este mês
    cursor.execute("""
        SELECT COALESCE(SUM(s.preco), 0) as total
        FROM appointments a
        JOIN services s ON a.servico_id = s.id
        WHERE a.barbeiro_id = %s 
        AND a.status = 'concluido'
        AND MONTH(a.data) = MONTH(CURRENT_DATE())
        AND YEAR(a.data) = YEAR(CURRENT_DATE())
    """, (barbeiro_id,))
    stats['revenue_this_month'] = float(cursor.fetchone()['total'])
    
    # Clientes únicos
    cursor.execute("""
        SELECT COUNT(DISTINCT cliente_id) as total
        FROM appointments
        WHERE barbeiro_id = %s
    """, (barbeiro_id,))
    stats['unique_clients'] = cursor.fetchone()['total']
    
    # Próximos agendamentos
    cursor.execute("""
        SELECT COUNT(*) as total FROM appointments
        WHERE barbeiro_id = %s 
        AND status = 'agendado'
        AND CONCAT(data, ' ', horario) >= NOW()
    """, (barbeiro_id,))
    stats['upcoming_appointments'] = cursor.fetchone()['total']
    
    # Taxa de conclusão
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as concluidos
        FROM appointments
        WHERE barbeiro_id = %s
    """, (barbeiro_id,))
    result = cursor.fetchone()
    if result['total'] > 0:
        stats['completion_rate'] = (result['concluidos'] / result['total']) * 100
    else:
        stats['completion_rate'] = 0
    
    return stats


def get_client_stats(cursor, cliente_id):
    """Estatísticas do cliente"""
    stats = {}
    
    # Total de agendamentos
    cursor.execute("""
        SELECT COUNT(*) as total FROM appointments
        WHERE cliente_id = %s
    """, (cliente_id,))
    stats['total_appointments'] = cursor.fetchone()['total']
    
    # Agendamentos concluídos
    cursor.execute("""
        SELECT COUNT(*) as total FROM appointments
        WHERE cliente_id = %s AND status = 'concluido'
    """, (cliente_id,))
    stats['completed_appointments'] = cursor.fetchone()['total']
    
    # Total gasto
    cursor.execute("""
        SELECT COALESCE(SUM(s.preco), 0) as total
        FROM appointments a
        JOIN services s ON a.servico_id = s.id
        WHERE a.cliente_id = %s AND a.status = 'concluido'
    """, (cliente_id,))
    stats['total_spent'] = float(cursor.fetchone()['total'])
    
    # Próximos agendamentos
    cursor.execute("""
        SELECT COUNT(*) as total FROM appointments
        WHERE cliente_id = %s 
        AND status = 'agendado'
        AND CONCAT(data, ' ', horario) >= NOW()
    """, (cliente_id,))
    stats['upcoming_appointments'] = cursor.fetchone()['total']
    
    return stats


def get_appointments_chart_data(user_id, user_type, period='month'):
    """Dados para gráfico de agendamentos"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        if period == 'week':
            days = 7
            date_format = '%d/%m'
        elif period == 'month':
            days = 30
            date_format = '%d/%m'
        else:  # year
            days = 365
            date_format = '%m/%Y'
        
        user_field = 'barbeiro_id' if user_type == 'barbeiro' else 'cliente_id'
        
        cursor.execute(f"""
            SELECT 
                DATE(data) as date,
                COUNT(*) as count
            FROM appointments
            WHERE {user_field} = %s
            AND data >= DATE_SUB(CURRENT_DATE(), INTERVAL %s DAY)
            GROUP BY DATE(data)
            ORDER BY date
        """, (user_id, days))
        
        results = cursor.fetchall()
        
        # Formata dados
        labels = []
        data = []
        for row in results:
            labels.append(row['date'].strftime(date_format))
            data.append(row['count'])
        
        return {
            'labels': labels,
            'data': data
        }
        
    finally:
        cursor.close()
        conn.close()


def get_revenue_chart_data(barbeiro_id, period='month'):
    """Dados para gráfico de faturamento (apenas barbeiro)"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        if period == 'week':
            days = 7
            date_format = '%d/%m'
        elif period == 'month':
            days = 30
            date_format = '%d/%m'
        else:  # year
            days = 365
            date_format = '%m/%Y'
        
        cursor.execute("""
            SELECT 
                DATE(a.data) as date,
                COALESCE(SUM(s.preco), 0) as revenue
            FROM appointments a
            JOIN services s ON a.servico_id = s.id
            WHERE a.barbeiro_id = %s
            AND a.status = 'concluido'
            AND a.data >= DATE_SUB(CURRENT_DATE(), INTERVAL %s DAY)
            GROUP BY DATE(a.data)
            ORDER BY date
        """, (barbeiro_id, days))
        
        results = cursor.fetchall()
        
        labels = []
        data = []
        for row in results:
            labels.append(row['date'].strftime(date_format))
            data.append(float(row['revenue']))
        
        return {
            'labels': labels,
            'data': data
        }
        
    finally:
        cursor.close()
        conn.close()


def get_services_distribution(user_id, user_type):
    """Distribuição de serviços mais populares"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        user_field = 'barbeiro_id' if user_type == 'barbeiro' else 'cliente_id'
        
        cursor.execute(f"""
            SELECT 
                s.nome as service,
                COUNT(*) as count
            FROM appointments a
            JOIN services s ON a.servico_id = s.id
            WHERE a.{user_field} = %s
            GROUP BY s.id, s.nome
            ORDER BY count DESC
            LIMIT 5
        """, (user_id,))
        
        results = cursor.fetchall()
        
        labels = [row['service'] for row in results]
        data = [row['count'] for row in results]
        
        return {
            'labels': labels,
            'data': data
        }
        
    finally:
        cursor.close()
        conn.close()


def get_peak_hours(barbeiro_id):
    """Horários de pico (apenas barbeiro)"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                HOUR(horario) as hour,
                COUNT(*) as count
            FROM appointments
            WHERE barbeiro_id = %s
            GROUP BY HOUR(horario)
            ORDER BY hour
        """, (barbeiro_id,))
        
        results = cursor.fetchall()
        
        labels = [f"{row['hour']:02d}:00" for row in results]
        data = [row['count'] for row in results]
        
        return {
            'labels': labels,
            'data': data
        }
        
    finally:
        cursor.close()
        conn.close()


def get_top_clients(barbeiro_id, limit=10):
    """Clientes mais frequentes (apenas barbeiro)"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                c.nome,
                COUNT(*) as visits,
                COALESCE(SUM(s.preco), 0) as total_spent
            FROM appointments a
            JOIN clientes c ON a.cliente_id = c.id
            JOIN services s ON a.servico_id = s.id
            WHERE a.barbeiro_id = %s
            AND a.status = 'concluido'
            GROUP BY c.id, c.nome
            ORDER BY visits DESC
            LIMIT %s
        """, (barbeiro_id, limit))
        
        results = cursor.fetchall()
        
        for row in results:
            row['total_spent'] = float(row['total_spent'])
        
        return results
        
    finally:
        cursor.close()
        conn.close()


def get_monthly_comparison(user_id, user_type):
    """Comparação mês atual vs mês anterior"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        user_field = 'barbeiro_id' if user_type == 'barbeiro' else 'cliente_id'
        
        # Mês atual
        cursor.execute(f"""
            SELECT COUNT(*) as count
            FROM appointments
            WHERE {user_field} = %s
            AND MONTH(data) = MONTH(CURRENT_DATE())
            AND YEAR(data) = YEAR(CURRENT_DATE())
        """, (user_id,))
        current_month = cursor.fetchone()['count']
        
        # Mês anterior
        cursor.execute(f"""
            SELECT COUNT(*) as count
            FROM appointments
            WHERE {user_field} = %s
            AND MONTH(data) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
            AND YEAR(data) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
        """, (user_id,))
        previous_month = cursor.fetchone()['count']
        
        # Calcula variação percentual
        if previous_month > 0:
            change = ((current_month - previous_month) / previous_month) * 100
        else:
            change = 100 if current_month > 0 else 0
        
        return {
            'current': current_month,
            'previous': previous_month,
            'change': round(change, 1)
        }
        
    finally:
        cursor.close()
        conn.close()
