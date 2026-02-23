"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from werkzeug.exceptions import HTTPException
from flask import jsonify, Blueprint
from flask_jwt_extended import jwt_required
from flask_cors import CORS
from api.controllers import register_controllers

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)
register_controllers(api)


@api.errorhandler(HTTPException)
def handle_exception(e):
    response = e.get_response()
    response.data = jsonify({
        "code": e.code,
        "name": e.name,
        "description": e.description
    }).data
    response.content_type = "application/json"
    return response


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200