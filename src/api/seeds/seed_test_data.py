"""
Seed de datos de prueba — usuarios, productos, pedidos, reviews y favoritos.
"""

import sys
import os
import random
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

from app import app
from api.models import db
from api.models.user import User
from api.models.product import Product
from api.models.item import Item
from api.models.order import Order, Payment, Status
from api.models.orderdetail import OrderDetail
from api.models.review import Review
from api.models.favorite import Favorite


# ─────────────────────────────────────────────
# DATOS DE PRUEBA
# ─────────────────────────────────────────────

USERS_DATA = [
    {"name": "Carlos",   "last_name": "García",    "email": "carlos@test.com",   "password": "Test1234!"},
    {"name": "María",    "last_name": "López",      "email": "maria@test.com",    "password": "Test1234!"},
    {"name": "Alejandro","last_name": "Martínez",   "email": "alex@test.com",     "password": "Test1234!"},
    {"name": "Lucía",    "last_name": "Sánchez",    "email": "lucia@test.com",    "password": "Test1234!"},
    {"name": "Pablo",    "last_name": "Fernández",  "email": "pablo@test.com",    "password": "Test1234!"},
]

PRODUCTS_DATA = [
    {"name": "NES Classic Edition",         "description": "Consola NES en perfecto estado con mando original.",         "price": 89.99,  "stock": 5,  "discount": 0.0,  "item_slug": "nes"},
    {"name": "SNES con Mario World",         "description": "Super Nintendo con cartucho de Super Mario World incluido.", "price": 120.00, "stock": 3,  "discount": 10.0, "item_slug": "snes"},
    {"name": "Game Boy Original DMG",        "description": "Game Boy original modelo DMG con carcasa gris.",             "price": 55.00,  "stock": 8,  "discount": 0.0,  "item_slug": "game-boy"},
    {"name": "Mega Drive II",                "description": "Mega Drive II con dos mandos y cable AV.",                   "price": 75.00,  "stock": 4,  "discount": 5.0,  "item_slug": "mega-drive"},
    {"name": "PlayStation 1 SCPH-1002",      "description": "PS1 PAL en buen estado con memory card.",                    "price": 65.00,  "stock": 6,  "discount": 0.0,  "item_slug": "ps1"},
    {"name": "Vinilo Led Zeppelin IV",       "description": "Led Zeppelin IV edición original 1971.",                     "price": 45.00,  "stock": 2,  "discount": 0.0,  "item_slug": "discos-de-vinilo"},
    {"name": "Casete Depeche Mode",          "description": "Casete Violator de Depeche Mode en buen estado.",            "price": 12.00,  "stock": 10, "discount": 20.0, "item_slug": "casetes"},
    {"name": "Cámara Analógica Olympus OM1", "description": "Cámara réflex analógica Olympus OM-1 con objetivo 50mm.",   "price": 150.00, "stock": 2,  "discount": 0.0,  "item_slug": "camaras-analogicas"},
    {"name": "Pokémon Edición Roja",         "description": "Cartucho original de Pokémon Rojo para Game Boy.",           "price": 35.00,  "stock": 7,  "discount": 0.0,  "item_slug": "juegos-game-boy"},
    {"name": "Figura Action He-Man",         "description": "Action figure He-Man original años 80 con espada.",          "price": 28.00,  "stock": 3,  "discount": 15.0, "item_slug": "action-figures-80s-90s"},
    {"name": "Walkman Sony WM-F10",          "description": "Walkman Sony con radio FM en buen estado de funcionamiento.","price": 40.00,  "stock": 5,  "discount": 0.0,  "item_slug": "walkman"},
    {"name": "Cartas Pokémon Base Set",      "description": "Lote de 20 cartas de la Base Set original de Pokémon.",     "price": 60.00,  "stock": 4,  "discount": 0.0,  "item_slug": "pokemon"},
]

REVIEWS_TITLES = [
    "Excelente producto",
    "Muy buen estado",
    "Tal como se describe",
    "Envío rápido y bien embalado",
    "Perfecto para coleccionistas",
    "Funciona perfectamente",
    "Buena relación calidad-precio",
    "Muy satisfecho con la compra",
]

REVIEWS_COMMENTS = [
    "Llegó en perfecto estado, exactamente como se describía. Muy recomendable.",
    "El producto estaba bien embalado y llegó rápido. Muy contento con la compra.",
    "Perfecto para mi colección. El vendedor fue muy atento y respondió todas mis dudas.",
    "Buen estado de conservación para su antigüedad. Funciona perfectamente.",
    "Lo recomiendo totalmente, es difícil encontrar estos artículos en tan buen estado.",
    "Relación calidad-precio inmejorable. Repetiría sin dudarlo.",
    "Superó mis expectativas. El envío fue rápido y el embalaje muy cuidado.",
]


# ─────────────────────────────────────────────
# FUNCIONES DE SEED
# ─────────────────────────────────────────────

def seed_users():
    """Crea los usuarios de prueba si no existen."""
    print("\n👤 Seeding usuarios...")
    users = []
    for u in USERS_DATA:
        existing = User.query.filter_by(email=u["email"]).first()
        if existing:
            print(f"  [UPDATE] Usuario ya existe: {u['email']}")
            users.append(existing)
        else:
            user = User(
                name=u["name"],
                last_name=u["last_name"],
                email=u["email"],
                is_active=True
            )
            user.set_password(u["password"])
            db.session.add(user)
            print(f"  [OK] Usuario creado: {u['email']}")
            users.append(user)
    db.session.flush()
    return users


