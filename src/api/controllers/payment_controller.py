import stripe
import os
from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db
from api.models.order import Order, Status

payment_bp = Blueprint('payment', __name__, url_prefix='/payment')

# Comisión de la plataforma (por defecto 5% o un mínimo de 1€)
COMMISSION_RATE = float(os.getenv("PLATFORM_COMMISSION_RATE", 0.05))
MINIMUM_COMMISSION = float(os.getenv("PLATFORM_MINIMUM_COMMISSION", 1.0))


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/payment/create
# Crea un PaymentIntent de Stripe para un pedido existente
# ─────────────────────────────────────────────────────────────────────────────

@payment_bp.route("/create", methods=["POST"])
@jwt_required()
def create_payment():
    user_id = get_jwt_identity()

    body = request.get_json()
    if not body or "order_id" not in body:
        abort(400, description="El campo 'order_id' es obligatorio")

    # Busca el pedido y valida que pertenece al usuario
    order = Order.query.filter_by(id=body["order_id"], user_id=user_id).first()
    if not order:
        abort(404, description="Pedido no encontrado")

    # Solo se puede pagar un pedido en estado pending
    if order.status != Status.pending:
        abort(400, description=f"El pedido no está en estado pagable (estado actual: {order.status.value})")

    # Si ya tiene PaymentIntent, lo devuelve (para reintentos desde el frontend)
    if order.stripe_payment_intent_id:
        try:
            intent = stripe.PaymentIntent.retrieve(order.stripe_payment_intent_id)
            return jsonify({
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "amount": intent.amount,
                "currency": intent.currency,
            }), 200
        except stripe.error.StripeError:
            pass  # Si falla el retrieve, creamos uno nuevo

    # Valida que todos los vendedores tienen cuenta Stripe
    sellers_sin_cuenta = []
    for detail in order.order_details:
        seller = detail.product.seller
        if not seller.stripe_account_id:
            sellers_sin_cuenta.append(seller.store_name)

    if sellers_sin_cuenta:
        abort(400, description=f"Los siguientes vendedores no tienen cuenta Stripe configurada: {', '.join(sellers_sin_cuenta)}")

    # Calcula el desglose por vendedor para los metadatos
    seller_breakdown = {}
    for detail in order.order_details:
        seller = detail.product.seller
        subtotal = detail.product.price * detail.quantity
        if seller.id not in seller_breakdown:
            seller_breakdown[seller.id] = {
                "store_name": seller.store_name,
                "stripe_account_id": seller.stripe_account_id,
                "subtotal": 0.0,
            }
        seller_breakdown[seller.id]["subtotal"] += subtotal

    # Calcula comisión por vendedor — mínimo 1€ o el porcentaje si es mayor
    for seller_id in seller_breakdown:
        subtotal = seller_breakdown[seller_id]["subtotal"]
        commission = max(round(subtotal * COMMISSION_RATE, 2), MINIMUM_COMMISSION)
        seller_breakdown[seller_id]["commission"] = commission
        seller_breakdown[seller_id]["transfer_amount"] = max(round(subtotal - commission, 2), 0.0)

    # Convierte el total a céntimos (Stripe trabaja en la unidad más pequeña)
    amount_cents = int(round(order.total_price * 100))

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="eur",
            metadata={
                "order_id": str(order.id),
                "user_id": str(user_id),
                # Guarda el desglose para usarlo en el webhook
                "seller_breakdown": str({
                    sid: {
                        "stripe_account_id": v["stripe_account_id"],
                        "transfer_amount": v["transfer_amount"],
                    }
                    for sid, v in seller_breakdown.items()
                }),
            },
        )

        # Guarda el PaymentIntent en el pedido
        order.stripe_payment_intent_id = intent.id
        db.session.commit()

        return jsonify({
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": amount_cents,
            "currency": "eur",
            "commission_rate": COMMISSION_RATE,
            "minimum_commission": MINIMUM_COMMISSION,
            "seller_breakdown": [
                {
                    "store_name": v["store_name"],
                    "subtotal": v["subtotal"],
                    "commission": v["commission"],
                    "transfer_amount": v["transfer_amount"],
                }
                for v in seller_breakdown.values()
            ],
        }), 201

    except stripe.error.StripeError as e:
        abort(500, description=f"Error de Stripe: {str(e)}")