from flask import jsonify, abort, Blueprint, request
from sqlalchemy.orm import joinedload
from sqlalchemy import func, text
from api.models import db
from api.models.category import Category
from api.models.subcategory import Subcategory
from api.models.item import Item
from api.models.product import Product
from api.models.review import Review

categories_bp = Blueprint('categories', __name__)


@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    locale = request.args.get("locale", "es")

    categories = Category.query.options(
        joinedload(Category.subcategories).joinedload(Subcategory.items)
    ).all()

    result = []
    for cat in categories:
        cat_data = cat.serialize(locale=locale)
        cat_data["subcategories"] = []
        for sub in cat.subcategories:
            sub_data = sub.serialize(locale=locale)
            sub_data["items"] = [item.serialize(locale=locale) for item in sub.items]
            cat_data["subcategories"].append(sub_data)
        result.append(cat_data)

    return jsonify(result), 200


@categories_bp.route('/subcategories/top-discount', methods=['GET'])
def get_featured_subcategory_banner():
    locale = request.args.get("locale", "es")

    result = db.session.query(
        Subcategory,
        func.count(Product.id).label("offer_count")
    ).join(Subcategory.items)\
     .join(Item.products)\
     .filter(Product.discount > 0)\
     .group_by(Subcategory.id)\
     .order_by(text("offer_count DESC"))\
     .first()

    if result:
        subcategory, offer_count = result
        return jsonify({
            "name": subcategory.name.get(locale) or subcategory.name.get("es"),
            "slug": subcategory.slug,
            "description": subcategory.description.get(locale) if subcategory.description else None,
            "image_url": subcategory.image_url,
            "category_slug": subcategory.category.slug,
            "offer_count": offer_count
        }), 200

    subcategory = Subcategory.query.filter_by(slug="ofertas").first()
    if not subcategory:
        abort(404, description="No hay subcategorías en oferta disponibles")

    return jsonify({
        "name": subcategory.name.get(locale) or subcategory.name.get("es"),
        "slug": subcategory.slug,
        "description": subcategory.description.get(locale) if subcategory.description else None,
        "image_url": subcategory.image_url,
        "category_slug": subcategory.category.slug,
        "offer_count": 0
    }), 200


@categories_bp.route('/subcategories/top-rated', methods=['GET'])
def get_top_rated_subcategories():
    locale = request.args.get("locale", "es")

    result = db.session.query(
        Subcategory,
        func.count(Product.id).label("product_count"),
        func.avg(Review.rating).label("avg_rating")
    ).join(Subcategory.items)\
     .join(Item.products)\
     .join(Product.reviews)\
     .group_by(Subcategory.id)\
     .order_by(text("avg_rating DESC"), text("product_count DESC"))\
     .limit(5)\
     .all()

    return jsonify([{
        "id": sub.id,
        "name": sub.name.get(locale) or sub.name.get("es"),
        "slug": sub.slug,
        "image_url": sub.image_url,
        "category_slug": sub.category.slug,
        "avg_rating": round(float(avg_rating), 1) if avg_rating else 0,
        "product_count": product_count
    } for sub, product_count, avg_rating in result]), 200