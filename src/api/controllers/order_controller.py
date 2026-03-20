from flask import Blueprint, request, jsonify, abort  
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db
from api.models.orderdetail import OrderDetail
from api.models.order import Order, Status
from api.models.seller import Seller
from api.models.product import Product
from api.models.address import Address
from api.models.seller_order import SellerOrder, SellerOrderStatus
from datetime import datetime, timezone
from threading import Thread
from flask import current_app



order_bp = Blueprint('order', __name__, url_prefix='/order')

# def translate_text(text, target_lang):
#     if not text:
#         return None
#     return GoogleTranslator(source='auto', target=target_lang).translate(text)
COUPONS = {
    "VERANO10":    {"type": "percentage",    "value": 10},
    "5EUROS":      {"type": "fixed",         "value": 5},
    "ENVIOGRATIS": {"type": "free_shipping", "value": 0},
}


@order_bp.route('/apply-coupon', methods=['POST'])
@jwt_required()
def apply_coupon():
    data = request.get_json()
    code = data.get("code", "").strip().upper()

    coupon = COUPONS.get(code)
    if not coupon:
        return jsonify({"msg": "Código inválido"}), 404

    return jsonify({"code": code, "type": coupon["type"], "value": coupon["value"]}), 200

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
            "discount": product.discount,
            "quantity": detail.quantity,
            "image_url": product.image_url,
            "stock": product.stock 
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
        # ── Productos agrupados por SellerOrder ────────────────────────────────
        # Si el pedido tiene SellerOrders (modelo nuevo) los usamos para mostrar
        # cada envío por separado con su propio estado y tracking.
        seller_orders_data = []
        if order.seller_orders:
            for so in order.seller_orders:
                so_products = [
                    d for d in order.order_details
                    if d.product.seller_id == so.seller_id
                ]
                seller_orders_data.append({
                    "seller_order_id": so.id,
                    "seller_name":     so.seller.store_name,
                    "seller_logo":     so.seller.logo_url,
                    "status":          so.status.value,
                    "tracking_code":   so.tracking_code,
                    "carrier_name":    so.carrier_name,
                    "shipped_at":      so.shipped_at.isoformat() if so.shipped_at else None,
                    "products": [{
                        "id":        d.product.id,
                        "name":      d.product.name,
                        "price":     d.product.price,
                        "discount":  d.product.discount,
                        "quantity":  d.quantity,
                        "image_url": d.product.image_url,
                        "stock":     d.product.stock,
                    } for d in so_products],
                })

        # ── Lista plana de productos (retrocompatibilidad) ─────────────────────
        all_products = []
        for detail in order.order_details:

            product = detail.product

            all_products.append({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "discount": product.discount,
                "quantity": detail.quantity,
                "image_url": product.image_url,
                "stock": product.stock 
            })

        result.append({
            "id": order.id,
            "status": order.status.value,
            "total_price": order.total_price,
            "shipping_cost": order.shipping_cost,
            "created_at": order.created_at.isoformat(),
            "seller_orders": seller_orders_data,   # vacío en pedidos antiguos
            "products": all_products,          # retrocompatibilidad
            "shipping_address": order.shipping_address.serialize() if order.shipping_address else None,
            "billing_address": order.billing_address.serialize() if order.billing_address else None,
        })

    return jsonify(result), 200

