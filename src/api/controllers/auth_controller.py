from flask import request, jsonify, abort, Blueprint
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from api.models import db
from api.models.user import User
from extensions import mail
from flask_mail import Message
from datetime import timedelta
import os


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
        #correo de bienvenida
        new_user.set_password(body["password"])
        db.session.add(new_user)
        db.session.commit()

        msg = Message(
            subject="Bienvenido a Playback",
            recipients=[new_user.email],
            sender=("Playback", os.getenv("MAIL_USERNAME"))
        )

        msg.body = (
            f"Hola {new_user.name},\n\n"
            "Muchas gracias por unirte a Playback.\n\n"
            "Tu cuenta ha sido creada correctamente.\n\n"
            "Ya puedes iniciar sesión y comenzar a usar la plataforma.\n\n"
            "Equipo Playback"
        )

        mail.send(msg)

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


#recuperacion de contraseña 
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():

    body = request.get_json()
    if not body or "email" not in body:
        abort(400, description="Email es obligatorio")

    email = body["email"].strip().lower()
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"msg": "Si el email existe recibirás instrucciones"}), 200

    token = create_access_token(
        identity=str(user.id),
        expires_delta=timedelta(minutes=15)
    )

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_url = f"{frontend_url}/reset-password?token={token}"

    msg = Message(
        subject="Recuperación de contraseña",
        recipients=[user.email]
    )

    msg.body = (
        f"Hola {user.name},\n\n"
        "Haz clic en el siguiente enlace para restablecer tu contraseña:\n\n"
        f"{reset_url}\n\n"
        "Este enlace expira en 15 minutos.\n\n"
        "Si no solicitaste este cambio, puedes ignorar este mensaje."
    )

    mail.send(msg)

    return jsonify({"msg": "Email enviado correctamente"}), 200


#recuperacion de contraseña
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():

    body = request.get_json()

    if not body or "token" not in body or "new_password" not in body or "confirm_password" not in body:
        abort(400, description="Datos incompletos")

    if body["new_password"] != body["confirm_password"]:
        abort(400, description="Las contraseñas no coinciden")

    if len(body["new_password"]) < 6:
        abort(400, description="La contraseña debe tener mínimo 6 caracteres")

    try:
        from flask_jwt_extended import decode_token
        decoded = decode_token(body["token"])
        user_id = decoded["sub"]
    except Exception:
        abort(400, description="Token inválido o expirado")

    user = User.query.filter_by(id=user_id).first()

    if not user:
        abort(404, description="Usuario no encontrado")

    user.set_password(body["new_password"])
    db.session.commit()

    return jsonify({"msg": "Contraseña actualizada correctamente"}), 200