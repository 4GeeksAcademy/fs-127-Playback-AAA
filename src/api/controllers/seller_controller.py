from flask import request, jsonify, abort, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db
from api.models.user import User, RoleName
from api.models.seller import Seller, SellerStatus

seller_bp = Blueprint('seller', __name__, url_prefix='/seller')


# -------------------------
# REGISTRO DE VENDEDOR
# -------------------------

@seller_bp.route("/register", methods=["POST"])
def register_seller():
    body = request.get_json()
    if not body:
        abort(400, description="El body no puede estar vacío")

    # ── Validar campos obligatorios ──────────────────────────────────────────
    required_user   = ["name", "last_name", "email", "password"]
    required_seller = ["store_name", "nif_cif", "iban", "account_holder",
                       "origin_address", "origin_city", "origin_zip", "origin_country"]

    for field in required_user + required_seller:
        if field not in body or not body[field]:
            abort(400, description=f"El campo '{field}' es obligatorio")

    if User.query.filter_by(email=body["email"]).first():
        abort(409, description="Ya existe un usuario con ese email")

    if Seller.query.filter_by(nif_cif=body["nif_cif"]).first():
        abort(409, description="Ya existe un vendedor con ese NIF/CIF")

    try:
        # ── Crear usuario con rol seller ─────────────────────────────────────
        new_user = User(
            name=body["name"],
            last_name=body["last_name"],
            email=body["email"],
            is_active=True,
            role=RoleName.seller
        )
        new_user.set_password(body["password"])
        db.session.add(new_user)
        db.session.flush()

        # ── Crear perfil de vendedor ─────────────────────────────────────────
        new_seller = Seller(
            user_id=new_user.id,
            store_name=body["store_name"],
            description=body.get("description"),
            phone=body.get("phone"),
            nif_cif=body["nif_cif"],
            iban=body["iban"],
            account_holder=body["account_holder"],
            origin_address=body["origin_address"],
            origin_city=body["origin_city"],
            origin_zip=body["origin_zip"],
            origin_country=body["origin_country"],
            status=SellerStatus.pending
        )
        db.session.add(new_seller)
        db.session.commit()

        return jsonify({
            "msg": "Solicitud de vendedor recibida, pendiente de aprobación",
            "user": new_user.serialize(),
            "seller": new_seller.serialize()
        }), 201

    except Exception as error:
        db.session.rollback()
        abort(500, description=f"Error al registrar vendedor: {str(error)}")


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

    # Campos actualizables — el NIF y el IBAN no se pueden cambiar una vez creados
    updatable = ["store_name", "description", "phone", "logo_url",
                 "origin_address", "origin_city", "origin_zip", "origin_country"]

    updated = False
    for field in updatable:
        if field in body:
            setattr(seller, field, body[field])
            updated = True

    if not updated:
        abort(400, description="No hay datos para actualizar")

    db.session.commit()
    return jsonify({"msg": "Perfil actualizado correctamente", "seller": seller.serialize()}), 200