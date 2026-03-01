"""
=============================================================================
                         CAPA DE CONTROLADORES
=============================================================================

Los controladores definen las rutas/endpoints de la API usando Blueprints.
Cada controlador se encarga de:
- Recibir la peticion HTTP
- Extraer los datos del request
- Llamar al servicio correspondiente
- Retornar la respuesta JSON con el codigo de estado adecuado

Cada controller es un sub-blueprint que se registra en el blueprint
principal 'api', por lo que todas las rutas quedan bajo /api/...
"""

from .auth_controller import auth_bp
from .categories_controller import categories_bp
from api.controllers.products_controller import product_bp
from api.controllers.review_controller import review_bp
from api.controllers.favorites_controller import favorite_bp 

from .user_controller import user_bp
from .address_controller import address_bp
from api.controllers.order_controller import order_bp




def register_controllers(api):
    """
    Registra todos los sub-blueprints (controladores) en el blueprint principal.
    Se llama desde routes.py al inicializar la API.
    """
    api.register_blueprint(auth_bp)
    api.register_blueprint(categories_bp)
    api.register_blueprint(product_bp)
    api.register_blueprint(review_bp)
    api.register_blueprint(favorite_bp)

    api.register_blueprint(user_bp)
    api.register_blueprint(address_bp)
    api.register_blueprint(order_bp)
