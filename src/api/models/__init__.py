from flask_sqlalchemy import SQLAlchemy

# Inicializamos SQLAlchemy - esto crea la conexion con la base de datos
db = SQLAlchemy()

# Importamos todos los modelos para que esten disponibles desde el paquete
# IMPORTANTE: El orden de imports importa por las dependencias entre modelos
from api.models.user import User
from api.models.address import Address
from api.models.product import Product
from api.models.category import Category
from api.models.favorite import Favorite
from api.models.order import Order
from api.models.orderdetail import OrderDetail
from api.models.shipment import Shipment
from api.models.carrier import Carrier
from api.models.review import Review
from api.models.incident import Incident