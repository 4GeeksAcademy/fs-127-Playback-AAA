from flask import request, jsonify, abort, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from api.models import db, User
from api.models.seller import Seller, SellerStatus
from api.models.user import User, RoleName        
from api.utils import require_role

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


# -------------------------
# LISTAR VENDEDORES
# -------------------------

@admin_bp.route("/sellers", methods=["GET"])
@jwt_required()
@require_role("admin")
def get_sellers():
    status_filter = request.args.get("status")

    if status_filter:
        try:
            status_enum = SellerStatus(status_filter)
            sellers = Seller.query.filter_by(status=status_enum).all()
        except ValueError:
            abort(400, description=f"Estado inválido: {status_filter}. Usa: pending, verified, rejected")
    else:
        sellers = Seller.query.all()

    return jsonify([s.serialize() for s in sellers]), 200




# -------------------------
# CAMBIAR ESTADO DE VENDEDOR
# -------------------------

@admin_bp.route("/sellers/<int:seller_id>/status", methods=["PUT"])
@jwt_required()
@require_role("admin")
def update_seller_status(seller_id):
    seller = Seller.query.get(seller_id)

    if not seller:
        abort(404, description="Vendedor no encontrado")

    body = request.get_json()
    if not body or "status" not in body:
        abort(400, description="El campo 'status' es obligatorio")

    try:
        new_status = SellerStatus(body["status"])
    except ValueError:
        abort(400, description=f"Estado inválido: {body['status']}")

    seller.status = new_status

    # Guardar motivo de rechazo si se proporciona, limpiar si se aprueba
    if new_status == SellerStatus.rejected:
        seller.rejection_reason = body.get("rejection_reason") or None
    else:
        seller.rejection_reason = None

    # Cambiar rol del usuario según el estado
    user = User.query.get(seller.user_id)
    if user:
        if new_status == SellerStatus.verified:
            user.role = RoleName.seller
        elif new_status in (SellerStatus.rejected, SellerStatus.pending):
            user.role = RoleName.buyer

    db.session.commit()

    return jsonify({
        "msg": f"Estado actualizado a '{new_status.value}'",
        "seller": seller.serialize()
    }), 200