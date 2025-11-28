"""Rotas de avaliações."""
from flask import Blueprint, jsonify, request, session
from db import db, Review, Barber, Cliente, Appointment
from services import exigir_login, usuario_atual

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api/reviews")


@reviews_bp.route("", methods=["GET", "POST"])
def reviews_root():
    """Listar ou criar avaliação."""
    if not exigir_login():
        return jsonify({"success": False, "message": "Não autenticado"}), 401
    
    if request.method == "GET":
        # Listar avaliações (filtrar por barbeiro se fornecido)
        barbeiro_id = request.args.get('barbeiro_id', type=int)
        
        query = Review.query
        if barbeiro_id:
            query = query.filter_by(barbeiro_id=barbeiro_id)
        
        reviews = query.order_by(Review.created_at.desc()).all()
        
        # Adicionar informações do cliente
        result = []
        for review in reviews:
            review_dict = review.to_dict()
            cliente = Cliente.query.get(review.cliente_id)
            if cliente:
                review_dict['cliente_nome'] = cliente.nome
            result.append(review_dict)
        
        return jsonify({"success": True, "data": result})
    
    # POST - Criar avaliação
    user = usuario_atual()
    if user['tipo'] != 'cliente':
        return jsonify({"success": False, "message": "Apenas clientes podem avaliar"}), 403
    
    body = request.get_json() or {}
    
    # Validar dados
    required = ["appointment_id", "barbeiro_id", "rating"]
    if not all(body.get(f) for f in required):
        return jsonify({"success": False, "message": "Dados incompletos"}), 400
    
    rating = int(body["rating"])
    if rating < 1 or rating > 5:
        return jsonify({"success": False, "message": "Avaliação deve ser entre 1 e 5"}), 400
    
    # Verificar se já avaliou este agendamento
    existing = Review.query.filter_by(
        appointment_id=body["appointment_id"],
        cliente_id=user['id']
    ).first()
    
    if existing:
        return jsonify({"success": False, "message": "Você já avaliou este agendamento"}), 400
    
    # Criar avaliação
    review = Review(
        cliente_id=user['id'],
        barbeiro_id=int(body["barbeiro_id"]),
        appointment_id=body["appointment_id"],
        rating=rating,
        comment=body.get("comment", "")
    )
    
    db.session.add(review)
    
    # Atualizar média de avaliação do barbeiro
    barber = Barber.query.get(int(body["barbeiro_id"]))
    if barber:
        reviews_count = Review.query.filter_by(barbeiro_id=barber.id).count()
        avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(barbeiro_id=barber.id).scalar()
        barber.avaliacao = round(avg_rating, 1) if avg_rating else 5.0
    
    db.session.commit()
    
    return jsonify({"success": True, "data": review.to_dict()}), 201


@reviews_bp.route("/barber/<int:barbeiro_id>/stats", methods=["GET"])
def barber_review_stats(barbeiro_id):
    """Estatísticas de avaliações de um barbeiro."""
    if not exigir_login():
        return jsonify({"success": False, "message": "Não autenticado"}), 401
    
    reviews = Review.query.filter_by(barbeiro_id=barbeiro_id).all()
    
    if not reviews:
        return jsonify({
            "success": True,
            "data": {
                "total": 0,
                "average": 5.0,
                "distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            }
        })
    
    # Calcular distribuição
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for review in reviews:
        distribution[review.rating] += 1
    
    avg = sum(r.rating for r in reviews) / len(reviews)
    
    return jsonify({
        "success": True,
        "data": {
            "total": len(reviews),
            "average": round(avg, 1),
            "distribution": distribution
        }
    })