@order_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():

    user_id = int(get_jwt_identity())
    data = request.get_json()

    shipping_address_id = data.get("shipping_address_id")
    billing_address_id  = data.get("billing_address_id")
    payment_method      = data.get("payment_method", "credit_card")
    coupon_code         = data.get("coupon_code")

    order = Order.query.filter_by(user_id=user_id, status=Status.pending).first()
    if not order:
        return jsonify({"msg": "Carrito vacío"}), 400

    # ── Calcular precios ───────────────────────────────────────────────────────

    subtotal = 0
    for detail in order.order_details:
        product = detail.product
        price_with_discount = product.price * (1 - product.discount / 100)
        subtotal += price_with_discount * detail.quantity

    # IVA ya incluido — extraemos cuánto representa
    tax = round(subtotal - (subtotal / 1.21), 2)

    # ── Calcular envío por peso volumétrico y país ─────────────────────────────

    shipping_address = Address.query.get(shipping_address_id)
    if not shipping_address:
        return jsonify({"msg": "Dirección de envío no encontrada"}), 400

    ENVIO_GRATIS_DESDE = 100.00

    def peso_volumetrico(product):
        """Peso volumétrico en kg según dimensiones en cm (divisor estándar 5000)."""
        if product.height and product.width and product.length:
            return (product.height * product.width * product.length) / 5000
        return 0

    def peso_facturable(product):
        """Se cobra el mayor entre peso real y peso volumétrico."""
        return max(product.weight or 0, peso_volumetrico(product))

    def calcular_envio(pais, peso_kg, subtotal):
        if subtotal >= ENVIO_GRATIS_DESDE:
            return 0.00

        ESPAÑA = {"españa", "espana", "spain", "es", "esp"}
        if pais.strip().lower() not in ESPAÑA:
            return 15.00

        tramos = [
            (1,            3.99),
            (5,            5.99),
            (10,           9.99),
            (float("inf"), 14.99),
        ]
        for limite, coste in tramos:
            if peso_kg <= limite:
                return coste

    peso_total = sum(
        peso_facturable(d.product) * d.quantity
        for d in order.order_details
    )

    shipping_cost = calcular_envio(shipping_address.country, peso_total, subtotal)

    # ── Aplicar cupón ──────────────────────────────────────────────────────────

    discount_amount = 0
    coupon = COUPONS.get(coupon_code.strip().upper()) if coupon_code else None

    if coupon:
        if coupon["type"] == "percentage":
            discount_amount = round(subtotal * coupon["value"] / 100, 2)
        elif coupon["type"] == "fixed":
            discount_amount = round(min(float(coupon["value"]), subtotal), 2)
        elif coupon["type"] == "free_shipping":
            shipping_cost = 0.00

    total_price = subtotal + shipping_cost - discount_amount

    # ── Guardar datos ──────────────────────────────────────────────────────────

    order.subtotal           = subtotal
    order.tax                = tax
    order.shipping_cost      = shipping_cost
    order.total_price        = total_price
    order.shipping_address_id = shipping_address_id
    order.billing_address_id  = billing_address_id
    order.payment_method     = payment_method
    db.session.commit()

    return jsonify({
        "msg":             "Compra realizada correctamente",
        "order_id":        order.id,
        "discount_amount": discount_amount,
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# SELLER ORDERS
# Cada ítem de la lista corresponde a un SellerOrder (estado propio por vendedor).
# El status del Order padre se recalcula con order.sync_status() tras cada cambio.
# ─────────────────────────────────────────────────────────────────────────────

@order_bp.route('/seller-orders', methods=['GET'])
@jwt_required()
def seller_orders():
    user_id = int(get_jwt_identity())
    seller = Seller.query.filter_by(user_id=user_id).first()
    if not seller:
        abort(403, description="No tienes perfil de vendedor")
    
    # Recuperamos los SellerOrders de este vendedor, excluyendo los del carrito (pending)
    seller_order_list = (
        SellerOrder.query
        .join(Order)
        .filter(
            SellerOrder.seller_id == seller.id,
            Order.status != Status.pending,
        )
        .order_by(Order.created_at.desc())
        .all()
    )
    
    result = []
    for so in seller_order_list:
        order = so.order
        # Solo los productos de este pedido que pertenecen a este vendedor
        my_details = [d for d in order.order_details if d.product.seller_id == seller.id]
        result.append({
            "seller_order_id": so.id,           # ID del SellerOrder — usar para el PATCH de estado
            "id":              order.id,         # ID del Order — mostrar al vendedor como referencia
            "status":          so.status.value,  # Estado propio del vendedor para este pedido
            "order_status":    order.status.value,
            "total_price":     order.total_price,
            "subtotal":        order.subtotal,
            "tax":             order.tax,
            "shipping_cost":   order.shipping_cost,
            "created_at":      order.created_at.isoformat(),
            "payment_method":  order.payment_method.value if order.payment_method else None,
            "customer":        order.user.name  if order.user else None,
            "customer_email":  order.user.email if order.user else None,
            "tracking_code":   so.tracking_code,
            "carrier_name":    so.carrier_name,
            "shipping_address": order.shipping_address.serialize() if order.shipping_address else None,
            "billing_address":  order.billing_address.serialize() if order.billing_address else None,
            "products": [{
                "id":        d.product.id,
                "name":      d.product.name.get("es"),
                "price":     d.product.price,
                "discount":  d.product.discount,
                "quantity":  d.quantity,
                "image_url": d.product.image_url,
            } for d in my_details],
        })
    
    return jsonify(result), 200


# ── Helper: envía el email de envío en un hilo separado ───────────────────────
def _send_shipped_email_async(app, user, order, tracking_code, carrier_name):
    with app.app_context():
        try:
            from extensions import mail
            from api.emails import build_order_shipped_buyer_email
            mail.send(build_order_shipped_buyer_email(user, order, tracking_code, carrier_name))
        except Exception as e:
            print(f"[Order] Error al enviar email de envío al comprador: {str(e)}")


@order_bp.route('/seller-orders/<int:seller_order_id>/status', methods=['PATCH'])
@jwt_required()
def update_seller_order_status(seller_order_id):
    user_id = int(get_jwt_identity())
    seller = Seller.query.filter_by(user_id=user_id).first()
    if not seller:
        abort(403, description="No tienes perfil de vendedor")
    
    # Cargamos el SellerOrder y verificamos que pertenece a este vendedor
    seller_order = SellerOrder.query.get_or_404(seller_order_id)
    if seller_order.seller_id != seller.id:
        abort(403, description="Este pedido no es tuyo")
    
    body = request.get_json()
    new_status = body.get("status")
    
    # El vendedor NO puede marcar como delivered — eso lo hace el comprador
    VALID_TRANSITIONS = {
        "paid":       ["confirmed", "cancelled"],
        "confirmed":  ["processing", "cancelled"],
        "processing": ["shipped",    "cancelled"],
    }
    
    current = seller_order.status.value
    if new_status not in VALID_TRANSITIONS.get(current, []):
        abort(400, description=f"No puedes pasar de '{current}' a '{new_status}'")
    
    # ── Transición especial: processing → shipped ──────────────────────────────
    # Requiere código de seguimiento y dispara email al comprador en background
    if new_status == "shipped":
        tracking_code = (body.get("tracking_code") or "").strip()
        carrier_name  = (body.get("carrier_name")  or "Otro").strip()
        
        if not tracking_code:
            abort(400, description="Se requiere un código de seguimiento para marcar como enviado")
        
        seller_order.tracking_code = tracking_code
        seller_order.carrier_name  = carrier_name
        seller_order.shipped_at    = datetime.now(timezone.utc)
        
        # Email al comprador (nunca rompe el flujo si falla)
        Thread(
            target=_send_shipped_email_async,
            args=(
                current_app._get_current_object(),
                seller_order.order.user,
                seller_order.order,
                tracking_code,
                carrier_name,
            )
        ).start()
    
    # ── Actualizar estado del SellerOrder ──────────────────────────────────────
    seller_order.status = SellerOrderStatus(new_status)
    
    # ── Recalcular y guardar el estado global del Order ────────────────────────
    seller_order.order.sync_status()
    
    db.session.commit()
    return jsonify({
        "msg":          "Estado actualizado",
        "status":       seller_order.status.value,
        "order_status": seller_order.order.status.value,
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# CONFIRMACIÓN DE ENTREGA COMPLETA — marca todos los shipped como delivered
# PATCH /order/my-orders/<order_id>/delivered
# ─────────────────────────────────────────────────────────────────────────────
@order_bp.route('/my-orders/<int:order_id>/delivered', methods=['PATCH'])
@jwt_required()
def buyer_confirm_delivery(order_id):
    user_id = int(get_jwt_identity())
    
    order = Order.query.get_or_404(order_id)
    
    # Solo el comprador del pedido puede confirmarlo como entregado
    if order.user_id != user_id:
        abort(403, description="Este pedido no es tuyo")
    
    # Solo se puede confirmar si el pedido está en "shipped"
    if order.status.value != "shipped":
        abort(400, description=f"El pedido debe estar en 'shipped' (estado actual: '{order.status.value}')")
    
    # Marcamos como delivered todos los SellerOrders que estén en shipped
    for so in order.seller_orders:
        if so.status.value == "shipped":
            so.status = SellerOrderStatus.delivered
        
    # Recalcular estado global — si todos están delivered pasará a delivered
    order.sync_status()
    
    db.session.commit()
    return jsonify({
        "msg":          "Entrega confirmada",
        "order_status": order.status.value,
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# CONFIRMACIÓN DE ENTREGA POR ENVÍO — el comprador confirma un envío concreto
# PATCH /order/my-orders/<order_id>/seller-orders/<seller_order_id>/delivered
# ─────────────────────────────────────────────────────────────────────────────

@order_bp.route('/my-orders/<int:order_id>/seller-orders/<int:seller_order_id>/delivered', methods=['PATCH'])
@jwt_required()
def buyer_confirm_shipment_delivery(order_id, seller_order_id):
    user_id = int(get_jwt_identity())
    
    order = Order.query.get_or_404(order_id)
    
    # Solo el comprador puede confirmar
    if order.user_id != user_id:
        abort(403, description="Este pedido no es tuyo")
        
    seller_order = SellerOrder.query.get_or_404(seller_order_id)
    
    # Verificar que el SellerOrder pertenece a este pedido
    if seller_order.order_id != order_id:
        abort(403, description="Este envío no pertenece al pedido indicado")
    
    if seller_order.status.value != "shipped":
        abort(400, description=f"Este envío no está en 'shipped' (estado actual: '{seller_order.status.value}')")
    
    seller_order.status = SellerOrderStatus.delivered
    
    # Recalcular estado global del pedido
    order.sync_status()
    
    db.session.commit()
    return jsonify({
        "msg":                "Entrega confirmada",
        "seller_order_status": seller_order.status.value,
        "order_status":        order.status.value,
    }), 200