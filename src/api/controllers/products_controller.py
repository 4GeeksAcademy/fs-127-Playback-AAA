from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity  
from api.models import db, Product
from api.models.orderdetail import OrderDetail
from api.models.item import Item
from api.models.subcategory import Subcategory
from api.models.category import Category
from sqlalchemy import func, text
from sqlalchemy.orm import joinedload
from deep_translator import GoogleTranslator
import cloudinary.uploader
from api.models.seller import Seller

product_bp = Blueprint('product', __name__, url_prefix='/product')

# Umbral para considerar "pocas unidades"
LOW_STOCK_THRESHOLD = 1


def translate_text(text, target_lang):
    if not text:
        return None
    return GoogleTranslator(source='auto', target=target_lang).translate(text)


@product_bp.route('', methods=['GET'])
def get_products():
    locale = request.args.get("locale", "es")
    products = Product.query.all()
    return jsonify([p.to_dict(locale=locale) for p in products]), 200


@product_bp.route('/search', methods=['GET'])
def search_products():
    locale = request.args.get("locale", "es")
    q = request.args.get("q", "").strip().lower()
    cat_slug = request.args.get("category", "").strip().lower()
    sub_slug = request.args.get("subcategory", "").strip().lower()
    item_slug = request.args.get("item", "").strip().lower()

    # Ordenación
    # relevance | price_asc | price_desc | rating | newest | discount | stock_asc
    sort = request.args.get("sort", "relevance")

    # Filtros de precio
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)

    # Filtros booleanos
    in_stock = request.args.get("in_stock", "false").lower() == "true"
    on_sale = request.args.get("on_sale", "false").lower() == "true"
    low_stock = request.args.get("low_stock", "false").lower() == "true"

    # Filtro de condición: "new" | "used" | "refurbished" | "broken"
    # Puede llegar como "new,used" (varios separados por coma)
    conditions_param = request.args.get("condition", "").strip()
    conditions = [c.strip() for c in conditions_param.split(",")
                  if c.strip()] if conditions_param else []

    products = Product.query.options(
        joinedload(Product.item)
        .joinedload(Item.subcategory)
        .joinedload(Subcategory.category)
    ).all()

    results = []
    for p in products:
        item = p.item
        sub = item.subcategory if item else None
        cat = sub.category if sub else None

        # ── Filtros de categoría (exactos por slug)
        if cat_slug and (not cat or cat.slug.lower() != cat_slug):
            continue
        if sub_slug and (not sub or sub.slug.lower() != sub_slug):
            continue
        if item_slug and (not item or item.slug.lower() != item_slug):
            continue

        # ── Filtro de precio
        if min_price is not None and p.price < min_price:
            continue
        if max_price is not None and p.price > max_price:
            continue

        # ── Filtro stock
        if in_stock and p.stock <= 0:
            continue

        # ── Filtro en oferta (discount > 0)
        if on_sale and p.discount <= 0:
            continue

        # ── Filtro pocas unidades
        if low_stock and (p.stock <= 0 or p.stock > LOW_STOCK_THRESHOLD):
            continue

        # ── Filtro condición  (p.condition es el enum → .value da el string)
        if conditions and p.condition.value not in conditions:
            continue

        # ── Filtro de texto (solo si viene q)
        if q:
            searchable = " ".join(filter(None, [
                p.name.get("es", ""),          p.name.get("en", ""),
                (p.description or {}).get(
                    "es", ""), (p.description or {}).get("en", ""),
                item.name.get("es", "") if item else "",
                item.name.get("en", "") if item else "",
                sub.name.get("es", "") if sub else "",
                sub.name.get("en", "") if sub else "",
                cat.name.get("es", "") if cat else "",
                cat.name.get("en", "") if cat else "",
            ])).lower()
            if q not in searchable:
                continue

        avg_rating = round(sum(r.rating for r in p.reviews) /
                            len(p.reviews), 1) if p.reviews else 0
        final_price = p.price * \
            (1 - p.discount / 100) if p.discount > 0 else p.price

        results.append({
            **p.serialize(locale=locale),
            "rating":           avg_rating,
            "final_price":      round(final_price, 2),
            "item_name":        item.name.get(locale) if item else None,
            "subcategory_name": sub.name.get(locale) if sub else None,
            "category_name":    cat.name.get(locale) if cat else None,
            "low_stock":        0 < p.stock <= LOW_STOCK_THRESHOLD,
        })

    # ── Ordenación
    if sort == "price_asc":
        results.sort(key=lambda x: x["final_price"])
    elif sort == "price_desc":
        results.sort(key=lambda x: x["final_price"], reverse=True)
    elif sort == "rating":
        results.sort(key=lambda x: x["rating"], reverse=True)
    elif sort == "newest":
        results.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    elif sort == "discount":
        results.sort(key=lambda x: x["discount"], reverse=True)
    elif sort == "stock_asc":
        # Primero los que tienen menos stock (pero > 0), luego sin stock
        results.sort(key=lambda x: (x["stock"] == 0, x["stock"]))
    else:  # relevance
        results.sort(key=lambda x: 0 if q and q in (
            x.get("name") or "").lower() else 1)

    return jsonify(results), 200


