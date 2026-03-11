# api/routes/incident.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db
from api.models.incident import Incident
from api.models.order import Order
from deep_translator import GoogleTranslator


incident_bp = Blueprint('incident', __name__)

def translate_text(text, target_lang):
    if not text:
        return None
    return GoogleTranslator(source='auto', target=target_lang).translate(text)

# ─── POST /incidents ───────────────────────────────────────────────────────────
# El usuario autenticado crea una incidencia
@incident_bp.route('/incidents', methods=['POST'])
@jwt_required()
def create_incident():
    current_user_id = get_jwt_identity()
    body = request.get_json()

    if not body:
        return jsonify({"error": "No se recibió ningún dato"}), 400

    title = body.get("title")
    description = body.get("description")
    order_id = body.get("order_id")  # opcional

    if not title or not description:
        return jsonify({"error": "title y description son obligatorios"}), 400

    # Si mandan order_id, verificar que la orden pertenece al usuario
    if order_id:
        order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
        if not order:
            return jsonify({"error": "La orden no existe o no te pertenece"}), 404

    incident = Incident(
        title=title,
        description=description,
        user_id=current_user_id,
        order_id=order_id,
        status="open"
    )

    db.session.add(incident)
    db.session.commit()

    return jsonify(incident.serialize()), 201

