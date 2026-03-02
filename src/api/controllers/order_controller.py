from flask import Blueprint, request, jsonify, abort  
from flask_jwt_extended import jwt_required
from api.models import db, Order 
from api.models.orderdetail import OrderDetail
from deep_translator import GoogleTranslator
from flask_jwt_extended import jwt_required, get_jwt_identity


order_bp = Blueprint('order', __name__, url_prefix='/order')

def translate_text(text, target_lang):
    if not text:
        return None
    return GoogleTranslator(source='auto', target=target_lang).translate(text)

@order_bp.route('', methods=['GET'])
def get_orders():
# El locale sirve para decirle el idioma 
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


#Sirve para saber que productos fueron comprados por el usuario 
@order_bp.route('/has-bought/<int:product_id>', methods=['GET'])
@jwt_required()
def has_bought(product_id):
    #Cogemos el id del usuario y lo pasamos a int
    user_id = int(get_jwt_identity())
    #Revisamos si el usuario a comprado si es asi revisamos el producto que a comprado y enviamos el primer resultado
    bought = db.session.query(Order).join(OrderDetail).filter(
        Order.user_id == user_id,
        OrderDetail.product_id == product_id
    ).first()
    return jsonify({
        "has_bought": bought is not None,
        "order_id": bought.id if bought else None  
    }), 200