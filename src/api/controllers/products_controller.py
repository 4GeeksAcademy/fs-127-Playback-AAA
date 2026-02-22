"""
Controlador de productos - Endpoints /api/productos
"""

from flask import Blueprint, request, jsonify,abort  
from flask_jwt_extended import jwt_required
from api.models import db, Product 

import cloudinary.uploader

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
    # Soporta tanto JSON como multipart/form-data
    if request.content_type and "multipart/form-data" in request.content_type:
        name = request.form.get("name")
        price = request.form.get("price")
        description = request.form.get("description")
        stock = request.form.get("stock", 1)
        item_id = request.form.get("item_id")
        imagen = request.files.get("imagen")
    else:
        body = request.get_json()
        if not body:
            abort(400, description="El body no puede estar vacío")
        name = body.get("name")
        price = body.get("price")
        description = body.get("description")
        stock = body.get("stock", 1)
        category_id = body.get("category_id")
        imagen = None

    if not name or not price or not category_id:
        abort(400, description="name, price y category_id son obligatorios")

    # Subir imagen a Cloudinary si viene una
    image_url = None
    if imagen:
        try:
            resultado = cloudinary.uploader.upload(imagen, folder="productos")
            image_url = resultado["secure_url"]
        except Exception as e:
            abort(500, description=f"Error al subir imagen: {str(e)}")

    try:
        new_product = Product(
            name=name,
            description=description,
            price=float(price),
            image_url=image_url,
            stock=int(stock),
            discount=0.0,
            item_id=int(item_id)
        )
        db.session.add(new_product)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        abort(500, description=f"Error al crear producto: {str(e)}")

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
        product.item_id = body.get("item_id", product.item_id)
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