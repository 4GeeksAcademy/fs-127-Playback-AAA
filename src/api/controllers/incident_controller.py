from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from threading import Thread
from flask import current_app

from api.models import db
from api.models.incident import Incident
from api.models.incident_message import IncidentMessage
from api.models.seller_order import SellerOrder, SellerOrderStatus
from api.models.user import User, RoleName
from api.emails.brevo_service import send_email
import cloudinary.uploader


incident_bp = Blueprint("incident", __name__)


# ── Helper email async ────────────────────────────────────────────────────────
def _send_email_async(app, message):
    with app.app_context():
        try:
            send_email(message)
        except Exception as e:
            print(f"[Incident] Error al enviar email: {str(e)}")


# ── Helper: comprobar si un usuario puede acceder a una incidencia ────────────
def _can_access_incident(incident, user):
    """Comprador del pedido, vendedor implicado en el seller_order, o admin."""
    if user.role and user.role.value == "admin":
        return True
    if incident.user_id == user.id:
        return True
    # Vendedor implicado en este seller_order concreto
    if incident.seller_order and incident.seller_order.seller.user_id == user.id:
        return True
    return False


# ─────────────────────────────────────────────────────────────────────────────
# Crear incidencia sobre un SellerOrder concreto
# POST /api/seller-orders/<seller_order_id>/incidences
# ─────────────────────────────────────────────────────────────────────────────
@incident_bp.route("/seller-orders/<int:seller_order_id>/incidences", methods=["POST"])
@jwt_required()
def create_incidence(seller_order_id):

    user_id = get_jwt_identity()
    body = request.get_json()

    if not body or "title" not in body or "description" not in body:
        abort(400, description="title y description son obligatorios")

    seller_order = SellerOrder.query.get(seller_order_id)
    if not seller_order:
        abort(404, description="Envío no encontrado")

    # Solo el comprador del pedido puede abrir la incidencia
    if seller_order.order.user_id != int(user_id):
        abort(403, description="No puedes abrir incidencias en pedidos de otros usuarios")

    # Solo si el envío está en processing, shipped o delivered
    if seller_order.status.value not in ["processing", "shipped", "delivered"]:
        abort(400, description="Solo puedes abrir incidencias en envíos en preparación, enviados o entregados")

    # Evitar incidencias duplicadas por seller_order
    existing = Incident.query.filter_by(seller_order_id=seller_order_id).first()
    if existing:
        abort(400, description="Este envío ya tiene una incidencia abierta")

    incident = Incident(
        title=body["title"],
        description=body["description"],
        user_id=user_id,
        seller_order_id=seller_order_id,
        status="open"
    )

    db.session.add(incident)
    db.session.commit()

    # Email al vendedor implicado
    try:
        from api.emails.incident_emails import build_incident_created_seller_email
        buyer = User.query.get(user_id)
        seller = seller_order.seller
        app = current_app._get_current_object()
        Thread(
            target=_send_email_async,
            args=(app, build_incident_created_seller_email(seller, buyer, incident))
        ).start()
    except Exception as e:
        print(f"[Incident] Error preparando email de creación: {str(e)}")

    return jsonify(incident.serialize()), 201


# ─────────────────────────────────────────────────────────────────────────────
# Obtener incidencias del usuario autenticado
# ─────────────────────────────────────────────────────────────────────────────
@incident_bp.route("/incidences/my", methods=["GET"])
@jwt_required()
def get_my_incidences():

    user_id = get_jwt_identity()

    incidents = (
        Incident.query
        .filter_by(user_id=user_id)
        .order_by(Incident.created_at.desc())
        .all()
    )

    return jsonify([incident.serialize() for incident in incidents]), 200


# ─────────────────────────────────────────────────────────────────────────────
# Obtener TODAS las incidencias (solo admin o seller)
# ─────────────────────────────────────────────────────────────────────────────
@incident_bp.route("/incidences", methods=["GET"])
@jwt_required()
def get_all_incidences():

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role not in [RoleName.admin, RoleName.seller]:
        abort(403, description="No autorizado")

    if user.role == RoleName.admin:
        # Admin ve todas
        incidents = Incident.query.order_by(Incident.created_at.desc()).all()
    else:
        # Seller solo ve las de sus propios SellerOrders
        from api.models.seller import Seller
        from api.models.seller_order import SellerOrder
        seller = Seller.query.filter_by(user_id=user_id).first()
        if not seller:
            return jsonify([]), 200
        incidents = (
            Incident.query
            .join(SellerOrder, Incident.seller_order_id == SellerOrder.id)
            .filter(SellerOrder.seller_id == seller.id)
            .order_by(Incident.created_at.desc())
            .all()
        )

    return jsonify([incident.serialize() for incident in incidents]), 200


