from flask import jsonify, abort, Blueprint
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
    """
    Obtiene todas las categorías con sus subcategorías e ítems anidados.

    Retorna:
        Respuesta JSON que incluye:
        - Categorías
        - Subcategorías asociadas
        - Ítems pertenecientes a cada subcategoría
    """
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
    """
    Obtiene la subcategoría con mayor número de productos en oferta.

    Lógica de negocio:
        - Selecciona la subcategoría con más productos cuyo descuento sea mayor a 0.
        - Si no existen productos en oferta, utiliza como alternativa la subcategoría
          con slug 'ofertas'.

    Retorna:
        Respuesta JSON con:
        - Datos de la subcategoría
        - Slug de la categoría padre
        - Número de productos en oferta (offer_count)

    Errores:
        - 404 si no existe ninguna subcategoría válida como alternativa.
    """

    # Consulta la subcategoría con mayor cantidad de productos con descuento
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

    # Alternativa: buscar subcategoría estática "ofertas"
    subcategory = Subcategory.query.filter_by(slug="ofertas").first()
    if not subcategory:
        abort(404, description="No hay subcategorías en oferta disponibles")

    return jsonify({
        "name": subcategory.name,
        "slug": subcategory.slug,
        "description": subcategory.description,
        "image_url": subcategory.image_url,
        "category_slug": subcategory.category.slug,
        "offer_count": 0
    }), 200


@categories_bp.route('/subcategories/top-rated', methods=['GET'])
def get_top_rated_subcategories():
    """
    Obtiene las 5 subcategorías mejor valoradas.

    Criterios de ordenación:
        1. Mayor valoración media (descendente)
        2. Mayor cantidad de productos (descendente)

    Uso:
        Se emplea en la sección de Categorías Destacadas de la página principal.

    Retorna:
        Lista JSON con:
        - Datos básicos de la subcategoría
        - Slug de la categoría padre
        - Valoración media (redondeada a 1 decimal)
        - Número total de productos
    """

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
        "name": sub.name,
        "slug": sub.slug,
        "image_url": sub.image_url,
        "category_slug": sub.category.slug,
        "avg_rating": round(float(avg_rating), 1) if avg_rating else 0,
        "product_count": product_count
    } for sub, product_count, avg_rating in result]), 200