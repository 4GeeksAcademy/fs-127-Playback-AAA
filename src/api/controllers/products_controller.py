"""
Controlador de productos - Endpoints /api/productos
"""

from flask import Blueprint, request, jsonify  
from flask_jwt_extended import jwt_required
from api.models import db, Product 

product_bp = Blueprint('product', __name__, url_prefix='/product')

@product_bp.route('', methods=['GET'])
# El JWT te obliga a hacer login 
# @jwt_required()/
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products]), 200