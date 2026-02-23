from flask import request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db
from api.models.user import User
import re
import os
import cloudinary
import cloudinary.uploader

# -------------------------
# CONFIG CLOUDINARY
# -------------------------

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# -------------------------
# VALIDACIONES
# -------------------------

def validate_email(email):
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(pattern, email)


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
# ACTUALIZAR DATOS BÁSICOS
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

    if "name" in body:
        if not body["name"].strip():
            abort(400, description="Nombre no puede estar vacío")
        user.name = body["name"].strip()

    if "last_name" in body:
        if not body["last_name"].strip():
            abort(400, description="Apellido no puede estar vacío")
        user.last_name = body["last_name"].strip()

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
# SUBIR IMAGEN DESDE DISPOSITIVO
# -------------------------

@jwt_required()
def update_profile_image():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        abort(404, description="Usuario no encontrado")

    if "image" not in request.files:
        abort(400, description="No se envió ninguna imagen")

    image_file = request.files["image"]

    if image_file.filename == "":
        abort(400, description="Archivo vacío")

    allowed_extensions = ["jpg", "jpeg", "png", "webp"]
    
    if "." not in image_file.filename:
        abort(400, description="Formato inválido")

    file_extension = image_file.filename.rsplit(".", 1)[1].lower()

    if file_extension not in allowed_extensions:
        abort(400, description="Formato no permitido")

    try:
        result = cloudinary.uploader.upload(
            image_file,
            folder="profile_images"
        )

        image_url = result["secure_url"]

        user.image_url = image_url
        db.session.commit()

        return jsonify({
            "msg": "Imagen actualizada correctamente",
            "image_url": image_url
        }), 200

    except Exception as e:
        abort(500, description=f"Error subiendo imagen: {str(e)}")


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