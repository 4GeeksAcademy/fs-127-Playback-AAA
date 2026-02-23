"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from werkzeug.exceptions import HTTPException
from flask import abort, request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, jwt_required
from api.models import db
from api.models.user import User
from api.controllers.user_controller import (
    get_profile,
    update_profile,
    update_profile_image,
    change_password
)
from flask_cors import CORS
from api.controllers import register_controllers

api = Blueprint('api', __name__)
CORS(api)
register_controllers(api)



# ---------------------------------
# ERROR HANDLER
# ---------------------------------

@api.errorhandler(HTTPException)
def handle_exception(e):
    response = e.get_response()
    response.data = jsonify({
        "code": e.code,
        "name": e.name,
        "description": e.description
    }).data
    response.content_type = "application/json"
    return response


# ---------------------------------
# AUTH - SIGNUP
# ---------------------------------

@api.route("/signup", methods=["POST"])
def signup():
    body = request.get_json()

    if not body:
        abort(400, description="El body no puede estar vacío")

    required_fields = ["name", "last_name", "email", "password"]

    for field in required_fields:
        if field not in body or not body[field]:
            abort(400, description=f"El campo '{field}' es obligatorio")

    if User.query.filter_by(email=body["email"]).first():
        abort(409, description="Ya existe un usuario con ese email")

    new_user = User(
        name=body["name"],
        last_name=body["last_name"],
        email=body["email"],
        is_active=True
    )

    new_user.set_password(body["password"])

    db.session.add(new_user)
    db.session.commit()

    token = create_access_token(identity=str(new_user.id))

    return jsonify({
        "user": new_user.serialize(),
        "token": token
    }), 201


# ---------------------------------
# AUTH - LOGIN
# ---------------------------------

@api.route("/login", methods=["POST"])
def login():
    body = request.get_json()

    if not body:
        abort(400, description="El body no puede estar vacío")

    if "email" not in body or "password" not in body:
        abort(400, description="Email y password son obligatorios")

    user = User.query.filter_by(email=body["email"]).first()

    if not user or not user.check_password(body["password"]):
        abort(401, description="Email o password incorrectos")

    if not user.is_active:
        abort(401, description="Cuenta desactivada")

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "user": user.serialize(),
        "token": token
    }), 200


# ---------------------------------
# PROFILE
# ---------------------------------

@api.route("/profile", methods=["GET"])
def profile():
    return get_profile()


@api.route("/profile", methods=["PUT"])
def edit_profile():
    return update_profile()


@api.route("/profile/image", methods=["PUT"])
def edit_profile_image():
    return update_profile_image()


@api.route("/profile/password", methods=["PUT"])
def edit_profile_password():
    return change_password()
@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200
