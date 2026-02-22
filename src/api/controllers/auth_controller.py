from flask import request, jsonify, abort, Blueprint
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from api.models import db
from api.models.user import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route("/signup", methods=["POST"])
def create_user():
    body = request.get_json()
    if not body:
        abort(400, description="El body no puede estar vacio")

    required_fields = ["name", "last_name", "email", "password"]
    for field in required_fields:
        if field not in body or not body[field]:
            abort(400, description=f"El campo '{field}' es obligatorio")

    if User.query.filter_by(email=body["email"]).first():
        abort(409, description="Ya existe un usuario con ese email")

    try:
        new_user = User(
            name=body["name"],
            last_name=body["last_name"],
            email=body["email"],
            is_active=True
        )
        new_user.set_password(body["password"])
        db.session.add(new_user)
        db.session.commit()
        access_token = create_access_token(identity=str(new_user.id))
        return jsonify({"user": new_user.serialize(), "token": access_token}), 201
    except Exception as error:
        db.session.rollback()
        abort(500, description=f"Error al crear usuario: {str(error)}")


@auth_bp.route("/login", methods=["POST"])
def login():
    body = request.get_json()
    if not body:
        abort(400, description="El body no puede estar vacio")
    if "email" not in body or "password" not in body:
        abort(400, description="Email y password son obligatorios")

    user = User.query.filter_by(email=body["email"]).first()
    if not user or not user.is_active:
        abort(401, description="Email o password incorrectos")
    if not user.check_password(body["password"]):
        abort(401, description="Email o password incorrectos")

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"user": user.serialize(), "token": access_token}), 200


@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        abort(404, description="Usuario no encontrado")
    return jsonify({"id": user.id, "email": user.email}), 200