from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Favorite, Product

favorite_bp = Blueprint('favorite', __name__, url_prefix='/favorite')

@favorite_bp.route('', methods=['GET'])
@jwt_required()
def get_favorites():
    user_id = get_jwt_identity()
    locale = request.args.get("locale", "es")
    favorites = Favorite.query.filter_by(user_id=user_id).all()
    return jsonify([f.product.to_dict(locale=locale) for f in favorites]), 200

@favorite_bp.route('', methods=['POST'])
@jwt_required()
def add_favorite():
    user_id = get_jwt_identity()
    body = request.get_json()
    product_id = body.get("product_id")
    if not product_id:
        abort(400, description="product_id es obligatorio")
    existing = Favorite.query.filter_by(user_id=user_id, product_id=product_id).first()
    if existing:
        return jsonify({"message": "Ya es favorito"}), 200
    favorite = Favorite(user_id=user_id, product_id=product_id)
    db.session.add(favorite)
    db.session.commit()
    return jsonify({"message": "Añadido a favoritos"}), 201

@favorite_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_favorite(product_id):
    user_id = get_jwt_identity()
    favorite = Favorite.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not favorite:
        abort(404, description="Favorito no encontrado")
    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"message": "Eliminado de favoritos"}), 200