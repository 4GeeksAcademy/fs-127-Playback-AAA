"""
=============================================================================
                         CAPA DE CONTROLADORES
=============================================================================

Los controladores definen las rutas/endpoints de la API usando Blueprints.
Cada controlador se encarga de:
- Recibir la petición HTTP
- Extraer los datos del request
- Llamar al servicio correspondiente
- Retornar la respuesta JSON con el código de estado adecuado

Cada controller es un sub-blueprint que se registra en el blueprint
principal 'api', por lo que todas las rutas quedan bajo /api/...
"""

from .auth_controller import auth_bp
from .categories_controller import categories_bp
from .products_controller import product_bp
from .review_controller import review_bp
from .favorites_controller import favorite_bp
from .user_controller import user_bp
from .address_controller import address_bp
from .order_controller import order_bp
from .seller_controller import seller_bp
from .admin_controller import admin_bp
from .payment_controller import payment_bp
from .incident_controller import incident_bp



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
    api.register_blueprint(seller_bp)
    api.register_blueprint(admin_bp)
    api.register_blueprint(payment_bp)
    api.register_blueprint(incident_bp)

