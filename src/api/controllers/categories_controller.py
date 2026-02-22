from flask import jsonify, abort, Blueprint
from sqlalchemy.orm import joinedload
from sqlalchemy import func, text
from api.models import db
from api.models.category import Category
from api.models.subcategory import Subcategory
from api.models.item import Item
from api.models.product import Product

categories_bp = Blueprint('categories', __name__)


@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.options(
        joinedload(Category.subcategories).joinedload(Subcategory.items)
    ).all()

    result = []
    for cat in categories:
        cat_data = cat.serialize()
        cat_data["subcategories"] = []
        for sub in cat.subcategories:
            sub_data = sub.serialize()
            sub_data["items"] = [item.serialize() for item in sub.items]
            cat_data["subcategories"].append(sub_data)
        result.append(cat_data)

    return jsonify(result), 200


@categories_bp.route('/banners/featured-subcategory', methods=['GET'])
def get_featured_subcategory_banner():
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
            "name": subcategory.name,
            "slug": subcategory.slug,
            "description": subcategory.description,
            "image_url": subcategory.image_url,
            "category_slug": subcategory.category.slug,
            "offer_count": offer_count
        }), 200

    # Si no hay ofertas, devuelve la subcategoría "ofertas" si existe
    subcategory = Subcategory.query.filter_by(slug="ofertas").first()
    if not subcategory:
        abort(404, description="No hay ofertas disponibles")

    return jsonify({
        "name": subcategory.name,
        "slug": subcategory.slug,
        "description": subcategory.description,
        "image_url": subcategory.image_url,
        "category_slug": subcategory.category.slug,
        "offer_count": 0
    }), 200