"""Rotas para gerenciamento de estoque."""

from flask import Blueprint, jsonify, request

from services import list_products, create_product, update_product, delete_product, exigir_login, dados_iniciais

inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/products")


def _estoque(dados):
    return dados.setdefault("estoque", dados_iniciais()["estoque"])


@inventory_bp.route("", methods=["GET", "POST"])
def products_root():
    if not exigir_login("barbeiro"):
        return jsonify({"success": False, "message": "Apenas barbeiros"}), 401

    if request.method == "GET":
        return jsonify({"success": True, "data": list_products()})

    body = request.get_json() or {}
    required = ["name", "quantity", "price"]
    if not all(body.get(field) for field in required):
        return jsonify({"success": False, "message": "Dados incompletos"}), 400

    novo = create_product(body)
    return jsonify({"success": True, "data": novo}), 201


@inventory_bp.route("/<int:product_id>", methods=["PUT", "DELETE"])
def product_detail(product_id: int):
    if not exigir_login("barbeiro"):
        return jsonify({"success": False, "message": "Apenas barbeiros"}), 401

    produto = None
    if request.method == "DELETE":
        ok = delete_product(product_id)
        if not ok:
            return jsonify({"success": False, "message": "Produto não encontrado"}), 404
        return jsonify({"success": True})

    body = request.get_json() or {}
    updated = update_product(product_id, body)
    if not updated:
        return jsonify({"success": False, "message": "Produto não encontrado"}), 404
    return jsonify({"success": True, "data": updated})
