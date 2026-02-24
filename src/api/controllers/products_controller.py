from flask import Blueprint, request, jsonify, abort  
from flask_jwt_extended import jwt_required
from api.models import db, Product 
from api.models.orderdetail import OrderDetail
from sqlalchemy import func, text
from deep_translator import GoogleTranslator
import cloudinary.uploader

product_bp = Blueprint('product', __name__, url_prefix='/product')

def translate_text(text, target_lang):
    if not text:
        return None
    return GoogleTranslator(source='auto', target=target_lang).translate(text)

@product_bp.route('', methods=['GET'])
def get_products():
    locale = request.args.get("locale", "es")  
    products = Product.query.all()
    return jsonify([p.to_dict(locale=locale) for p in products]), 200  

@product_bp.route('/<int:id>', methods=['GET'])
def get_product(id):
    locale = request.args.get("locale", "es")
    product = Product.query.get(id)
    if product is None:
        abort(404, description=f"Producto con id {id} no encontrado")
    return jsonify(product.to_dict(locale=locale)), 200

@product_bp.route('', methods=['POST'])
def create_product():
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
        item_id = body.get("item_id")
        imagen = None

    if not name or not price or not item_id:
        abort(400, description="name, price e item_id son obligatorios")

    # ← Traducir automáticamente
    translated_name = translate_text(name, "en")
    translated_desc = translate_text(description, "en")

    image_url = None
    if imagen:
        try:
            resultado = cloudinary.uploader.upload(imagen, folder="productos")
            image_url = resultado["secure_url"]
        except Exception as e:
            abort(500, description=f"Error al subir imagen: {str(e)}")

    try:
        new_product = Product(
            name={"es": name, "en": translated_name or name},  # ← JSON
            description={"es": description, "en": translated_desc or description} if description else None,
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
        if "name" in body:
            new_name = body["name"]
            product.name = {"es": new_name, "en": translate_text(new_name, "en") or new_name}

        if "description" in body:
            new_desc = body["description"]
            product.description = {"es": new_desc, "en": translate_text(new_desc, "en") or new_desc}

        product.price = body.get("price", product.price)
        product.image_url = body.get("image_url", product.image_url)
        product.size = body.get("size", product.size)
        product.weight = body.get("weight", product.weight)
        product.stock = body.get("stock", product.stock)
        product.discount = body.get("discount", product.discount)
        product.item_id = body.get("item_id", product.item_id)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        abort(500, description="Error al actualizar producto")

    return jsonify(product.serialize()), 200

@product_bp.route('/top-sales', methods=['GET'])
def get_top_sales():
    locale = request.args.get("locale", "es")  # ← añadido
    result = db.session.query(
        Product,
        func.sum(OrderDetail.quantity).label("total_sold")
    ).join(Product.order_details)\
     .group_by(Product.id)\
     .order_by(text("total_sold DESC"))\
     .limit(10)\
     .all()

    return jsonify([{
        **p.to_dict(locale=locale),  # ← locale
        "total_sold": int(total_sold)
    } for p, total_sold in result]), 200

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