@product_bp.route('/<int:id>', methods=['GET'])
def get_product(id):
    locale = request.args.get("locale", "es")
    product = Product.query.get(id)
    if product is None:
        abort(404, description=f"Producto con id {id} no encontrado")
    return jsonify(product.to_dict(locale=locale)), 200


@product_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()
    #Revisa si tiene imagen o sin imagen, si tiene imagen en request.form.get y sino es un json seria request.get_son()
    seller = Seller.query.filter_by(user_id=user_id).first()
    if not seller:
        abort(403, description="No tienes perfil de vendedor")
    
    if request.content_type and "multipart/form-data" in request.content_type:
        name = request.form.get("name")
        price = request.form.get("price")
        description = request.form.get("description")
        stock = request.form.get("stock", 1)
        item_id = request.form.get("item_id")
        condition = request.form.get("condition", "new")
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
        condition = body.get("condition", "new")
        imagen = None

    if not name or not price or not item_id:
        abort(400, description="name, price e item_id son obligatorios")

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
            name={"es": name, "en": translated_name or name}, 
            description={"es": description, "en": translated_desc or description} if description else None,
            price=float(price),
            image_url=image_url,
            stock=int(stock),
            discount=0.0,
            condition=condition,
            item_id=int(item_id),
            seller_id=seller.id
        )
        db.session.add(new_product)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        abort(500, description=f"Error al crear producto: {str(e)}")

    return jsonify(new_product.serialize()), 201

@product_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    product = Product.query.get(id)
    if product is None:
        abort(404, description=f"Producto con id {id} no encontrado")

    if request.content_type and "multipart/form-data" in request.content_type:
        name        = request.form.get("name")
        description = request.form.get("description")
        price       = request.form.get("price")
        stock       = request.form.get("stock")
        item_id     = request.form.get("item_id")
        condition   = request.form.get("condition")
        discount    = request.form.get("discount")
        size        = request.form.get("size")
        weight      = request.form.get("weight")
        imagen      = request.files.get("imagen")
    else:
        body = request.get_json()
        if not body:
            abort(400, description="El body no puede estar vacío")
        name        = body.get("name")
        description = body.get("description")
        price       = body.get("price")
        stock       = body.get("stock")
        item_id     = body.get("item_id")
        condition   = body.get("condition")
        discount    = body.get("discount")
        size        = body.get("size")
        weight      = body.get("weight")
        imagen      = None

    try:
        if name:
            product.name = {"es": name, "en": translate_text(name, "en") or name}
        if description:
            product.description = {"es": description, "en": translate_text(description, "en") or description}
        if price:       product.price    = float(price)
        if stock:       product.stock    = int(stock)
        if item_id and item_id != "undefined": product.item_id = int(item_id)

        if condition:
            from api.models.product import ProductCondition
            product.condition = ProductCondition(condition)
        if discount is not None: product.discount = float(discount)
        if size:        product.size     = size
        if weight:      product.weight   = float(weight)
        if imagen:
            resultado = cloudinary.uploader.upload(imagen, folder="productos")
            product.image_url = resultado["secure_url"]

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        abort(500, description=f"Error al actualizar producto: {str(e)}")

    return jsonify(product.serialize()), 200

@product_bp.route('/top-sales', methods=['GET'])
def get_top_sales():
    locale = request.args.get("locale", "es")  
    result = db.session.query(
        Product,
        func.sum(OrderDetail.quantity).label("total_sold")
    ).join(Product.order_details)\
    .group_by(Product.id)\
    .order_by(text("total_sold DESC"))\
    .limit(10)\
    .all()

    return jsonify([{
        **p.to_dict(locale=locale),  
        "total_sold": int(total_sold),
        "stock": p.stock  
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
