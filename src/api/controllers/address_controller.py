from flask import request, jsonify, abort, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db
from api.models.address import Address
from api.models.user import User

address_bp = Blueprint('address', __name__, url_prefix='/address')


@address_bp.route("", methods=["POST"])
@jwt_required()
def create_address():
    user_id = int(get_jwt_identity())
    body = request.get_json()

    if not body:
        abort(400, description="Body vacío")

    user = User.query.get(user_id)
    if not user:
        abort(404, description="Usuario no encontrado")

    required_fields = ["address", "full_name", "phone", "city", "postal_code", "country"]

    for field in required_fields:
        if field not in body or not body[field]:
            abort(400, description=f"{field} es obligatorio")

    new_address = Address(
        user_id=user_id,
        address=body["address"].strip(),
        full_name=body["full_name"].strip(),
        phone=body["phone"].strip(),
        city=body["city"].strip(),
        province=body.get("province"),
        municipality=body.get("municipality"),
        postal_code=body["postal_code"].strip(),
        country=body["country"].strip(),
        address_type=body.get("address_type", "shipping")
    )

    db.session.add(new_address)
    db.session.commit()

    return jsonify(new_address.serialize()), 201


@address_bp.route("", methods=["GET"])
@jwt_required()
def get_addresses():
    user_id = int(get_jwt_identity())
    addresses = Address.query.filter_by(user_id=user_id).all()
    return jsonify([a.serialize() for a in addresses]), 200


@address_bp.route("/<int:address_id>", methods=["PUT"])
@jwt_required()
def update_address(address_id):
    user_id = int(get_jwt_identity())
    body = request.get_json()

    if not body:
        abort(400, description="Body vacío")

    address = Address.query.filter_by(id=address_id, user_id=user_id).first()

    if not address:
        abort(404, description="Dirección no encontrada")

    editable_fields = [
        "address",
        "full_name",
        "phone",
        "city",
        "province",
        "municipality",
        "postal_code",
        "country",
        "address_type"
    ]

    for field in editable_fields:
        if field in body and body[field]:
            setattr(address, field, body[field].strip() if isinstance(body[field], str) else body[field])

    db.session.commit()

    return jsonify(address.serialize()), 200


@address_bp.route("/<int:address_id>", methods=["DELETE"])
@jwt_required()
def delete_address(address_id):
    user_id = int(get_jwt_identity())

    address = Address.query.filter_by(id=address_id, user_id=user_id).first()

    if not address:
        abort(404, description="Dirección no encontrada")

    db.session.delete(address)
    db.session.commit()

    return jsonify({"msg": "Dirección eliminada correctamente"}), 200
