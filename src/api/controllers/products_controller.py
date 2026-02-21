"""
Controlador de productos - Endpoints /api/productos
"""

from flask import Blueprint, request, jsonify,abort  
from flask_jwt_extended import jwt_required
from api.models import db, Product 

product_bp = Blueprint('product', __name__, url_prefix='/product')

@product_bp.route('', methods=['GET'])
# El JWT te obliga a hacer login 
# @jwt_required()/
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products]), 200






@product_bp.route('/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get(id)
    if product is None:
        abort(404, description=f"Producto con id {id} no encontrado")
    return jsonify(product.serialize()), 200


@product_bp.route('', methods=['POST'])
def create_product():
    body = request.get_json()

    if not body:
        abort(400, description="El body no puede estar vacío")

    required_fields = ["name", "price", "stock", "category_id"]
    for field in required_fields:
        if field not in body or body[field] is None:
            abort(400, description=f"El campo '{field}' es obligatorio")

    try:
        new_product = Product(
            name=body["name"],
            description=body.get("description"),
            price=body["price"],
            image_url=body.get("image_url"),
            size=body.get("size"),
            weight=body.get("weight"),
            stock=body["stock"],
            discount=body.get("discount", 0),
            category_id=body["category_id"]
        )
        db.session.add(new_product)
        db.session.commit()
    except Exception:
        db.session.rollback()
        abort(500, description="Error al crear producto")

    return jsonify(new_product.serialize()), 201


@product_bp.route('/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get(id)
    if product is None:
        abort(404, description=f"Producto con id {id} no encontrado")

    body = request.get_json()
    if not body:
        abort(400, description="El body no puede estar vacío")

    try:
        product.name = body.get("name", product.name)
        product.description = body.get("description", product.description)
        product.price = body.get("price", product.price)
        product.image_url = body.get("image_url", product.image_url)
        product.size = body.get("size", product.size)
        product.weight = body.get("weight", product.weight)
        product.stock = body.get("stock", product.stock)
        product.discount = body.get("discount", product.discount)
        product.category_id = body.get("category_id", product.category_id)
        db.session.commit()
    except Exception:
        db.session.rollback()
        abort(500, description="Error al actualizar producto")

    return jsonify(product.serialize()), 200


@product_bp.route('/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get(id)
    if product is None:
        abort(404, description=f"Producto con id {id} no encontrado")

    try:
        db.session.delete(product)
        db.session.commit()
    except Exception:
        db.session.rollback()
        abort(500, description="Error al eliminar producto")

    return jsonify({"message": "Producto eliminado correctamente"}), 200