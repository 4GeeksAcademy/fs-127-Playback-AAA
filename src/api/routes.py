"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from werkzeug.exceptions import HTTPException
from flask import Flask, abort, request, jsonify, url_for, Blueprint
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.controllers import register_controllers
import cloudinary.uploader

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)
register_controllers(api)


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


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


@api.route("/signup", methods=["POST"])
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
        return jsonify({
            "user": new_user.serialize(),
            "token": access_token
        }), 201
    except Exception as error:
        db.session.rollback()
        abort(500, description=f"Error al crear usuario: {str(error)}")


@api.route("/login", methods=["POST"])
def login():
    body = request.get_json()
    if not body:
        abort(400, description="El body no puede estar vacio")
    if "email" not in body or "password" not in body:
        abort(400, description="Email y password son obligatorios")

    user = User.query.filter_by(email=body["email"]).first()
    if not user:
        abort(401, description="Email o password incorrectos")
    if not user.is_active:
        abort(401, description="La cuenta esta desactivada")
    if not user.check_password(body["password"]):
        abort(401, description="Email o password incorrectos")

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "user": user.serialize(),
        "token": access_token
    }), 200


@api.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        abort(404, description="Usuario no encontrado")
    return jsonify({"id": user.id, "email": user.email}), 200




@api.route("/productos", methods=["POST"])
def crear_producto():
    nombre = request.form.get("name")
    precio = request.form.get("price")
    descripcion = request.form.get("description")
    imagen = request.files.get("imagen")

    if not nombre or not precio:
        abort(400, description="Nombre y precio son obligatorios")

    imagen_url = None
    if imagen:
        try:
            resultado = cloudinary.uploader.upload(imagen, folder="productos")
            imagen_url = resultado["secure_url"]
        except Exception as e:
            abort(500, description=f"Error al subir imagen: {str(e)}")

    try:
        from api.models import Product
        nuevo = Product(
            name=nombre,
            price=float(precio),
            description=descripcion,
            image_url=imagen_url,
            stock=0,
            discount=0.0
        )
        db.session.add(nuevo)
        db.session.commit()
        return jsonify(nuevo.serialize()), 201
    except Exception as e:
        db.session.rollback()
        abort(500, description=f"Error al crear producto: {str(e)}")
