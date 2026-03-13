from flask import Blueprint, request, jsonify, abort  
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db
from api.models.orderdetail import OrderDetail
from api.models.order import Order, Status
from api.models.seller import Seller
from api.models.product import Product


order_bp = Blueprint('order', __name__, url_prefix='/order')

# def translate_text(text, target_lang):
#     if not text:
#         return None
#     return GoogleTranslator(source='auto', target=target_lang).translate(text)


@order_bp.route('', methods=['GET'])
def get_orders():
# El locale sirve para decirle el idioma 
    locale = request.args.get("locale", "es")  
    orders = Order.query.all()
    return jsonify([p.serialize(locale=locale) for p in orders]), 200


@order_bp.route('/<int:id>', methods=['GET'])
def get_order(id):
    locale = request.args.get("locale", "es")
    order = Order.query.get(id)
    if order is None:
        abort(404, description=f"Orden con id {id} no encontrado")
    return jsonify(order.serialize(locale=locale)), 200


#Comprueba que el usuario logueado ya compro un producto en concreto (solo si el status es confirmed) 
@order_bp.route('/has-bought/<int:product_id>', methods=['GET'])
@jwt_required()
def has_bought(product_id):
    #Cogemos el id del usuario y lo pasamos a int
    user_id = int(get_jwt_identity())
    #Revisamos si el usuario a comprado si es asi revisamos el producto que a comprado y enviamos el primer resultado
    bought = db.session.query(Order).join(OrderDetail).filter(
        Order.user_id == user_id,
        OrderDetail.product_id == product_id,
        Order.status == Status.confirmed
    ).first()
    return jsonify({
        "has_bought": bought is not None,
        "order_id": bought.id if bought else None  
    }), 200


@order_bp.route('/add-product', methods=['POST'])
@jwt_required()
def add_product():

    user_id = int(get_jwt_identity())
    data = request.get_json()

    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    order = Order.query.filter_by(user_id=user_id, status=Status.pending).first()

    if not order:

        order = Order(
            user_id=user_id,
            status=Status.pending,
            subtotal=0,
            tax=0,
            total_price=0,
            shipping_cost=0,
            payment_method="credit_card"
        )

        db.session.add(order)
        db.session.commit()

    detail = OrderDetail.query.filter_by(
        order_id=order.id,
        product_id=product_id
    ).first()

    if detail:
        detail.quantity += quantity

    else:

        new_detail = OrderDetail(
            order_id=order.id,
            product_id=product_id,
            quantity=quantity
        )

        db.session.add(new_detail)

    db.session.commit()

    return jsonify({"msg": "Producto añadido al carrito"}), 200


@order_bp.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():

    user_id = int(get_jwt_identity())

    order = Order.query.filter_by(user_id=user_id, status=Status.pending).first()

    if not order:
        return jsonify({"products": []}), 200

    products = []

    for detail in order.order_details:

        product = detail.product

        products.append({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "quantity": detail.quantity,
            "image_url": product.image_url
        })

    return jsonify({
        "order_id": order.id,
        "products": products
    }), 200


