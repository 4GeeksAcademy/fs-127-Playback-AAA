import os
from flask import request, jsonify, abort, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db
from api.models.user import User, RoleName
from api.models.seller import Seller, SellerStatus
from api.utils import generate_initial_avatar
import stripe

seller_bp = Blueprint('seller', __name__, url_prefix='/seller')


# -------------------------
# CREAR PERFIL DE VENDEDOR
# -------------------------

@seller_bp.route("/profile", methods=["POST"])
@jwt_required()
def create_seller_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        abort(404, description="Usuario no encontrado")

    if Seller.query.filter_by(user_id=user_id).first():
        abort(409, description="Ya tienes un perfil de vendedor")

    body = request.get_json()
    if not body:
        abort(400, description="El body no puede estar vacío")

    required = ["store_name", "nif_cif", "origin_address", "origin_city", "origin_zip", "origin_country"]
    for field in required:
        if field not in body or not body[field]:
            abort(400, description=f"El campo '{field}' es obligatorio")

    if Seller.query.filter_by(nif_cif=body["nif_cif"]).first():
        abort(409, description="Ya existe un vendedor con ese NIF/CIF")

    logo_url = generate_initial_avatar(store_name=body.get("store_name"))
    
    try:
        seller = Seller(
            user_id=user_id,
            store_name=body["store_name"],
            description=body.get("description"),
            phone=body.get("phone"),
            nif_cif=body["nif_cif"],
            origin_address=body["origin_address"],
            origin_city=body["origin_city"],
            origin_zip=body["origin_zip"],
            origin_country=body["origin_country"],
            origin_community_code=body.get("origin_community_code"),  
            origin_province_code=body.get("origin_province_code"),
            status=SellerStatus.pending,
            logo_url=logo_url
        )
        db.session.add(seller)
        db.session.flush()

        try:
            account = stripe.Account.create(
                type="express",
                email=user.email,
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True},
                },
            )
            seller.stripe_account_id = account.id
        except stripe.error.StripeError:
            pass 

        db.session.commit()

        return jsonify({
            "msg": "Perfil de vendedor creado correctamente",
            "seller": seller.serialize()
        }), 201

    except Exception as error:
        db.session.rollback()
        abort(500, description=f"Error al crear perfil: {str(error)}")


# -------------------------
# PERFIL DEL VENDEDOR
# -------------------------

@seller_bp.route("/me", methods=["GET"])
@jwt_required()
def get_seller_profile():
    user_id = get_jwt_identity()
    seller = Seller.query.filter_by(user_id=user_id).first()

    if not seller:
        abort(404, description="Perfil de vendedor no encontrado")

    return jsonify(seller.serialize()), 200


# -------------------------
# ACTUALIZAR PERFIL
# -------------------------

@seller_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_seller_profile():
    user_id = get_jwt_identity()
    seller = Seller.query.filter_by(user_id=user_id).first()

    if not seller:
        abort(404, description="Perfil de vendedor no encontrado")

    body = request.get_json()
    if not body:
        abort(400, description="Body vacío")

    # Campos actualizables — el NIF no se pueden cambiar una vez creados
    updatable = ["store_name", "description", "phone", "logo_url",
                 "origin_address", "origin_city", "origin_zip", "origin_country",
                 "origin_community_code", "origin_province_code"]

    updated = False
    for field in updatable:
        if field in body:
            setattr(seller, field, body[field])
            updated = True

    if not updated:
        abort(400, description="No hay datos para actualizar")
        
    # Si está rechazado y reenvía, vuelve a pending y se limpia el motivo
    if seller.status == SellerStatus.rejected:
        seller.status = SellerStatus.pending
        seller.rejection_reason = None

    db.session.commit()
    return jsonify({"msg": "Perfil actualizado correctamente", "seller": seller.serialize()}), 200


# -------------------------
# BORRAR PERFIL
# -------------------------

@seller_bp.route("/me", methods=["DELETE"])
@jwt_required()
def delete_seller_profile():
    user_id = get_jwt_identity()
    seller = Seller.query.filter_by(user_id=user_id).first()

    if not seller:
        abort(404, description="Perfil de vendedor no encontrado")

    # Solo se puede cancelar si no está verificado
    if seller.status == SellerStatus.verified:
        abort(403, description="No puedes cancelar una tienda ya verificada")

    db.session.delete(seller)
    db.session.commit()
    return jsonify({"msg": "Solicitud cancelada"}), 200


# -------------------------
# LINK DE ONBOARDING STRIPE
# -------------------------

@seller_bp.route("/stripe/onboarding", methods=["GET"])
@jwt_required()
def get_stripe_onboarding_link():
    user_id = get_jwt_identity()
    seller = Seller.query.filter_by(user_id=user_id).first()

    if not seller:
        abort(404, description="Perfil de vendedor no encontrado")

    if not seller.stripe_account_id:
        abort(400, description="El vendedor no tiene cuenta Stripe. Llama primero a POST /seller/stripe/connect")

    try:
        account_link = stripe.AccountLink.create(
            account=seller.stripe_account_id,
            refresh_url=f"{os.getenv('FRONTEND_URL')}seller/stripe/refresh",
            return_url=f"{os.getenv('FRONTEND_URL')}seller/stripe/return",
            type="account_onboarding",
        )

        return jsonify({"onboarding_url": account_link.url}), 200

    except stripe.error.StripeError as e:
        abort(500, description=f"Error de Stripe: {str(e)}")


# -------------------------
# ESTADO DE CUENTA STRIPE
# -------------------------

@seller_bp.route("/stripe/status", methods=["GET"])
@jwt_required()
def get_stripe_account_status():
    user_id = get_jwt_identity()
    seller = Seller.query.filter_by(user_id=user_id).first()

    if not seller or not seller.stripe_account_id:
        return jsonify({"connected": False}), 200

    try:
        account = stripe.Account.retrieve(seller.stripe_account_id)

        # details_submitted = el usuario completó el formulario de onboarding
        # charges_enabled   = Stripe activó los cobros (puede tardar en test)
        connected = account.charges_enabled or account.details_submitted

        if connected and not seller.stripe_onboarding_completed:
            try:
                seller.stripe_onboarding_completed = True
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                abort(500, description=f"Error al guardar estado: {str(e)}")

        return jsonify({
            "connected": connected,
            "onboarding_completed": seller.stripe_onboarding_completed
        }), 200

    except stripe.error.StripeError as e:
        abort(500, description=f"Error de Stripe: {str(e)}")


# -------------------------
# MOSTRAR PRODUCTOS (DEL PROPIO VENDEDOR)
# -------------------------

@seller_bp.route('/me/products', methods=['GET'])
@jwt_required()
def get_my_products():
    from api.models.seller import Seller
    seller = Seller.query.filter_by(user_id=get_jwt_identity()).first()
    if not seller:
        abort(404, description="Seller no encontrado")
    locale = request.args.get("locale", "es")
    return jsonify([p.serialize(locale=locale) for p in seller.products]), 200
