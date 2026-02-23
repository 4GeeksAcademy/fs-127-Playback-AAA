"""
Controlador de review - Endpoints /api/Review
"""

from flask import Blueprint, request, jsonify  
from flask_jwt_extended import jwt_required
from api.models import db, Review 

review_bp = Blueprint('review', __name__, url_prefix='/review')

@review_bp.route('', methods=['GET'])
# El JWT te obliga a hacer login 
# @jwt_required()/
def get_review():
    reviews = Review.query.all()
    return jsonify([p.serialize() for p in reviews]), 200