def seed_products():
    """Crea los productos de prueba asociados a items existentes en la base de datos."""
    print("\n📦 Seeding productos...")
    products = []
    for p in PRODUCTS_DATA:
        existing = Product.query.filter_by(name=p["name"]).first()
        if existing:
            print(f"  [UPDATE] Producto ya existe: {p['name']}")
            products.append(existing)
            continue

        item = Item.query.filter_by(slug=p["item_slug"]).first()
        if not item:
            print(f"  [SKIP] Item no encontrado para slug '{p['item_slug']}' — ejecuta seed_categories primero")
            continue

        product = Product(
            name=p["name"],
            description=p["description"],
            price=p["price"],
            stock=p["stock"],
            discount=p["discount"],
            item_id=item.id,
            created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 180))
        )
        db.session.add(product)
        print(f"  [OK] Producto creado: {p['name']}")
        products.append(product)
    db.session.flush()
    return products


def seed_orders(users, products):
    """
    Crea pedidos de prueba con todos los estados posibles.
    Cada usuario tiene varios pedidos con distintos estados.
    """
    print("\n🛒 Seeding pedidos...")
    orders = []
    payment_methods = list(Payment)
    statuses = list(Status)

    for user in users:
        # Cada usuario tiene entre 2 y 4 pedidos
        for _ in range(random.randint(2, 4)):
            # Selecciona entre 1 y 3 productos aleatorios para el pedido
            order_products = random.sample(products, random.randint(1, 3))
            subtotal = sum(p.price for p in order_products)
            tax = round(subtotal * 0.21, 2)
            shipping_cost = round(random.uniform(3.5, 9.99), 2)
            total_price = round(subtotal + tax + shipping_cost, 2)

            order = Order(
                user_id=user.id,
                subtotal=subtotal,
                tax=tax,
                shipping_cost=shipping_cost,
                total_price=total_price,
                payment_method=random.choice(payment_methods),
                status=random.choice(statuses),
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 90))
            )
            db.session.add(order)
            db.session.flush()

            # Crea el detalle del pedido para cada producto
            for product in order_products:
                quantity = random.randint(1, 3)
                detail = OrderDetail(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=quantity
                )
                db.session.add(detail)

            print(f"  [OK] Pedido creado — Usuario: {user.email} | Estado: {order.status.value} | Total: {total_price}€")
            orders.append(order)

    db.session.flush()
    return orders


def seed_reviews(users, products, orders):
    """
    Crea reviews de prueba. Solo se crean reviews para pedidos entregados (delivered).
    Cada review está vinculada a un usuario, producto y pedido.
    """
    print("\n⭐ Seeding reviews...")
    delivered_orders = [o for o in orders if o.status == Status.delivered]

    for order in delivered_orders:
        # Revisa qué productos tiene este pedido
        for detail in order.order_details:
            # 70% de probabilidad de dejar review
            if random.random() > 0.3:
                existing = Review.query.filter_by(
                    user_id=order.user_id,
                    product_id=detail.product_id,
                    order_id=order.id
                ).first()
                if existing:
                    print(f"  [UPDATE] Review ya existe para producto {detail.product_id}")
                    continue

                review = Review(
                    user_id=order.user_id,
                    product_id=detail.product_id,
                    order_id=order.id,
                    rating=random.randint(3, 5),
                    title=random.choice(REVIEWS_TITLES),
                    comment=random.choice(REVIEWS_COMMENTS),
                    is_visible=True,
                    created_at=order.created_at + timedelta(days=random.randint(1, 10))
                )
                db.session.add(review)
                print(f"  [OK] Review creada — Producto: {detail.product_id} | Rating: {review.rating}/5")

    db.session.flush()


def seed_favorites(users, products):
    """Crea favoritos aleatorios para cada usuario."""
    print("\n❤️  Seeding favoritos...")
    for user in users:
        # Cada usuario tiene entre 2 y 5 favoritos aleatorios
        favorite_products = random.sample(products, random.randint(2, min(5, len(products))))
        for product in favorite_products:
            existing = Favorite.query.filter_by(
                user_id=user.id,
                product_id=product.id
            ).first()
            if existing:
                print(f"  [UPDATE] Favorito ya existe — Usuario: {user.email} | Producto: {product.name}")
                continue

            favorite = Favorite(
                user_id=user.id,
                product_id=product.id
            )
            db.session.add(favorite)
            print(f"  [OK] Favorito creado — Usuario: {user.email} | Producto: {product.name}")

    db.session.flush()


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────

if __name__ == "__main__":
    with app.app_context():
        print("🌱 Iniciando seed de datos de prueba...\n")
        try:
            users = seed_users()
            products = seed_products()

            if not products:
                print("\n⚠️  No hay productos — ejecuta seed_categories.py primero y vuelve a intentarlo.")
                sys.exit(1)

            orders = seed_orders(users, products)
            seed_reviews(users, products, orders)
            seed_favorites(users, products)

            db.session.commit()
            print("\n✅ Seed completado con éxito.")
            print("\n📋 Credenciales de prueba:")
            for u in USERS_DATA:
                print(f"   {u['email']} / {u['password']}")

        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Error durante el seed: {str(e)}")
            raise