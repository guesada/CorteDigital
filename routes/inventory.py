"""Rotas de estoque."""
from flask import Blueprint, jsonify, request
from services import list_products, create_product, update_product, delete_product, exigir_login

inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/products")


@inventory_bp.route("", methods=["GET", "POST"])
def products_root():
    if not exigir_login("barbeiro"):
        return jsonify({"success": False, "message": "Apenas barbeiros"}), 401

    if request.method == "GET":
        return jsonify({"success": True, "data": list_products()})

    # POST
    body = request.get_json() or {}
    if not all(body.get(f) for f in ["name", "quantity", "price"]):
        return jsonify({"success": False, "message": "Dados incompletos"}), 400

    return jsonify({"success": True, "data": create_product(body)}), 201


@inventory_bp.route("/<int:product_id>", methods=["PUT", "DELETE"])
def product_detail(product_id: int):
    if not exigir_login("barbeiro"):
        return jsonify({"success": False, "message": "Apenas barbeiros"}), 401

    if request.method == "DELETE":
        if not delete_product(product_id):
            return jsonify({"success": False, "message": "Não encontrado"}), 404
        return jsonify({"success": True})

    # PUT
    updated = update_product(product_id, request.get_json() or {})
    if not updated:
        return jsonify({"success": False, "message": "Não encontrado"}), 404
    return jsonify({"success": True, "data": updated})
