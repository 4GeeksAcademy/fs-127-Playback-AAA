from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity

from api.models import db
from api.models.incident import Incident
from api.models.order import Order
from api.models.user import User, RoleName


incident_bp = Blueprint("incident", __name__)


# Crear incidencia sobre un pedido
@incident_bp.route("/orders/<int:order_id>/incidences", methods=["POST"])
@jwt_required()
def create_incidence(order_id):

    user_id = get_jwt_identity()
    body = request.get_json()

    # Validar campos obligatorios
    if not body or "title" not in body or "description" not in body:
        abort(400, description="title y description son obligatorios")

    # Buscar el pedido
    order = Order.query.get(order_id)

    if not order:
        abort(404, description="Pedido no encontrado")

    # Validar que el pedido pertenece al usuario
    if order.user_id != int(user_id):
        abort(403, description="No puedes abrir incidencias en pedidos de otros usuarios")

    # Crear la incidencia
    incident = Incident(
        title=body["title"],
        description=body["description"],
        user_id=user_id,
        order_id=order_id,
        status="open"
    )

    db.session.add(incident)
    db.session.commit()

    return jsonify(incident.serialize()), 201


# Obtener incidencias del usuario autenticado
@incident_bp.route("/incidences/my", methods=["GET"])
@jwt_required()
def get_my_incidences():

    user_id = get_jwt_identity()

    incidents = Incident.query.filter_by(user_id=user_id).all()

    return jsonify([incident.serialize() for incident in incidents]), 200


# Actualizar estado de una incidencia (solo seller o admin)
@incident_bp.route("/incidences/<int:id>", methods=["PATCH"])
@jwt_required()
def update_incidence(id):

    user_id = get_jwt_identity()
    body = request.get_json()

    incident = Incident.query.get(id)

    if not incident:
        abort(404, description="Incidencia no encontrada")

    user = User.query.get(user_id)

    # Solo admin o seller pueden cambiar el estado
    if user.role not in [RoleName.admin, RoleName.seller]:
        abort(403, description="No autorizado")

    valid_status = ["open", "in_progress", "resolved", "rejected"]

    if body.get("status") not in valid_status:
        abort(400, description="Estado inválido")

    incident.status = body["status"]

    db.session.commit()

    return jsonify(incident.serialize()), 200