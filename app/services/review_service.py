"""
Serviço de Avaliações e Reviews
Sistema de estrelas e comentários
"""
from datetime import datetime
from app.core.database import get_db as get_database_connection


def create_reviews_table():
    """Cria a tabela de avaliações"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                appointment_id VARCHAR(50) NOT NULL UNIQUE,
                barbeiro_id INT NOT NULL,
                cliente_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
                FOREIGN KEY (barbeiro_id) REFERENCES barbers(id) ON DELETE CASCADE,
                FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
                INDEX idx_barbeiro (barbeiro_id),
                INDEX idx_cliente (cliente_id),
                INDEX idx_rating (rating)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        
        conn.commit()
        print("✅ Tabela de avaliações criada!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao criar tabela de avaliações: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


def create_review(appointment_id, barbeiro_id, cliente_id, rating, comment=''):
    """Cria uma nova avaliação"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        # Verifica se já existe avaliação para este agendamento
        cursor.execute("""
            SELECT id FROM reviews WHERE appointment_id = %s
        """, (appointment_id,))
        
        if cursor.fetchone():
            return {'success': False, 'message': 'Agendamento já avaliado'}
        
        # Cria avaliação
        cursor.execute("""
            INSERT INTO reviews (appointment_id, barbeiro_id, cliente_id, rating, comment)
            VALUES (%s, %s, %s, %s, %s)
        """, (appointment_id, barbeiro_id, cliente_id, rating, comment))
        
        conn.commit()
        review_id = cursor.lastrowid
        
        # Retorna avaliação criada
        cursor.execute("""
            SELECT r.*, c.nome as cliente_nome
            FROM reviews r
            JOIN clientes c ON r.cliente_id = c.id
            WHERE r.id = %s
        """, (review_id,))
        
        review = cursor.fetchone()
        if review and review.get('created_at'):
            review['created_at'] = review['created_at'].isoformat()
        if review and review.get('updated_at'):
            review['updated_at'] = review['updated_at'].isoformat()
        
        return {'success': True, 'review': review}
        
    except Exception as e:
        conn.rollback()
        return {'success': False, 'message': str(e)}
    finally:
        cursor.close()
        conn.close()


def update_review(review_id, cliente_id, rating, comment=''):
    """Atualiza uma avaliação existente"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE reviews
            SET rating = %s, comment = %s
            WHERE id = %s AND cliente_id = %s
        """, (rating, comment, review_id, cliente_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            return {'success': True}
        else:
            return {'success': False, 'message': 'Avaliação não encontrada'}
            
    except Exception as e:
        conn.rollback()
        return {'success': False, 'message': str(e)}
    finally:
        cursor.close()
        conn.close()


def delete_review(review_id, cliente_id):
    """Deleta uma avaliação"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            DELETE FROM reviews
            WHERE id = %s AND cliente_id = %s
        """, (review_id, cliente_id))
        
        conn.commit()
        
        if cursor.rowcount > 0:
            return {'success': True}
        else:
            return {'success': False, 'message': 'Avaliação não encontrada'}
            
    finally:
        cursor.close()
        conn.close()


def get_barbeiro_reviews(barbeiro_id, limit=50):
    """Obtém avaliações de um barbeiro"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT r.*, c.nome as cliente_nome
            FROM reviews r
            JOIN clientes c ON r.cliente_id = c.id
            WHERE r.barbeiro_id = %s
            ORDER BY r.created_at DESC
            LIMIT %s
        """, (barbeiro_id, limit))
        
        reviews = cursor.fetchall()
        
        for review in reviews:
            if review.get('created_at'):
                review['created_at'] = review['created_at'].isoformat()
            if review.get('updated_at'):
                review['updated_at'] = review['updated_at'].isoformat()
        
        return reviews
        
    finally:
        cursor.close()
        conn.close()


def get_barbeiro_rating_summary(barbeiro_id):
    """Obtém resumo de avaliações do barbeiro"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_stars,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_stars,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_stars,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_stars,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM reviews
            WHERE barbeiro_id = %s
        """, (barbeiro_id,))
        
        result = cursor.fetchone()
        
        if result:
            result['average_rating'] = round(float(result['average_rating'] or 0), 1)
        
        return result
        
    finally:
        cursor.close()
        conn.close()


def get_cliente_reviews(cliente_id):
    """Obtém avaliações feitas por um cliente"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT r.*, b.nome as barbeiro_nome
            FROM reviews r
            JOIN barbers b ON r.barbeiro_id = b.id
            WHERE r.cliente_id = %s
            ORDER BY r.created_at DESC
        """, (cliente_id,))
        
        reviews = cursor.fetchall()
        
        for review in reviews:
            if review.get('created_at'):
                review['created_at'] = review['created_at'].isoformat()
            if review.get('updated_at'):
                review['updated_at'] = review['updated_at'].isoformat()
        
        return reviews
        
    finally:
        cursor.close()
        conn.close()


def can_review_appointment(appointment_id, cliente_id):
    """Verifica se o cliente pode avaliar o agendamento"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        # Verifica se o agendamento existe, pertence ao cliente e está concluído
        cursor.execute("""
            SELECT id FROM appointments
            WHERE id = %s 
            AND cliente_id = %s 
            AND status = 'concluido'
        """, (appointment_id, cliente_id))
        
        if not cursor.fetchone():
            return False
        
        # Verifica se já foi avaliado
        cursor.execute("""
            SELECT id FROM reviews WHERE appointment_id = %s
        """, (appointment_id,))
        
        return cursor.fetchone() is None
        
    finally:
        cursor.close()
        conn.close()


def get_pending_reviews(cliente_id):
    """Obtém agendamentos concluídos que ainda não foram avaliados"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                a.id as appointment_id,
                a.data,
                a.horario,
                b.id as barbeiro_id,
                b.nome as barbeiro_nome,
                s.nome as servico_nome
            FROM appointments a
            JOIN barbers b ON a.barbeiro_id = b.id
            JOIN services s ON a.servico_id = s.id
            LEFT JOIN reviews r ON a.id = r.appointment_id
            WHERE a.cliente_id = %s
            AND a.status = 'concluido'
            AND r.id IS NULL
            ORDER BY a.data DESC, a.horario DESC
            LIMIT 10
        """, (cliente_id,))
        
        appointments = cursor.fetchall()
        
        for apt in appointments:
            if apt.get('data'):
                apt['data'] = apt['data'].isoformat()
        
        return appointments
        
    finally:
        cursor.close()
        conn.close()


def get_top_rated_barbers(limit=10):
    """Obtém barbeiros mais bem avaliados"""
    conn = get_database_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                b.id,
                b.nome,
                b.email,
                COUNT(r.id) as total_reviews,
                AVG(r.rating) as average_rating
            FROM barbers b
            LEFT JOIN reviews r ON b.id = r.barbeiro_id
            GROUP BY b.id, b.nome, b.email
            HAVING total_reviews > 0
            ORDER BY average_rating DESC, total_reviews DESC
            LIMIT %s
        """, (limit,))
        
        barbers = cursor.fetchall()
        
        for barber in barbers:
            barber['average_rating'] = round(float(barber['average_rating'] or 0), 1)
        
        return barbers
        
    finally:
        cursor.close()
        conn.close()
