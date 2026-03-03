import os
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db
from api.models.order import Order, Status, Payment
from api.models.orderdetail import OrderDetail
from api.models.product import Product
import stripe


# from deep_translator import GoogleTranslator

FRONTEND_URL = os.getenv("FRONTEND_URL")

order_bp = Blueprint('order', __name__, url_prefix='/order')

# def translate_text(text, target_lang):
#     if not text:
#         return None
#     return GoogleTranslator(source='auto', target=target_lang).translate(text)

@order_bp.route('', methods=['GET'])
def get_orders():
    locale = request.args.get("locale", "es")  
    orders = Order.query.all()
    return jsonify([p.to_dict(locale=locale) for p in orders]), 200  

@order_bp.route('/<int:id>', methods=['GET'])
def get_order(id):
    locale = request.args.get("locale", "es")
    order = Order.query.get(id)
    if order is None:
        abort(404, description=f"Orden con id {id} no encontrado")
    return jsonify(order.to_dict(locale=locale)), 200

#Comprueba que el usuario logueado ya compro un producto en concreto (solo si el status es confirmed)
@order_bp.route('/has-bought/<int:product_id>', methods=['GET'])
@jwt_required()
def has_bought(product_id):
    user_id = int(get_jwt_identity())
    bought = db.session.query(Order).join(OrderDetail).filter(
        Order.user_id == user_id,
        OrderDetail.product_id == product_id,
        Order.status == Status.confirmed
    ).first()
    return jsonify({
        "has_bought": bought is not None,
        "order_id": bought.id if bought else None  
    }), 200

#Busca el producto para obtener el precio y luego crea la orden y el estado pendiente y te devuelve el id
@order_bp.route('/create', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    product = Product.query.get(data.get("productId"))
    if not product:
        return jsonify({"description": "Producto no encontrado"}), 404

    try:
        order = Order(
            user_id=int(get_jwt_identity()),
            total_price=product.price,
            subtotal=product.price,
            tax=0.0,
            shipping_cost=0.0,
            payment_method=Payment.credit_card,
            status=Status.pending
        )
        db.session.add(order)
        db.session.flush()
        db.session.add(OrderDetail(order_id=order.id, product_id=product.id, quantity=1))
        db.session.commit()
        return jsonify({"order_id": order.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"description": str(e)}), 500

#Crea una sesion de pago en Stripe y redirige al usuario para que introduzca la targeta y al terminar va al fronted de succes o cancel
@order_bp.route('/<int:order_id>/checkout', methods=['POST'])
@jwt_required()
def create_checkout(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({"description": "Orden no encontrada"}), 404

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'unit_amount': int(order.total_price * 100),
                    'product_data': {'name': f'Pedido #{order.id}'},
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{FRONTEND_URL}/success/{order.id}",
            cancel_url=f"{FRONTEND_URL}/cancel/{order.id}",
        )
        return jsonify({'url': session.url}), 200
    except Exception as e:
        return jsonify({"description": str(e)}), 500

#Cambia el estado de la orden a confirmed y se llama desde el success

@order_bp.route('/<int:order_id>/confirm', methods=['PUT'])
def confirm_order(order_id):
    order = Order.query.get_or_404(order_id)
    order.status = Status.confirmed
    db.session.commit()
    return jsonify(order.serialize())