# ─────────────────────────────────────────────────────────────────────────────
# Actualizar estado de una incidencia (solo seller o admin)
# ─────────────────────────────────────────────────────────────────────────────
@incident_bp.route("/incidences/<int:id>", methods=["PATCH"])
@jwt_required()
def update_incidence(id):

    user_id = get_jwt_identity()
    body = request.get_json()

    incident = Incident.query.get(id)
    if not incident:
        abort(404, description="Incidencia no encontrada")

    user = User.query.get(user_id)

    if user.role not in [RoleName.admin, RoleName.seller]:
        abort(403, description="No autorizado")

    valid_status = ["open", "in_progress", "resolved", "rejected"]
    if body.get("status") not in valid_status:
        abort(400, description="Estado inválido")

    incident.status = body["status"]
    db.session.commit()

    # Email al comprador cuando cambia el estado
    try:
        from api.emails.incident_emails import build_incident_status_changed_email
        buyer = User.query.get(incident.user_id)
        app = current_app._get_current_object()
        Thread(
            target=_send_email_async,
            args=(app, build_incident_status_changed_email(buyer, incident))
        ).start()
    except Exception as e:
        print(f"[Incident] Error preparando email de cambio de estado: {str(e)}")

    return jsonify(incident.serialize()), 200


# ─────────────────────────────────────────────────────────────────────────────
# Cerrar incidencia (solo el comprador dueño de la incidencia)
# ─────────────────────────────────────────────────────────────────────────────
@incident_bp.route("/incidences/<int:id>/close", methods=["PATCH"])
@jwt_required()
def close_incidence(id):

    user_id = int(get_jwt_identity())

    incident = Incident.query.get(id)
    if not incident:
        abort(404, description="Incidencia no encontrada")

    if incident.user_id != user_id:
        abort(403, description="Solo puedes cerrar tus propias incidencias")

    if incident.status in ["resolved", "rejected"]:
        abort(400, description=f"La incidencia ya está cerrada (estado: {incident.status})")

    incident.status = "resolved"
    db.session.commit()

    return jsonify(incident.serialize()), 200


# ─────────────────────────────────────────────────────────────────────────────
# Obtener mensajes de una incidencia
# ─────────────────────────────────────────────────────────────────────────────
@incident_bp.route("/incidences/<int:id>/messages", methods=["GET"])
@jwt_required()
def get_incident_messages(id):

    user_id = int(get_jwt_identity())

    incident = Incident.query.get(id)
    if not incident:
        abort(404, description="Incidencia no encontrada")

    user = User.query.get(user_id)
    if not _can_access_incident(incident, user):
        abort(403, description="No tienes acceso a esta incidencia")

    messages = (
        IncidentMessage.query
        .filter_by(incident_id=id)
        .order_by(IncidentMessage.created_at.asc())
        .all()
    )

    return jsonify([m.serialize() for m in messages]), 200


# ─────────────────────────────────────────────────────────────────────────────
# Enviar mensaje en una incidencia (con imagen opcional via Cloudinary)
# ─────────────────────────────────────────────────────────────────────────────
@incident_bp.route("/incidences/<int:id>/messages", methods=["POST"])
@jwt_required()
def create_incident_message(id):

    user_id = int(get_jwt_identity())

    incident = Incident.query.get(id)
    if not incident:
        abort(404, description="Incidencia no encontrada")

    user = User.query.get(user_id)
    if not _can_access_incident(incident, user):
        abort(403, description="No tienes acceso a esta incidencia")

    if incident.status in ["resolved", "rejected"]:
        abort(400, description="No se pueden enviar mensajes en una incidencia cerrada")

    # Soporta multipart (con imagen) y JSON (solo texto)
    if request.content_type and "multipart/form-data" in request.content_type:
        body_text = request.form.get("body", "").strip()
        imagen = request.files.get("image")
    else:
        data = request.get_json() or {}
        body_text = data.get("body", "").strip()
        imagen = None

    if not body_text and not imagen:
        abort(400, description="El mensaje debe tener texto o imagen")

    # Subir imagen a Cloudinary si viene
    image_url = None
    if imagen:
        try:
            resultado = cloudinary.uploader.upload(imagen, folder="incidencias")
            image_url = resultado["secure_url"]
        except Exception as e:
            abort(500, description=f"Error al subir imagen: {str(e)}")

    message = IncidentMessage(
        incident_id=id,
        user_id=user_id,
        body=body_text or None,
        image_url=image_url,
    )

    db.session.add(message)
    db.session.commit()

    # Email al otro participante
    try:
        from api.emails.incident_emails import build_incident_new_message_email
        buyer = User.query.get(incident.user_id)
        seller_user = User.query.get(incident.seller_order.seller.user_id)
        app = current_app._get_current_object()
        sender = user

        if sender.id == incident.user_id:
            # Comprador escribe → notificar al vendedor
            if seller_user:
                Thread(
                    target=_send_email_async,
                    args=(app, build_incident_new_message_email(seller_user, sender, incident))
                ).start()
        else:
            # Vendedor o admin escribe → notificar al comprador
            Thread(
                target=_send_email_async,
                args=(app, build_incident_new_message_email(buyer, sender, incident))
            ).start()

    except Exception as e:
        print(f"[Incident] Error preparando email de mensaje: {str(e)}")

    return jsonify(message.serialize()), 201