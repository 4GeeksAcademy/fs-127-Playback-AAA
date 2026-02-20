from flask import request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db
from api.models.user import User
import re


# -------------------------
# VALIDACIONES
# -------------------------

def validate_email(email):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email)


def validate_image_url(url):
    pattern = r"^https?:\/\/.*\.(jpg|jpeg|png|webp)$"
    return re.match(pattern, url, re.IGNORECASE)


# -------------------------
# OBTENER PERFIL
# -------------------------

@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        abort(404, description="Usuario no encontrado")

    return jsonify(user.serialize()), 200


# -------------------------
# ACTUALIZAR DATOS BASICOS
# -------------------------

@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        abort(404, description="Usuario no encontrado")

    body = request.get_json()
    if not body:
        abort(400, description="Body vacío")

    # Nombre
    if "name" in body:
        if not body["name"].strip():
            abort(400, description="Nombre no puede estar vacío")
        user.name = body["name"].strip()

    # Apellido
    if "last_name" in body:
        if not body["last_name"].strip():
            abort(400, description="Apellido no puede estar vacío")
        user.last_name = body["last_name"].strip()

    # Email
    if "email" in body:
        if not validate_email(body["email"]):
            abort(400, description="Formato de email inválido")

        existing_user = User.query.filter(
            User.email == body["email"],
            User.id != user.id
        ).first()

        if existing_user:
            abort(409, description="Email ya existe")

        user.email = body["email"]

    db.session.commit()

    return jsonify({"msg": "Perfil actualizado correctamente"}), 200


# -------------------------
# CAMBIAR IMAGEN
# -------------------------

@jwt_required()
def update_profile_image():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        abort(404, description="Usuario no encontrado")

    body = request.get_json()
    if not body or "image_url" not in body:
        abort(400, description="image_url es obligatorio")

    image_url = body["image_url"].strip()

    if not validate_image_url(image_url):
        abort(400, description="URL inválida (debe terminar en jpg, png o webp)")

    user.image_url = image_url
    db.session.commit()

    return jsonify({"msg": "Imagen actualizada correctamente"}), 200


# -------------------------
# CAMBIAR PASSWORD
# -------------------------

@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        abort(404, description="Usuario no encontrado")

    body = request.get_json()
    if not body:
        abort(400, description="Body vacío")

    required = ["current_password", "new_password", "confirm_password"]
    for field in required:
        if field not in body or not body[field]:
            abort(400, description=f"{field} es obligatorio")

    if not user.check_password(body["current_password"]):
        abort(401, description="Contraseña actual incorrecta")

    if body["new_password"] != body["confirm_password"]:
        abort(400, description="Las contraseñas no coinciden")

    if len(body["new_password"]) < 6:
        abort(400, description="La contraseña debe tener mínimo 6 caracteres")

    user.set_password(body["new_password"])
    db.session.commit()

    return jsonify({"msg": "Contraseña actualizada correctamente"}), 200