@order_bp.route('/product/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_product(product_id):

    user_id = int(get_jwt_identity())

    order = Order.query.filter_by(user_id=user_id, status=Status.pending).first()

    if not order:
        return jsonify({"msg": "Carrito vacío"}), 404

    detail = OrderDetail.query.filter_by(
        order_id=order.id,
        product_id=product_id
    ).first()

    if not detail:
        return jsonify({"msg": "Producto no encontrado"}), 404

    db.session.delete(detail)
    db.session.commit()

    return jsonify({"msg": "Producto eliminado del carrito"}), 200


# -----------------------------
# Historial de pedidos usuario
# -----------------------------

@order_bp.route('/my-orders', methods=['GET'])
@jwt_required()
def my_orders():

    user_id = int(get_jwt_identity())

    orders = Order.query.filter(
        Order.user_id == user_id,
        Order.status != Status.pending
    ).order_by(Order.created_at.desc()).all()

    result = []

    for order in orders:

        products = []

        for detail in order.order_details:

            product = detail.product

            products.append({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "quantity": detail.quantity,
                "image_url": product.image_url
            })

        result.append({
            "id": order.id,
            "status": order.status.value,
            "total_price": order.total_price,
            "created_at": order.created_at.isoformat(),
            "products": products,
            "shipping_address": order.shipping_address.serialize() if order.shipping_address else None,
            "billing_address": order.billing_address.serialize() if order.billing_address else None
        })

    return jsonify(result), 200


@order_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():

    user_id = int(get_jwt_identity())

    data = request.get_json()

    shipping_address_id = data.get("shipping_address_id")
    billing_address_id = data.get("billing_address_id")
    payment_method = data.get("payment_method", "credit_card")

    order = Order.query.filter_by(user_id=user_id, status=Status.pending).first()

    if not order:
        return jsonify({"msg": "Carrito vacío"}), 400


    # -----------------------------
    # Calcular precios
    # -----------------------------

    subtotal = 0

    for detail in order.order_details:

        product = detail.product
        subtotal += product.price * detail.quantity

    tax = subtotal * 0.21
    shipping_cost = 5
    total_price = subtotal + tax + shipping_cost


    # -----------------------------
    # Guardar datos
    # -----------------------------

    order.subtotal = subtotal
    order.tax = tax
    order.shipping_cost = shipping_cost
    order.total_price = total_price

    order.shipping_address_id = shipping_address_id
    order.billing_address_id = billing_address_id

    order.payment_method = payment_method

    db.session.commit()


    return jsonify({
        "msg": "Compra realizada correctamente",
        "order_id": order.id
    }), 200


@order_bp.route('/seller-orders', methods=['GET'])
@jwt_required()
def seller_orders():
    user_id = int(get_jwt_identity())
    seller = Seller.query.filter_by(user_id=user_id).first()
    if not seller:
        abort(403, description="No tienes perfil de vendedor")

    # Pedidos que contienen al menos un producto tuyo
    orders = Order.query.join(OrderDetail).join(Product).filter(
        Product.seller_id == seller.id,
        Order.status != Status.pending
    ).order_by(Order.created_at.desc()).all()

    result = []
    for order in orders:
        # Solo los productos de este pedido que son tuyos
        my_details = [d for d in order.order_details if d.product.seller_id == seller.id]
        result.append({
    "id": order.id,
    "status": order.status.value,
    "total_price": order.total_price,
    "subtotal": order.subtotal,
    "tax": order.tax,
    "shipping_cost": order.shipping_cost,
    "created_at": order.created_at.isoformat(),
    "payment_method": order.payment_method.value if order.payment_method else None,
    "customer": order.user.name if order.user else None,
    "customer_email": order.user.email if order.user else None,
    "shipping_address": order.shipping_address.serialize() if order.shipping_address else None,
    "billing_address": order.billing_address.serialize() if order.billing_address else None,
    "products": [{
        "id": d.product.id,
        "name": d.product.name.get("es"),
        "price": d.product.price,
        "quantity": d.quantity,
        "image_url": d.product.image_url,
    } for d in my_details]
})

    return jsonify(result), 200


@order_bp.route('/seller-orders/<int:order_id>/status', methods=['PATCH'])
@jwt_required()
def update_seller_order_status(order_id):
    user_id = int(get_jwt_identity())
    seller = Seller.query.filter_by(user_id=user_id).first()
    if not seller:
        abort(403, description="No tienes perfil de vendedor")

    order = Order.query.get_or_404(order_id)

    # Verificar que el pedido tiene productos de este seller
    has_products = any(d.product.seller_id == seller.id for d in order.order_details)
    if not has_products:
        abort(403, description="Este pedido no es tuyo")

    body = request.get_json()
    new_status = body.get("status")

    VALID_TRANSITIONS = {
        "paid":       ["confirmed", "cancelled"],
        "confirmed":  ["processing", "cancelled"],
        "processing": ["shipped",    "cancelled"],
        "shipped":    ["delivered"],
    }

    current = order.status.value
    if new_status not in VALID_TRANSITIONS.get(current, []):
        abort(400, description=f"No puedes pasar de '{current}' a '{new_status}'")

    order.status = Status(new_status)
    db.session.commit()
    return jsonify({"msg": "Estado actualizado", "status": order.status.value}), 200