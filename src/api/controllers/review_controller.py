from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Review
import cloudinary.uploader

review_bp = Blueprint('review', __name__, url_prefix='/review')


@review_bp.route('', methods=['GET'])
def get_review():
    reviews = Review.query.all()
    return jsonify([p.serialize() for p in reviews]), 200


@review_bp.route('', methods=['POST'])
@jwt_required()
def create_review():
    user_id = get_jwt_identity()
    if request.content_type and "multipart/form-data" in request.content_type:
        rating = request.form.get("rating")
        title = request.form.get("title")
        comment = request.form.get("comment")
        is_visible = request.form.get("is_visible", True)
        product_id = request.form.get("product_id")
        order_id = request.form.get("order_id")
    else:
        body = request.get_json()
        if not body:
            abort(400, description="El body no puede estar vacío")
        rating = body.get("rating")
        title = body.get("title")
        comment = body.get("comment")
        is_visible = body.get("is_visible", True)
        product_id = body.get("product_id")
        order_id = body.get("order_id")

    if not rating or not product_id or not order_id:
        abort(400, description="rating, product_id y order_id son obligatorios")

    try:
        new_review = Review(
            rating=int(rating),
            title=title,
            comment=comment,
            is_visible=is_visible,
            user_id=int(user_id),
            product_id=int(product_id),
            order_id=int(order_id),
        )

        db.session.add(new_review)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        abort(500, description=f"Error al crear una review: {str(e)}")

    return jsonify(new_review.serialize()), 201
