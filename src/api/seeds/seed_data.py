"""
seed_data.py — Seed completo de datos de prueba.

Cubre TODOS los items del árbol de categorías con al menos 1 producto.
Incluye condiciones variadas, descuentos, stock bajo, pedidos en todos los
estados, reviews realistas y favoritos aleatorios.

Uso:
    pipenv run python src/api/seeds/seed_data.py
    pipenv run python src/api/seeds/seed_data.py --reset   (borra todos los datos antes de insertar)
"""

import sys
import os
import random
import argparse
from datetime import datetime, timezone, timedelta
from sqlalchemy import cast, String

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

from app import app
from api.models import db
from api.models.user import User, RoleName
from api.models.seller import Seller, SellerStatus
from api.models.product import Product
from api.models.item import Item
from api.models.order import Order, Payment, Status
from api.models.orderdetail import OrderDetail
from api.models.review import Review
from api.models.favorite import Favorite


# ══════════════════════════════════════════════════════════════════════════════
# USUARIOS
# role: "buyer" | "seller" | "admin"
# ══════════════════════════════════════════════════════════════════════════════

USERS_DATA = [
    {"name": "PlayBack",  "last_name": "Admin",     "email": "admin@playback.com",              "password": "Admin!",    "role": "admin",    "image_url": "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png"},
    {"name": "PlayBack",  "last_name": "Seller",    "email": "seller@playback.com",             "password": "Seller!",   "role": "seller",   "image_url": "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png"},

    {"name": "Carlos",    "last_name": "García",    "email": "carlos@test.com",                 "password": "Test1234!", "role": "seller",   "image_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Carlos+Garcia"},
    {"name": "María",     "last_name": "López",     "email": "maria@test.com",                  "password": "Test1234!", "role": "seller",   "image_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Maria+Lopez"},
    {"name": "Alejandro", "last_name": "Martínez",  "email": "alex@test.com",                   "password": "Test1234!", "role": "seller",   "image_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Alex+Martínez"},
    {"name": "Arantxa",   "last_name": "Ordoyo",    "email": "pro.arantxa.ordoyo@gmail.com",    "password": "123456",    "role": "seller",   "image_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Arantxa+Ordoyo"},

    {"name": "Lucía",     "last_name": "Sánchez",   "email": "lucia@test.com",                  "password": "Test1234!", "role": "buyer",    "image_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Lucía+Sánchez"},
    {"name": "Pablo",     "last_name": "Fernández", "email": "pablo@test.com",                  "password": "Test1234!", "role": "buyer",    "image_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Pablo+Fernández"},
    {"name": "Elena",     "last_name": "Ruiz",      "email": "elena@test.com",                  "password": "Test1234!", "role": "buyer",    "image_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Elena+Ruiz"},
    {"name": "Javier",    "last_name": "Moreno",    "email": "javier@test.com",                 "password": "Test1234!", "role": "buyer",    "image_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Javier+Moreno"},
    {"name": "Ana",       "last_name": "Jiménez",   "email": "ana@test.com",                    "password": "Test1234!", "role": "buyer",    "image_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Ana+Jimenez"},
]


# ══════════════════════════════════════════════════════════════════════════════
# SELLERS
# Un registro por cada usuario con role="seller"
# ══════════════════════════════════════════════════════════════════════════════

SELLERS_DATA = [
    {
        "email": "seller@playback.com",
        "store_name": "Playback",
        "description": "Productos revisados, certificados y con garantía.",
        "logo_url": "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png",
        "phone": "+34 666 000 666",
        "nif_cif": "12345678Z",
        "origin_address": "Calle Sin Nombre",
        "origin_city": "Madrid",
        "origin_zip": "28001",
        "origin_country": "España",
        "status": "verified",
        "stripe_account_id": "acct_1T8kLqC8PDf7HCsD",
				"stripe_onboarding_completed": True,
    },
    {
        "email": "carlos@test.com",
        "store_name": "RetroConsolas García",
        "description": "Especialista en consolas Nintendo y accesorios retro de los 80 y 90.",
        "logo_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=RetroConsolas+García",
        "phone": "+34 612 345 678",
        "nif_cif": "12345678A",
        "origin_address": "Calle Mayor 12",
        "origin_city": "Madrid",
        "origin_zip": "28001",
        "origin_country": "España",
        "status": "verified",
        "stripe_account_id": "acct_1T999pFipMSWCWoO",
				"stripe_onboarding_completed": True,
    },
    {
        "email": "maria@test.com",
        "store_name": "VinylParadise",
        "description": "Colección de vinilos y música retro de los 60, 70 y 80. Envío cuidadoso garantizado.",
        "logo_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=VinylParadise",
        "phone": "+34 623 456 789",
        "nif_cif": "23456789B",
        "origin_address": "Passeig de Gràcia 55",
        "origin_city": "Barcelona",
        "origin_zip": "08007",
        "origin_country": "España",
        "status": "verified",
        "stripe_account_id": "acct_1T9rmyFv1VkR1kmz",
				"stripe_onboarding_completed": True,
    },
    {
        "email": "alex@test.com",
        "store_name": "Bits & Pixels",
        "description": "Videojuegos retro en cartucho y CD. Especializados en Sega y PlayStation clásica.",
        "logo_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Bits+&+Pixels",
        "phone": "+34 634 567 890",
        "nif_cif": "34567890C",
        "origin_address": "Gran Vía 10",
        "origin_city": "Valencia",
        "origin_zip": "46002",
        "origin_country": "España",
        "status": "pending",
        "stripe_account_id": "acct_1T9rsRC9ziS9X0PW",
				"stripe_onboarding_completed": True,
    },
    {
        "email": "pro.arantxa.ordoyo@gmail.com",
        "store_name": "ArantxaTienda",
        "description": "Tienda oficial de PlayBack.",
        "phone": "+34 600 000 000",
        "nif_cif": "99999999Z",
        "origin_address": "Calle Test 1",
        "origin_city": "Madrid",
        "origin_zip": "28001",
        "origin_country": "España",
        "status": "verified",
        "stripe_account_id": "acct_1TAKZrFsAabo2lvo",
				"stripe_onboarding_completed": True,
    },
]


# ══════════════════════════════════════════════════════════════════════════════
# PRODUCTOS
# Campos: name, name_en, description, description_en, price, stock,
#         discount, condition, item_slug, image_url, seller_email
# condition: "new" | "used" | "refurbished" | "broken"
# seller_email: email del vendedor al que pertenece el producto
# ══════════════════════════════════════════════════════════════════════════════

PRODUCTS_DATA = [

    # ── PRODUCTOS DE ARANTXA ──────────────────────────────────────────────────
    {
        "name": "NES Arantxa Classic",
        "name_en": "Arantxa Classic NES",
        "description": "NES en perfecto estado con mando.",
        "description_en": "NES in perfect condition with controller.",
        "price": 79.99,
        "stock": 3,
        "discount": 0.0,
        "condition": "used",
        "item_slug": "nes",
        "image_url": "https://m.media-amazon.com/images/I/71YTum90-lL.jpg",
        "seller_email": "pro.arantxa.ordoyo@gmail.com"},
    {
        "name": "Vinilo Arantxa Led Zeppelin IV",
        "name_en": "Arantxa Led Zeppelin IV Vinyl",
        "description": "Led Zeppelin IV edición original.",
        "description_en": "Led Zeppelin IV original edition.",
        "price": 42.00,
        "stock": 2,
        "discount": 10.0,
        "condition": "used",
        "item_slug": "discos-de-vinilo",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2019/10/Led-Zeppelin-1200x1200.png",
        "seller_email": "pro.arantxa.ordoyo@gmail.com"},
    {
        "name": "Game Boy Arantxa DMG", "name_en": "Arantxa Game Boy DMG", "description": "Game Boy original DMG funcionando.", "description_en": "Working original DMG Game Boy.", "price": 52.00, "stock": 4, "discount": 0.0,
        "condition": "used", "item_slug": "game-boy", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Game-Boy-FL.png/1280px-Game-Boy-FL.png", "seller_email": "pro.arantxa.ordoyo@gmail.com"},
    {
        "name": "Nokia 3310 Arantxa", "name_en": "Arantxa Nokia 3310", "description": "Nokia 3310 azul con batería nueva.", "description_en": "Blue Nokia 3310 with new battery.", "price": 32.00, "stock": 5,
        "discount": 0.0, "condition": "used", "item_slug": "moviles-antiguos", "image_url": "https://vintagemobile.fr/cdn/shop/files/Nokia-3310-Vintage-Mobile-777.jpg", "seller_email": "pro.arantxa.ordoyo@gmail.com"},
    {
        "name": "Walkman Sony Arantxa", "name_en": "Arantxa Sony Walkman", "description": "Walkman Sony con radio FM.", "description_en": "Sony Walkman with FM radio.", "price": 38.00, "stock": 3, "discount": 5.0,
        "condition": "used", "item_slug": "walkman", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_UePqDF2twZgFm7ZVbr8sHs39o4Jjx22Ag&s", "seller_email": "pro.arantxa.ordoyo@gmail.com"
    },
    
    # ── CONSOLAS › Nintendo Clásica ── nes ─────────────────────────────────────
    {
        "name": "NES Classic Edition",
        "name_en": "NES Classic Edition",
        "description": "NES en perfecto estado con mando original y cables.",
        "description_en": "NES in perfect condition with original controller and cables.",
        "price": 89.99, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "nes",
        "image_url": "https://m.media-amazon.com/images/I/71YTum90-lL.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "NES con 10 juegos",
        "name_en": "NES with 10 games",
        "description": "Pack NES con 10 cartuchos en buen estado.",
        "description_en": "NES bundle with 10 cartridges in good condition.",
        "price": 140.00, "stock": 2, "discount": 10.0, "condition": "used",
        "item_slug": "nes",
        "image_url": "https://m.media-amazon.com/images/I/71YTum90-lL.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── snes ───────────────────────────────────────────────────────────────────
    {
        "name": "SNES con Super Mario World",
        "name_en": "SNES with Super Mario World",
        "description": "Super Nintendo con cartucho de Super Mario World incluido.",
        "description_en": "Super Nintendo with Super Mario World cartridge included.",
        "price": 120.00, "stock": 3, "discount": 10.0, "condition": "used",
        "item_slug": "snes",
        "image_url": "https://m.media-amazon.com/images/I/51JgQtlGh8L._AC_UF894,1000_QL80_.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "SNES Reacondicionada",
        "name_en": "SNES Refurbished",
        "description": "SNES revisada y limpiada, funciona como nueva.",
        "description_en": "SNES serviced and cleaned, works like new.",
        "price": 95.00, "stock": 4, "discount": 0.0, "condition": "refurbished",
        "item_slug": "snes",
        "image_url": "https://m.media-amazon.com/images/I/51JgQtlGh8L._AC_UF894,1000_QL80_.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── nintendo-64 ────────────────────────────────────────────────────────────
    {
        "name": "Nintendo 64 Gris",
        "name_en": "Nintendo 64 Grey",
        "description": "N64 con mando y cables originales.",
        "description_en": "N64 with original controller and cables.",
        "price": 110.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "nintendo-64",
        "image_url": "https://i.blogs.es/bfd715/n64/450_1000.png",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Nintendo 64 con Expansion Pak",
        "name_en": "Nintendo 64 with Expansion Pak",
        "description": "N64 con Expansion Pak y mando, lista para Majora's Mask.",
        "description_en": "N64 with Expansion Pak and controller, ready for Majora's Mask.",
        "price": 135.00, "stock": 2, "discount": 5.0, "condition": "used",
        "item_slug": "nintendo-64",
        "image_url": "https://i.blogs.es/bfd715/n64/450_1000.png",
        "seller_email": "carlos@test.com",
    },

    # ── gamecube ───────────────────────────────────────────────────────────────
    {
        "name": "GameCube Plateada",
        "name_en": "Silver GameCube",
        "description": "GameCube en color plateado con mando morado.",
        "description_en": "Silver GameCube with purple controller.",
        "price": 130.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "gamecube",
        "image_url": "https://media2.gameplaystores.es/74876-large_default/gamecube-plateada-mando-sin-caja-gc.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "GameCube Negra con Lector Roto",
        "name_en": "Black GameCube Broken Reader",
        "description": "GameCube negra, el lector no lee discos. Ideal para piezas.",
        "description_en": "Black GameCube, disc reader not working. For parts.",
        "price": 25.00, "stock": 1, "discount": 0.0, "condition": "broken",
        "item_slug": "gamecube",
        "image_url": "https://media2.gameplaystores.es/74876-large_default/gamecube-plateada-mando-sin-caja-gc.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── game-boy ───────────────────────────────────────────────────────────────
    {
        "name": "Game Boy Original DMG",
        "name_en": "Original Game Boy DMG",
        "description": "Game Boy original modelo DMG con carcasa gris.",
        "description_en": "Original Game Boy DMG model with grey shell.",
        "price": 55.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "game-boy",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Game-Boy-FL.png/1280px-Game-Boy-FL.png",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Game Boy Color Morada",
        "name_en": "Purple Game Boy Color",
        "description": "Game Boy Color en morado translúcido, estado impecable.",
        "description_en": "Translucent purple Game Boy Color, impeccable condition.",
        "price": 70.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "game-boy",
        "image_url": "https://www.todoconsolas.com/344840-large_default/game_boy_color_violeta_po215947.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── game-boy-advance ───────────────────────────────────────────────────────
    {
        "name": "Game Boy Advance SP Azul",
        "name_en": "Blue Game Boy Advance SP",
        "description": "GBA SP con pantalla retroiluminada y cargador original.",
        "description_en": "GBA SP with backlit screen and original charger.",
        "price": 95.00, "stock": 3, "discount": 5.0, "condition": "used",
        "item_slug": "game-boy-advance",
        "image_url": "https://m.media-amazon.com/images/I/61hNR9cWhZL.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Game Boy Advance Transparente",
        "name_en": "Transparent Game Boy Advance",
        "description": "GBA carcasa transparente reacondicionada.",
        "description_en": "Refurbished GBA with transparent shell.",
        "price": 60.00, "stock": 2, "discount": 0.0, "condition": "refurbished",
        "item_slug": "game-boy-advance",
        "image_url": "https://m.media-amazon.com/images/I/61hNR9cWhZL.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── accesorios ────────────────────────────────────────────────────────────
    {
        "name": "Mando NES Original",
        "name_en": "Original NES Controller",
        "description": "Mando NES original en buen estado de funcionamiento.",
        "description_en": "Original NES controller in good working condition.",
        "price": 12.00, "stock": 10, "discount": 0.0, "condition": "used",
        "item_slug": "accesorios",
        "image_url": "https://m.media-amazon.com/images/I/71YTum90-lL.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Pack Mandos SNES x2",
        "name_en": "SNES Controller Pack x2",
        "description": "Dos mandos originales de SNES en perfecto estado.",
        "description_en": "Two original SNES controllers in perfect condition.",
        "price": 20.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "accesorios",
        "image_url": "https://m.media-amazon.com/images/I/71YTum90-lL.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── otros-nintendo-clasica ─────────────────────────────────────────────────
    {
        "name": "Virtual Boy con Stand",
        "name_en": "Virtual Boy with Stand",
        "description": "Virtual Boy de Nintendo con stand y mando original.",
        "description_en": "Nintendo Virtual Boy with stand and original controller.",
        "price": 180.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-nintendo-clasica",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Game-Boy-FL.png/1280px-Game-Boy-FL.png",
        "seller_email": "carlos@test.com",
    },

    # ── CONSOLAS › SEGA ───────────────────────────────────────────────────────
    {
        "name": "Sega Master System II",
        "name_en": "Sega Master System II",
        "description": "Master System II con Alex Kidd integrado.",
        "description_en": "Master System II with built-in Alex Kidd.",
        "price": 60.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "master-system",
        "image_url": "https://m.media-amazon.com/images/I/71-4crm7mML.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mega Drive II",
        "name_en": "Mega Drive II",
        "description": "Mega Drive II con dos mandos y cable AV.",
        "description_en": "Mega Drive II with two controllers and AV cable.",
        "price": 75.00, "stock": 4, "discount": 5.0, "condition": "used",
        "item_slug": "mega-drive",
        "image_url": "https://m.media-amazon.com/images/I/71-4crm7mML.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mega Drive Sin Cables (Piezas)",
        "name_en": "Mega Drive No Cables (Parts)",
        "description": "Mega Drive primera versión sin cables ni mandos. Para piezas.",
        "description_en": "First version Mega Drive, no cables or controllers. For parts.",
        "price": 20.00, "stock": 2, "discount": 0.0, "condition": "broken",
        "item_slug": "mega-drive",
        "image_url": "https://m.media-amazon.com/images/I/71-4crm7mML.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Sega Saturn Gris",
        "name_en": "Grey Sega Saturn",
        "description": "Sega Saturn con mando y fuente de alimentación original.",
        "description_en": "Sega Saturn with original controller and power supply.",
        "price": 120.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "saturn",
        "image_url": "https://m.media-amazon.com/images/I/71-4crm7mML.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Sega Dreamcast",
        "name_en": "Sega Dreamcast",
        "description": "Dreamcast con VMU y mando original, funciona perfectamente.",
        "description_en": "Dreamcast with VMU and original controller, works perfectly.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "dreamcast",
        "image_url": "https://i.blogs.es/5ad1a1/dreamcast_01/650_1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Sega Game Gear Roja",
        "name_en": "Red Sega Game Gear",
        "description": "Game Gear en rojo con pantalla en perfecto estado.",
        "description_en": "Red Game Gear with screen in perfect condition.",
        "price": 65.00, "stock": 3, "discount": 10.0, "condition": "used",
        "item_slug": "game-gear",
        "image_url": "https://www.japanzon.com/24351-product_hd/sega-game-gear-micro-rojo.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Game Gear Reacondicionada",
        "name_en": "Refurbished Game Gear",
        "description": "Game Gear revisada con condensadores nuevos.",
        "description_en": "Game Gear with new capacitors, perfect screen.",
        "price": 85.00, "stock": 2, "discount": 0.0, "condition": "refurbished",
        "item_slug": "game-gear",
        "image_url": "https://www.japanzon.com/24351-product_hd/sega-game-gear-micro-rojo.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Sega Pico (Consola Infantil)",
        "name_en": "Sega Pico (Kids Console)",
        "description": "Sega Pico, la consola educativa de Sega para niños.",
        "description_en": "Sega Pico, the educational console for kids.",
        "price": 40.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "otros-sega",
        "image_url": "https://i.blogs.es/5ad1a1/dreamcast_01/650_1200.jpg",
        "seller_email": "alex@test.com",
    },

    # ── CONSOLAS › PlayStation y Xbox ─────────────────────────────────────────
    {
        "name": "PlayStation 1 PAL",
        "name_en": "PlayStation 1 PAL",
        "description": "PS1 PAL en buen estado con memory card original.",
        "description_en": "PAL PS1 in good condition with original memory card.",
        "price": 65.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "ps1",
        "image_url": "https://m.media-amazon.com/images/I/71TCoWMwK+L.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "PlayStation 1 Reacondicionada",
        "name_en": "Refurbished PlayStation 1",
        "description": "PS1 revisada, lector limpiado y testado, garantía 3 meses.",
        "description_en": "Serviced PS1, cleaned and tested reader, 3-month warranty.",
        "price": 80.00, "stock": 3, "discount": 0.0, "condition": "refurbished",
        "item_slug": "ps1",
        "image_url": "https://m.media-amazon.com/images/I/71TCoWMwK+L.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "PlayStation 2 Slim Negra",
        "name_en": "Black PlayStation 2 Slim",
        "description": "PS2 Slim en negro con dos mandos DualShock 2.",
        "description_en": "Black PS2 Slim with two DualShock 2 controllers.",
        "price": 85.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "ps2",
        "image_url": "https://d2e6ccujb3mkqf.cloudfront.net/2eb54452-73ab-4cc2-83ce-dece99b9a1f9-1_959ca981-d879-41b7-807e-204efb73d96d.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "PSP 3000 Blanca",
        "name_en": "White PSP 3000",
        "description": "PSP 3000 en blanco con funda y cargador.",
        "description_en": "White PSP 3000 with case and charger.",
        "price": 80.00, "stock": 5, "discount": 5.0, "condition": "used",
        "item_slug": "psp",
        "image_url": "https://m.media-amazon.com/images/I/51CbBOgUaGL.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "PSP sin Pantalla (Piezas)",
        "name_en": "PSP No Screen (Parts)",
        "description": "PSP 2000 con pantalla rota, resto funciona.",
        "description_en": "PSP 2000 with broken screen, rest works. For parts.",
        "price": 15.00, "stock": 2, "discount": 0.0, "condition": "broken",
        "item_slug": "psp",
        "image_url": "https://m.media-amazon.com/images/I/51CbBOgUaGL.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Xbox Clásica Negra",
        "name_en": "Classic Black Xbox",
        "description": "Xbox original con mando Duke y cables.",
        "description_en": "Original Xbox with Duke controller and cables.",
        "price": 70.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "xbox",
        "image_url": "https://i.blogs.es/f65b01/xbox-original/650_1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mando DualShock 2 Azul",
        "name_en": "Blue DualShock 2 Controller",
        "description": "Mando DualShock 2 en color azul para PS2.",
        "description_en": "Blue DualShock 2 controller for PS2.",
        "price": 18.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "otros-playstation-xbox",
        "image_url": "https://m.media-amazon.com/images/I/71TCoWMwK+L.jpg",
        "seller_email": "alex@test.com",
    },

    # ── CONSOLAS › Otras Consolas ──────────────────────────────────────────────
    {
        "name": "Atari 2600",
        "name_en": "Atari 2600",
        "description": "Atari 2600 con joystick original y 5 cartuchos.",
        "description_en": "Atari 2600 with original joystick and 5 cartridges.",
        "price": 85.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "atari",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Atari-2600-Wood-4Sw-Set.jpg/1024px-Atari-2600-Wood-4Sw-Set.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Neo Geo Pocket Color",
        "name_en": "Neo Geo Pocket Color",
        "description": "Neo Geo Pocket Color en estado excelente con 3 juegos.",
        "description_en": "Neo Geo Pocket Color in excellent condition with 3 games.",
        "price": 150.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "neo-geo",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Atari-2600-Wood-4Sw-Set.jpg/1024px-Atari-2600-Wood-4Sw-Set.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "NEC PC Engine",
        "name_en": "NEC PC Engine",
        "description": "PC Engine con Hu-Card de PC Denjin.",
        "description_en": "PC Engine with PC Denjin Hu-Card.",
        "price": 130.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "pc-engine",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Atari-2600-Wood-4Sw-Set.jpg/1024px-Atari-2600-Wood-4Sw-Set.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Commodore 64 con Datasette",
        "name_en": "Commodore 64 with Datasette",
        "description": "C64 con datasette y joystick, funciona perfectamente.",
        "description_en": "C64 with datasette and joystick, works perfectly.",
        "price": 120.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "commodore-64",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Commodore64.jpg/1024px-Commodore64.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Amstrad CPC 464",
        "name_en": "Amstrad CPC 464",
        "description": "Amstrad CPC 464 con monitor color y datasette integrado.",
        "description_en": "Amstrad CPC 464 with color monitor and built-in datasette.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "amstrad",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Amstrad_CPC464.jpg/1024px-Amstrad_CPC464.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Magnavox Odyssey",
        "name_en": "Magnavox Odyssey",
        "description": "La primera consola doméstica de la historia.",
        "description_en": "The first home console in history.",
        "price": 200.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-otras-consolas",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Atari-2600-Wood-4Sw-Set.jpg/1024px-Atari-2600-Wood-4Sw-Set.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── VIDEOJUEGOS › Cartucho ─────────────────────────────────────────────────
    {
        "name": "Super Mario Bros 3 NES",
        "name_en": "Super Mario Bros 3 NES",
        "description": "Cartucho original Super Mario Bros 3 para NES.",
        "description_en": "Original Super Mario Bros 3 NES cartridge.",
        "price": 45.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-nes",
        "image_url": "https://www.todoconsolas.com/308618-medium_default/super_mario_bros_3_nes_sp_po8443.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mega Man 2 NES",
        "name_en": "Mega Man 2 NES",
        "description": "Mega Man 2 cartucho PAL para NES, muy buen estado.",
        "description_en": "Mega Man 2 PAL cartridge for NES, very good condition.",
        "price": 38.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-nes",
        "image_url": "https://www.todoconsolas.com/308618-medium_default/super_mario_bros_3_nes_sp_po8443.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Zelda A Link to the Past SNES",
        "name_en": "Zelda A Link to the Past SNES",
        "description": "The Legend of Zelda A Link to the Past cartucho PAL.",
        "description_en": "The Legend of Zelda A Link to the Past PAL cartridge.",
        "price": 55.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-snes",
        "image_url": "https://cdn11.bigcommerce.com/s-ymgqt/images/stencil/1000w/products/26452/33322/Legend-of-Zelda-A-Link-To-t__89317.1712937460.jpg?c=2",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Donkey Kong Country SNES",
        "name_en": "Donkey Kong Country SNES",
        "description": "Donkey Kong Country cartucho PAL SNES, estado muy bueno.",
        "description_en": "Donkey Kong Country PAL SNES cartridge, very good condition.",
        "price": 35.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-snes",
        "image_url": "https://cdn11.bigcommerce.com/s-ymgqt/images/stencil/1000w/products/26452/33322/Legend-of-Zelda-A-Link-To-t__89317.1712937460.jpg?c=2",
        "seller_email": "alex@test.com",
    },
    {
        "name": "GoldenEye 007 N64",
        "name_en": "GoldenEye 007 N64",
        "description": "GoldenEye 007 cartucho original para Nintendo 64.",
        "description_en": "GoldenEye 007 original cartridge for Nintendo 64.",
        "price": 50.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-nintendo-64",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPo0fYRIsSTEYir_VND0m40qs6Oc2kdggSDg&s",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Super Mario 64",
        "name_en": "Super Mario 64",
        "description": "Super Mario 64 cartucho original PAL N64.",
        "description_en": "Super Mario 64 original PAL N64 cartridge.",
        "price": 45.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-nintendo-64",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPo0fYRIsSTEYir_VND0m40qs6Oc2kdggSDg&s",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Sonic the Hedgehog Mega Drive",
        "name_en": "Sonic the Hedgehog Mega Drive",
        "description": "Sonic 1 cartucho original para Mega Drive, completo con caja.",
        "description_en": "Sonic 1 original cartridge for Mega Drive, complete with box.",
        "price": 40.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-mega-drive",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROg9k-9v7OYh9H9bwlun7oh7n9pyqI_bcq9Q&s",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Streets of Rage 2 Mega Drive",
        "name_en": "Streets of Rage 2 Mega Drive",
        "description": "Streets of Rage 2 cartucho Mega Drive PAL, buen estado.",
        "description_en": "Streets of Rage 2 Mega Drive PAL cartridge, good condition.",
        "price": 35.00, "stock": 3, "discount": 15.0, "condition": "used",
        "item_slug": "juegos-mega-drive",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROg9k-9v7OYh9H9bwlun7oh7n9pyqI_bcq9Q&s",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Pokémon Edición Roja",
        "name_en": "Pokémon Red Edition",
        "description": "Cartucho original de Pokémon Rojo para Game Boy.",
        "description_en": "Original Pokémon Red cartridge for Game Boy.",
        "price": 35.00, "stock": 7, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-game-boy",
        "image_url": "https://media2.gameplaystores.es/77648-large_default/pokemon-rojo-cartucho-gb.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Pokémon Edición Azul",
        "name_en": "Pokémon Blue Edition",
        "description": "Cartucho original Pokémon Azul Game Boy, batería funcional.",
        "description_en": "Original Pokémon Blue Game Boy cartridge, working battery.",
        "price": 33.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-game-boy",
        "image_url": "https://media2.gameplaystores.es/77646-large_default/pokemon-azul-cartucho-gb.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Tetris Game Boy",
        "name_en": "Tetris Game Boy",
        "description": "Tetris original para Game Boy, el clásico de los clásicos.",
        "description_en": "Original Tetris for Game Boy.",
        "price": 15.00, "stock": 10, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-game-boy",
        "image_url": "https://media2.gameplaystores.es/77648-large_default/pokemon-rojo-cartucho-gb.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Lote 20 Cartuchos Variados",
        "name_en": "Lot of 20 Mixed Cartridges",
        "description": "Lote de 20 cartuchos para diferentes consolas.",
        "description_en": "Lot of 20 cartridges for various consoles.",
        "price": 60.00, "stock": 2, "discount": 20.0, "condition": "used",
        "item_slug": "otros-cartucho",
        "image_url": "https://www.todoconsolas.com/308618-medium_default/super_mario_bros_3_nes_sp_po8443.jpg",
        "seller_email": "alex@test.com",
    },

    # ── VIDEOJUEGOS › CD/DVD ───────────────────────────────────────────────────
    {
        "name": "Final Fantasy VII PS1",
        "name_en": "Final Fantasy VII PS1",
        "description": "Final Fantasy VII PAL completo con caja y manual.",
        "description_en": "Final Fantasy VII PAL complete with box and manual.",
        "price": 75.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-ps1",
        "image_url": "https://i.etsystatic.com/20685833/r/il/d09585/5220865797/il_fullxfull.5220865797_qg92.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Metal Gear Solid PS1",
        "name_en": "Metal Gear Solid PS1",
        "description": "Metal Gear Solid PAL PS1, completo con caja.",
        "description_en": "Metal Gear Solid PAL PS1, complete with box.",
        "price": 45.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-ps1",
        "image_url": "https://i.etsystatic.com/20685833/r/il/d09585/5220865797/il_fullxfull.5220865797_qg92.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "GTA San Andreas PS2",
        "name_en": "GTA San Andreas PS2",
        "description": "Grand Theft Auto San Andreas para PS2, completo.",
        "description_en": "Grand Theft Auto San Andreas for PS2, complete.",
        "price": 25.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-ps2",
        "image_url": "https://media.game.es/COVERV2/3D_L/049/049906.png",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Shadow of the Colossus PS2",
        "name_en": "Shadow of the Colossus PS2",
        "description": "Shadow of the Colossus PS2 PAL completo.",
        "description_en": "Shadow of the Colossus PS2 PAL complete.",
        "price": 35.00, "stock": 3, "discount": 10.0, "condition": "used",
        "item_slug": "juegos-ps2",
        "image_url": "https://media.game.es/COVERV2/3D_L/049/049906.png",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Shenmue Dreamcast",
        "name_en": "Shenmue Dreamcast",
        "description": "Shenmue para Dreamcast, edición PAL completa con caja.",
        "description_en": "Shenmue for Dreamcast, complete PAL edition with box.",
        "price": 60.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-dreamcast",
        "image_url": "https://media.vandal.net/m/31/shenmue-201961215304614_1.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Soul Calibur Dreamcast",
        "name_en": "Soul Calibur Dreamcast",
        "description": "Soul Calibur para Dreamcast, estado impecable.",
        "description_en": "Soul Calibur for Dreamcast, impeccable condition.",
        "price": 30.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-dreamcast",
        "image_url": "https://media.vandal.net/m/31/shenmue-201961215304614_1.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Panzer Dragoon Saga Saturn",
        "name_en": "Panzer Dragoon Saga Saturn",
        "description": "Panzer Dragoon Saga para Sega Saturn, joya rara PAL.",
        "description_en": "Panzer Dragoon Saga for Sega Saturn, rare PAL gem.",
        "price": 200.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-saturn",
        "image_url": "https://media.vandal.net/m/31/shenmue-201961215304614_1.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Half-Life PC CD-ROM",
        "name_en": "Half-Life PC CD-ROM",
        "description": "Half-Life para PC en caja original con manual.",
        "description_en": "Half-Life for PC in original box with manual.",
        "price": 20.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-pc",
        "image_url": "https://media.vandal.net/m/31/shenmue-201961215304614_1.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Diablo II PC",
        "name_en": "Diablo II PC",
        "description": "Diablo II PC completo con Lord of Destruction.",
        "description_en": "Diablo II PC complete with Lord of Destruction.",
        "price": 25.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-pc",
        "image_url": "https://media.vandal.net/m/31/shenmue-201961215304614_1.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Lote 10 Juegos PS1 Variados",
        "name_en": "Lot of 10 Mixed PS1 Games",
        "description": "Lote de 10 juegos de PS1 en buen estado.",
        "description_en": "Lot of 10 PS1 games in good condition.",
        "price": 40.00, "stock": 3, "discount": 15.0, "condition": "used",
        "item_slug": "otros-cd-dvd",
        "image_url": "https://i.etsystatic.com/20685833/r/il/d09585/5220865797/il_fullxfull.5220865797_qg92.jpg",
        "seller_email": "alex@test.com",
    },

    # ── VIDEOJUEGOS › Ediciones Especiales ────────────────────────────────────
    {
        "name": "Zelda Ocarina of Time Collector's",
        "name_en": "Zelda Ocarina of Time Collector's",
        "description": "Zelda OoT Collector's Edition N64 precintada.",
        "description_en": "Zelda OoT Collector's Edition N64 sealed.",
        "price": 300.00, "stock": 1, "discount": 0.0, "condition": "new",
        "item_slug": "collectors-edition",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPo0fYRIsSTEYir_VND0m40qs6Oc2kdggSDg&s",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Metal Gear Solid 3 Steelbook",
        "name_en": "Metal Gear Solid 3 Steelbook",
        "description": "MGS3 Snake Eater Steelbook PS2, edición europea.",
        "description_en": "MGS3 Snake Eater Steelbook PS2, European edition.",
        "price": 85.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "steelbook",
        "image_url": "https://media.vandal.net/m/31/shenmue-201961215304614_1.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Final Fantasy X Precintado PAL",
        "name_en": "Final Fantasy X Sealed PAL",
        "description": "Final Fantasy X PAL completamente precintado.",
        "description_en": "Final Fantasy X PAL completely sealed.",
        "price": 120.00, "stock": 1, "discount": 0.0, "condition": "new",
        "item_slug": "precintados",
        "image_url": "https://i.etsystatic.com/20685833/r/il/d09585/5220865797/il_fullxfull.5220865797_qg92.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Dragon Ball Z Super Butōden Import SNES",
        "name_en": "Dragon Ball Z Super Butōden Import SNES",
        "description": "Dragon Ball Z Super Butōden import japonés para SNES.",
        "description_en": "Dragon Ball Z Super Butōden Japanese import for SNES.",
        "price": 55.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "japoneses-import",
        "image_url": "https://cdn11.bigcommerce.com/s-ymgqt/images/stencil/1000w/products/26452/33322/Legend-of-Zelda-A-Link-To-t__89317.1712937460.jpg?c=2",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Press Kit Resident Evil 2",
        "name_en": "Resident Evil 2 Press Kit",
        "description": "Press kit original de Resident Evil 2, rarísimo.",
        "description_en": "Original Resident Evil 2 press kit, extremely rare.",
        "price": 250.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-ediciones-especiales",
        "image_url": "https://media.vandal.net/m/31/shenmue-201961215304614_1.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── MÚSICA › Medios Físicos ────────────────────────────────────────────────
    {
        "name": "Vinilo Led Zeppelin IV",
        "name_en": "Led Zeppelin IV Vinyl",
        "description": "Led Zeppelin IV edición original 1971.",
        "description_en": "Led Zeppelin IV original 1971 edition.",
        "price": 45.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "discos-de-vinilo",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2019/10/Led-Zeppelin-1200x1200.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Pink Floyd The Wall",
        "name_en": "Pink Floyd The Wall Vinyl",
        "description": "The Wall doble vinilo edición original 1979.",
        "description_en": "The Wall double vinyl original 1979 edition.",
        "price": 60.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "discos-de-vinilo",
        "image_url": "https://www.emp-online.es/dw/image/v2/BBQV_PRD/on/demandware.static/-/Sites-master-emp/default/dw9a04de7a/images/2/2/7/4/227441-emp.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Nirvana Nevermind",
        "name_en": "Nirvana Nevermind Vinyl",
        "description": "Nevermind edición original 1991 en perfecto estado.",
        "description_en": "Nevermind original 1991 edition in perfect condition.",
        "price": 50.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "discos-de-vinilo",
        "image_url": "https://universalmusiconline.es/cdn/shop/files/nirvana.jpg?v=1685519501",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Michael Jackson Thriller",
        "name_en": "Michael Jackson Thriller Vinyl",
        "description": "Thriller edición original 1982, incluye encarte.",
        "description_en": "Thriller original 1982 edition, includes insert.",
        "price": 70.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "discos-de-vinilo",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2024/12/Michael-Jackson-e1734520718418.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "CD Radiohead OK Computer",
        "name_en": "Radiohead OK Computer CD",
        "description": "CD OK Computer Radiohead edición original 1997.",
        "description_en": "OK Computer Radiohead CD original 1997 edition.",
        "price": 12.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "cds",
        "image_url": "https://universalmusiconline.es/cdn/shop/files/nirvana.jpg?v=1685519501",
        "seller_email": "maria@test.com",
    },
    {
        "name": "CD Daft Punk Random Access Memories",
        "name_en": "Daft Punk Random Access Memories CD",
        "description": "Random Access Memories CD edición especial con libreto.",
        "description_en": "Random Access Memories CD special edition with booklet.",
        "price": 15.00, "stock": 5, "discount": 20.0, "condition": "new",
        "item_slug": "cds",
        "image_url": "https://universalmusiconline.es/cdn/shop/files/nirvana.jpg?v=1685519501",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Casete Depeche Mode Violator",
        "name_en": "Depeche Mode Violator Cassette",
        "description": "Casete Violator de Depeche Mode en buen estado.",
        "description_en": "Depeche Mode Violator cassette in good condition.",
        "price": 12.00, "stock": 10, "discount": 20.0, "condition": "used",
        "item_slug": "casetes",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHVBpFFP68FQd9Gh1OWGXo4awKfdLAho6Qvg&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Casete Metallica Black Album",
        "name_en": "Metallica Black Album Cassette",
        "description": "Metallica The Black Album casete original 1991.",
        "description_en": "Metallica The Black Album original 1991 cassette.",
        "price": 10.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "casetes",
        "image_url": "https://i.ebayimg.com/images/g/zK8AAOSwnh1i5Ykf/s-l1200.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Casete Madonna Like a Virgin",
        "name_en": "Madonna Like a Virgin Cassette",
        "description": "Madonna Like a Virgin casete original 1984.",
        "description_en": "Madonna Like a Virgin original 1984 cassette.",
        "price": 8.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "casetes",
        "image_url": "https://i.etsystatic.com/20964828/r/il/203b03/7004577808/il_570xN.7004577808_o5pm.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Mini Disc Sony MZ-R70",
        "name_en": "Sony MZ-R70 MiniDisc",
        "description": "Grabador Sony MZ-R70 con caja y auriculares originales.",
        "description_en": "Sony MZ-R70 MiniDisc recorder with original box and earphones.",
        "price": 55.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "otros-vinilos",
        "image_url": "https://universalmusiconline.es/cdn/shop/files/nirvana.jpg?v=1685519501",
        "seller_email": "maria@test.com",
    },

    # ── MÚSICA › Épocas ───────────────────────────────────────────────────────
    {
        "name": "Vinilo The Beatles Abbey Road",
        "name_en": "The Beatles Abbey Road Vinyl",
        "description": "Abbey Road vinilo original 1969, buen estado general.",
        "description_en": "Abbey Road original 1969 vinyl, good general condition.",
        "price": 80.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "los-60",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2019/10/Led-Zeppelin-1200x1200.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo The Rolling Stones Exile",
        "name_en": "The Rolling Stones Exile on Main St. Vinyl",
        "description": "Exile on Main St. doble vinilo original 1972.",
        "description_en": "Exile on Main St. original double vinyl 1972.",
        "price": 65.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "los-60",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2019/10/Led-Zeppelin-1200x1200.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo David Bowie Ziggy Stardust",
        "name_en": "David Bowie Ziggy Stardust Vinyl",
        "description": "Ziggy Stardust vinilo original 1972, buen estado.",
        "description_en": "Ziggy Stardust original 1972 vinyl, good condition.",
        "price": 55.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "los-70",
        "image_url": "https://static.fnac-static.com/multimedia/Images/ES/NR/59/39/74/7616857/1540-1.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Madonna Like a Virgin",
        "name_en": "Madonna Like a Virgin Vinyl",
        "description": "Like a Virgin vinilo original 1984.",
        "description_en": "Like a Virgin original 1984 vinyl.",
        "price": 30.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "los-80",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2019/10/Led-Zeppelin-1200x1200.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Michael Jackson Bad",
        "name_en": "Michael Jackson Bad Vinyl",
        "description": "Bad de Michael Jackson edición original 1987.",
        "description_en": "Michael Jackson Bad original 1987 edition.",
        "price": 40.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "los-80",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2024/12/Michael-Jackson-e1734520718418.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "CD Nirvana Nevermind 1991",
        "name_en": "Nirvana Nevermind CD 1991",
        "description": "Nevermind CD edición original 1991.",
        "description_en": "Nevermind original 1991 CD edition.",
        "price": 18.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "los-90",
        "image_url": "https://universalmusiconline.es/cdn/shop/files/nirvana.jpg?v=1685519501",
        "seller_email": "maria@test.com",
    },
    {
        "name": "CD Oasis (What's the Story) Morning Glory?",
        "name_en": "Oasis (What's the Story) Morning Glory? CD",
        "description": "What's the Story Morning Glory? CD original 1995.",
        "description_en": "What's the Story Morning Glory? original 1995 CD.",
        "price": 14.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "los-90",
        "image_url": "https://universalmusiconline.es/cdn/shop/files/nirvana.jpg?v=1685519501",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Jazz Blue Note Años 50",
        "name_en": "50s Blue Note Jazz Vinyl",
        "description": "Selección de vinilos jazz de Blue Note años 50.",
        "description_en": "Blue Note jazz vinyl selection from the 50s.",
        "price": 90.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-epocas",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2019/10/Led-Zeppelin-1200x1200.png",
        "seller_email": "maria@test.com",
    },

    # ── MÚSICA › Reproductores ────────────────────────────────────────────────
    {
        "name": "Walkman Sony WM-F10",
        "name_en": "Sony WM-F10 Walkman",
        "description": "Walkman Sony con radio FM en buen estado.",
        "description_en": "Sony Walkman with FM radio in good working condition.",
        "price": 40.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "walkman",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_UePqDF2twZgFm7ZVbr8sHs39o4Jjx22Ag&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Walkman Sony WM-EX1 Reacondicionado",
        "name_en": "Refurbished Sony WM-EX1 Walkman",
        "description": "Walkman Sony WM-EX1 revisado, funciona perfectamente.",
        "description_en": "Serviced Sony WM-EX1 Walkman, works perfectly.",
        "price": 55.00, "stock": 2, "discount": 0.0, "condition": "refurbished",
        "item_slug": "walkman",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_UePqDF2twZgFm7ZVbr8sHs39o4Jjx22Ag&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Discman Sony D-EJ955",
        "name_en": "Sony D-EJ955 Discman",
        "description": "Discman Sony con G-Protection, incluye auriculares.",
        "description_en": "Sony Discman with G-Protection, includes headphones.",
        "price": 45.00, "stock": 4, "discount": 5.0, "condition": "used",
        "item_slug": "discman",
        "image_url": "https://static-data2.manualslib.com/product-images/299/214754/sony-cd-walkman-d-ej1000-cd-player.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Radiocassette JVC PC-W330",
        "name_en": "JVC PC-W330 Radiocassette",
        "description": "Radiocassette JVC doble pletina con ecualizador.",
        "description_en": "JVC double-deck radiocassette with equalizer.",
        "price": 65.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "radiocassettes",
        "image_url": "https://hifivintage.eu/38222-large_default/jvc-pc-w330-l.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Tocadiscos Technics SL-1200",
        "name_en": "Technics SL-1200 Turntable",
        "description": "Mítico Technics SL-1200 en estado de coleccionista.",
        "description_en": "Legendary Technics SL-1200 turntable in collector condition.",
        "price": 350.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "tocadiscos",
        "image_url": "https://i.blogs.es/2c45fe/direct_drive_turntable_system_sl_1200gae_3/1366_2000.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Amplificador Marantz PM-80",
        "name_en": "Marantz PM-80 Amplifier",
        "description": "Amplificador Marantz PM-80 vintage en perfecto estado.",
        "description_en": "Vintage Marantz PM-80 amplifier in perfect condition.",
        "price": 180.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "amplificadores",
        "image_url": "https://i.blogs.es/2c45fe/direct_drive_turntable_system_sl_1200gae_3/1366_2000.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Equipo de Música Aiwa CX-NA777",
        "name_en": "Aiwa CX-NA777 Hi-Fi System",
        "description": "Equipo Aiwa CX-NA777 con 5 CD, radio y cassette.",
        "description_en": "Aiwa CX-NA777 hi-fi system with 5CD, radio and cassette.",
        "price": 90.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-reproductores-audio",
        "image_url": "https://i.blogs.es/2c45fe/direct_drive_turntable_system_sl_1200gae_3/1366_2000.jpg",
        "seller_email": "maria@test.com",
    },

    # ── MÚSICA › Instrumentos ─────────────────────────────────────────────────
    {
        "name": "Guitarra Fender Stratocaster 80s",
        "name_en": "Fender Stratocaster 80s Guitar",
        "description": "Fender Stratocaster Made in Japan años 80, sonido increíble.",
        "description_en": "Fender Stratocaster Made in Japan 80s, incredible sound.",
        "price": 650.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "guitarras",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_UePqDF2twZgFm7ZVbr8sHs39o4Jjx22Ag&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Piano Casio CT-310 Vintage",
        "name_en": "Vintage Casio CT-310 Piano",
        "description": "Teclado Casio CT-310 de los 80, funciona perfectamente.",
        "description_en": "80s Casio CT-310 keyboard, works perfectly.",
        "price": 90.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "pianos",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_UePqDF2twZgFm7ZVbr8sHs39o4Jjx22Ag&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Batería Pearl Export 90s",
        "name_en": "Pearl Export 90s Drum Kit",
        "description": "Batería Pearl Export años 90 completa, buen estado.",
        "description_en": "Complete Pearl Export 90s drum kit, good condition.",
        "price": 400.00, "stock": 1, "discount": 10.0, "condition": "used",
        "item_slug": "baterias",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_UePqDF2twZgFm7ZVbr8sHs39o4Jjx22Ag&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Trompeta Yamaha YTR-2320 Vintage",
        "name_en": "Vintage Yamaha YTR-2320 Trumpet",
        "description": "Trompeta Yamaha YTR-2320 en excelente estado.",
        "description_en": "Yamaha YTR-2320 trumpet in excellent condition.",
        "price": 220.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-instrumentos",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_UePqDF2twZgFm7ZVbr8sHs39o4Jjx22Ag&s",
        "seller_email": "maria@test.com",
    },

    # ── TECNOLOGÍA › Ordenadores ──────────────────────────────────────────────
    {
        "name": "IBM PC XT 5160",
        "name_en": "IBM PC XT 5160",
        "description": "IBM PC XT con monitor monocromo y teclado original.",
        "description_en": "IBM PC XT with monochrome monitor and original keyboard.",
        "price": 200.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "ibm",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Commodore64.jpg/1024px-Commodore64.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Commodore 64 Completo",
        "name_en": "Complete Commodore 64",
        "description": "C64 con datasette, joystick y caja original.",
        "description_en": "C64 with datasette, joystick and original box.",
        "price": 130.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "commodore",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Commodore64.jpg/1024px-Commodore64.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Amiga 500",
        "name_en": "Amiga 500",
        "description": "Commodore Amiga 500 con joystick y juegos.",
        "description_en": "Commodore Amiga 500 with joystick and games.",
        "price": 160.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "amiga",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Commodore64.jpg/1024px-Commodore64.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Amstrad PC 1512",
        "name_en": "Amstrad PC 1512",
        "description": "Amstrad PC 1512 con monitor color y MS-DOS.",
        "description_en": "Amstrad PC 1512 with color monitor and MS-DOS.",
        "price": 110.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "amstrad-tech",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Amstrad_CPC464.jpg/1024px-Amstrad_CPC464.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Apple Macintosh 128K",
        "name_en": "Apple Macintosh 128K",
        "description": "Macintosh 128K original 1984, funciona y enciende.",
        "description_en": "Original 1984 Macintosh 128K, works and boots.",
        "price": 450.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "macintosh",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Commodore64.jpg/1024px-Commodore64.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Spectrum ZX 48K",
        "name_en": "ZX Spectrum 48K",
        "description": "Sinclair ZX Spectrum 48K con cargador y joystick.",
        "description_en": "Sinclair ZX Spectrum 48K with power supply and joystick.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "otros-ordenadores",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Commodore64.jpg/1024px-Commodore64.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── TECNOLOGÍA › Telefonía ────────────────────────────────────────────────
    {
        "name": "Teléfono Ericofon",
        "name_en": "Ericofon Fixed Phone",
        "description": "Teléfono Ericofon de los 60, pieza de museo.",
        "description_en": "60s Ericofon telephone, museum piece.",
        "price": 85.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "telefonos-fijos",
        "image_url": "https://vintagemobile.fr/cdn/shop/files/Nokia-3310-Vintage-Mobile-777.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Nokia 3310 Azul",
        "name_en": "Blue Nokia 3310",
        "description": "Nokia 3310 clásico en azul, batería nueva.",
        "description_en": "Classic Nokia 3310 in blue, new battery.",
        "price": 35.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "moviles-antiguos",
        "image_url": "https://vintagemobile.fr/cdn/shop/files/Nokia-3310-Vintage-Mobile-777.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Motorola Razr V3 Plata",
        "name_en": "Silver Motorola Razr V3",
        "description": "Motorola RAZR V3 plateado, icónico móvil plegable.",
        "description_en": "Silver Motorola RAZR V3, iconic flip phone.",
        "price": 50.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "moviles-antiguos",
        "image_url": "https://m.media-amazon.com/images/I/81EAOq92VaL.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Sony Ericsson T610",
        "name_en": "Sony Ericsson T610",
        "description": "Sony Ericsson T610 con cámara integrada, buen estado.",
        "description_en": "Sony Ericsson T610 with integrated camera, good condition.",
        "price": 30.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "moviles-antiguos",
        "image_url": "https://m.media-amazon.com/images/I/81EAOq92VaL.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "iPhone 2G Original",
        "name_en": "Original iPhone 2G",
        "description": "iPhone 2G original 2007, funciona pero batería agotada.",
        "description_en": "Original 2007 iPhone 2G, works but battery dead.",
        "price": 120.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "smartphones",
        "image_url": "https://vintagemobile.fr/cdn/shop/files/Nokia-3310-Vintage-Mobile-777.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Cargador Nokia Universal",
        "name_en": "Universal Nokia Charger",
        "description": "Cargador universal para Nokia 3310 y similares.",
        "description_en": "Universal charger for Nokia 3310 and similar models.",
        "price": 8.00, "stock": 15, "discount": 0.0, "condition": "new",
        "item_slug": "accesorios-telefonia",
        "image_url": "https://vintagemobile.fr/cdn/shop/files/Nokia-3310-Vintage-Mobile-777.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Walkie Talkie Motorola TalkAbout",
        "name_en": "Motorola TalkAbout Walkie Talkie",
        "description": "Par de walkie-talkies Motorola TalkAbout años 90.",
        "description_en": "Pair of 90s Motorola TalkAbout walkie-talkies.",
        "price": 28.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "otros-telefonia",
        "image_url": "https://vintagemobile.fr/cdn/shop/files/Nokia-3310-Vintage-Mobile-777.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── TECNOLOGÍA › Fotografía ───────────────────────────────────────────────
    {
        "name": "Olympus OM-1",
        "name_en": "Olympus OM-1",
        "description": "Cámara réflex Olympus OM-1 con objetivo 50mm.",
        "description_en": "Olympus OM-1 reflex camera with 50mm lens.",
        "price": 150.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "camaras-analogicas",
        "image_url": "https://cameramarket.es/cdn/shop/files/OlympusOM-1-Camera_0.png",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Canon AE-1 Program",
        "name_en": "Canon AE-1 Program",
        "description": "Canon AE-1 Program con objetivo 50mm f/1.8.",
        "description_en": "Canon AE-1 Program with 50mm f/1.8 lens.",
        "price": 180.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "camaras-analogicas",
        "image_url": "https://cameramarket.es/cdn/shop/files/CapturadePantalla2023-10-05alas20.05.01.png",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Pentax K1000",
        "name_en": "Pentax K1000",
        "description": "Pentax K1000 totalmente mecánica, no necesita batería.",
        "description_en": "Fully mechanical Pentax K1000, no battery needed.",
        "price": 120.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "camaras-analogicas",
        "image_url": "https://cdn.assets.lomography.com/ea/26f4004e1867352fe39b5b45504d2e7623031a/1216x794x2.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Polaroid 600",
        "name_en": "Polaroid 600",
        "description": "Polaroid 600 clásica en buen estado, lista para usar.",
        "description_en": "Classic Polaroid 600 in good condition, ready to use.",
        "price": 60.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "polaroid",
        "image_url": "https://tiendainstant.com/1306-thickbox_default/polaroid-600.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Cámara Super 8 Chinon",
        "name_en": "Chinon Super 8 Camera",
        "description": "Cámara Super 8 Chinon 8F-MA, funciona perfectamente.",
        "description_en": "Chinon 8F-MA Super 8 camera, works perfectly.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "super-8",
        "image_url": "https://cameramarket.es/cdn/shop/files/OlympusOM-1-Camera_0.png",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Objetivo Takumar 50mm f/1.4",
        "name_en": "Takumar 50mm f/1.4 Lens",
        "description": "Super-Takumar 50mm f/1.4 M42, óptica de coleccionista.",
        "description_en": "Super-Takumar 50mm f/1.4 M42, collector's optics.",
        "price": 75.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "objetivos-antiguos",
        "image_url": "https://cameramarket.es/cdn/shop/files/OlympusOM-1-Camera_0.png",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Proyector de Diapositivas Leitz",
        "name_en": "Leitz Slide Projector",
        "description": "Proyector de diapositivas Leitz Pradovit, estado impecable.",
        "description_en": "Leitz Pradovit slide projector, impeccable condition.",
        "price": 70.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-fotografia",
        "image_url": "https://cameramarket.es/cdn/shop/files/OlympusOM-1-Camera_0.png",
        "seller_email": "carlos@test.com",
    },

    # ── TECNOLOGÍA › Accesorios Tech ──────────────────────────────────────────
    {
        "name": "Ratón Microsoft Serial Vintage",
        "name_en": "Vintage Microsoft Serial Mouse",
        "description": "Ratón Microsoft IntelliMouse serial original años 90.",
        "description_en": "Original 90s Microsoft IntelliMouse serial mouse.",
        "price": 25.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "ratones-antiguos",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Commodore64.jpg/1024px-Commodore64.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Teclado IBM Model M",
        "name_en": "IBM Model M Keyboard",
        "description": "IBM Model M buckling spring, el mejor teclado de la historia.",
        "description_en": "IBM Model M buckling spring, the best keyboard ever made.",
        "price": 120.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "teclados-mecanicos",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Commodore64.jpg/1024px-Commodore64.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Cable SCART Dorado",
        "name_en": "Gold SCART Cable",
        "description": "Cable SCART dorado de alta calidad para consolas retro.",
        "description_en": "High quality gold SCART cable for retro consoles.",
        "price": 8.00, "stock": 20, "discount": 0.0, "condition": "new",
        "item_slug": "cables",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Commodore64.jpg/1024px-Commodore64.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Módem 56K US Robotics",
        "name_en": "US Robotics 56K Modem",
        "description": "Módem externo US Robotics 56K, años 90.",
        "description_en": "External US Robotics 56K modem, 90s.",
        "price": 20.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "otros-accesorios-tech",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Commodore64.jpg/1024px-Commodore64.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── MODA ──────────────────────────────────────────────────────────────────
    {
        "name": "Camiseta Nirvana Nevermind 90s",
        "name_en": "Nirvana Nevermind 90s T-Shirt",
        "description": "Camiseta vintage Nirvana Nevermind, talla L, algodón 100%.",
        "description_en": "Nirvana Nevermind vintage T-shirt, size L, 100% cotton.",
        "price": 22.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "camisetas-80s-90s",
        "image_url": "https://media.camden.es/product/camiseta-nirvana-unisex-nevermind-album-800x800.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Camiseta AC/DC Back in Black Tour",
        "name_en": "AC/DC Back in Black Tour T-Shirt",
        "description": "Camiseta tour AC/DC Back in Black 1980, original.",
        "description_en": "Original AC/DC Back in Black 1980 tour T-shirt.",
        "price": 35.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "camisetas-80s-90s",
        "image_url": "https://media.camden.es/product/camiseta-nirvana-unisex-nevermind-album-800x800.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Sudadera Champion Vintage",
        "name_en": "Vintage Champion Sweatshirt",
        "description": "Sudadera Champion con logo bordado años 90, talla M.",
        "description_en": "90s Champion sweatshirt with embroidered logo, size M.",
        "price": 38.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "sudaderas",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSep2jVyni3fNTPvcuEB5a72p7TfWok-Xf__Q&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Chaqueta Levi's Trucker Vintage",
        "name_en": "Vintage Levi's Trucker Jacket",
        "description": "Chaqueta vaquera Levi's Trucker años 80, talla L.",
        "description_en": "80s Levi's Trucker denim jacket, size L.",
        "price": 85.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "chaquetas",
        "image_url": "https://lsco.scene7.com/is/image/lsco/501540107-alt2-pdp-lse",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Chándal Adidas Firebird Vintage",
        "name_en": "Vintage Adidas Firebird Tracksuit",
        "description": "Chándal Adidas Firebird completo años 80, talla M.",
        "description_en": "Complete 80s Adidas Firebird tracksuit, size M.",
        "price": 65.00, "stock": 3, "discount": 15.0, "condition": "used",
        "item_slug": "chandales-clasicos",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSep2jVyni3fNTPvcuEB5a72p7TfWok-Xf__Q&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vaqueros Levi's 501 Vintage",
        "name_en": "Vintage Levi's 501 Jeans",
        "description": "Levi's 501 originales años 80, talla 32x32.",
        "description_en": "Original 80s Levi's 501, size 32x32.",
        "price": 65.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "levis",
        "image_url": "https://lsco.scene7.com/is/image/lsco/501540107-alt2-pdp-lse",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Zapatos Oxford Vintage",
        "name_en": "Vintage Oxford Shoes",
        "description": "Zapatos Oxford de cuero años 70, talla 42.",
        "description_en": "70s leather Oxford shoes, size 42.",
        "price": 45.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "zapatos",
        "image_url": "https://www.opticauniversitaria.es/dw/image/v2/BJDL_PRD/on/demandware.static/-/Sites-optica-master-catalog/default/dw4a6a13e1/images/hi-res/2025/RAYBAN25/RB-2140/159953/0RB2140__901__P21__shad__qt.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Zapatillas Nike Air Max 90",
        "name_en": "Nike Air Max 90 Sneakers",
        "description": "Nike Air Max 90 retro en colorway OG, talla 42.",
        "description_en": "Nike Air Max 90 retro in OG colorway, size 42.",
        "price": 120.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "zapatillas",
        "image_url": "https://www.dooerssneakers.com/images/nike-zapatillas-hombre-air-max-90-drift-lateral-exterior-1001014908-1200x1200-d",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Botas Doc Martens 1460",
        "name_en": "Doc Martens 1460 Boots",
        "description": "Doc Martens 1460 originales Made in England, talla 41.",
        "description_en": "Original Made in England Doc Martens 1460, size 41.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "botas",
        "image_url": "https://www.dooerssneakers.com/images/nike-zapatillas-hombre-air-max-90-drift-lateral-exterior-1001014908-1200x1200-d",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Sandalias Birkenstock Arizona Vintage",
        "name_en": "Vintage Birkenstock Arizona Sandals",
        "description": "Birkenstock Arizona años 80, cuero marrón claro.",
        "description_en": "80s Birkenstock Arizona sandals, light brown leather.",
        "price": 55.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "otros-zapatos",
        "image_url": "https://www.dooerssneakers.com/images/nike-zapatillas-hombre-air-max-90-drift-lateral-exterior-1001014908-1200x1200-d",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Anillo de Plata Años 70",
        "name_en": "70s Silver Ring",
        "description": "Anillo de plata de ley con grabado floral años 70.",
        "description_en": "Sterling silver ring with floral engraving, 70s.",
        "price": 28.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "anillos",
        "image_url": "https://www.joyeriasanchez.com/177814-large_default/reloj-casio-digital-f-91w-1yeg.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Pendientes Vintage Clip Dorados",
        "name_en": "Vintage Gold Clip-On Earrings",
        "description": "Pendientes de clip dorados años 60, sin perforación.",
        "description_en": "60s gold clip-on earrings, no piercing needed.",
        "price": 15.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "pendientes",
        "image_url": "https://www.joyeriasanchez.com/177814-large_default/reloj-casio-digital-f-91w-1yeg.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Collar Medallón Años 70",
        "name_en": "70s Medallion Necklace",
        "description": "Collar con medallón dorado de los años 70.",
        "description_en": "Gold medallion necklace from the 70s.",
        "price": 22.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "collares",
        "image_url": "https://www.joyeriasanchez.com/177814-large_default/reloj-casio-digital-f-91w-1yeg.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Reloj Casio F-91W",
        "name_en": "Casio F-91W Watch",
        "description": "El reloj digital más icónico de Casio, nuevo en caja.",
        "description_en": "The most iconic Casio digital watch, new in box.",
        "price": 18.00, "stock": 15, "discount": 0.0, "condition": "new",
        "item_slug": "relojes",
        "image_url": "https://www.joyeriasanchez.com/177814-large_default/reloj-casio-digital-f-91w-1yeg.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Reloj Seiko 5 Automático Vintage",
        "name_en": "Vintage Seiko 5 Automatic Watch",
        "description": "Seiko 5 automático años 70, revisado con correa nueva.",
        "description_en": "70s Seiko 5 automatic, serviced with new strap.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "refurbished",
        "item_slug": "relojes",
        "image_url": "https://www.joyeriasanchez.com/177814-large_default/reloj-casio-digital-f-91w-1yeg.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Broche Camafeo Vintage",
        "name_en": "Vintage Cameo Brooch",
        "description": "Broche camafeo de nácar años 50, pieza única.",
        "description_en": "50s mother-of-pearl cameo brooch, unique piece.",
        "price": 35.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "otros-joyeria-relojes",
        "image_url": "https://www.joyeriasanchez.com/177814-large_default/reloj-casio-digital-f-91w-1yeg.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Bolso Gucci Vintage GG Canvas",
        "name_en": "Vintage Gucci GG Canvas Bag",
        "description": "Bolso Gucci GG canvas años 80, auténtico.",
        "description_en": "80s Gucci GG canvas bag, authentic.",
        "price": 250.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "bolsos",
        "image_url": "https://www.opticauniversitaria.es/dw/image/v2/BJDL_PRD/on/demandware.static/-/Sites-optica-master-catalog/default/dw4a6a13e1/images/hi-res/2025/RAYBAN25/RB-2140/159953/0RB2140__901__P21__shad__qt.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Riñonera Fila Vintage",
        "name_en": "Vintage Fila Fanny Pack",
        "description": "Riñonera Fila años 90, estado impecable.",
        "description_en": "90s Fila fanny pack, impeccable condition.",
        "price": 20.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "rinoneras",
        "image_url": "https://www.opticauniversitaria.es/dw/image/v2/BJDL_PRD/on/demandware.static/-/Sites-optica-master-catalog/default/dw4a6a13e1/images/hi-res/2025/RAYBAN25/RB-2140/159953/0RB2140__901__P21__shad__qt.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Gafas Ray-Ban Wayfarer Vintage",
        "name_en": "Vintage Ray-Ban Wayfarer Sunglasses",
        "description": "Ray-Ban Wayfarer originales años 80, montura negra.",
        "description_en": "Original 80s Ray-Ban Wayfarer, black frame.",
        "price": 85.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "gafas",
        "image_url": "https://www.opticauniversitaria.es/dw/image/v2/BJDL_PRD/on/demandware.static/-/Sites-optica-master-catalog/default/dw4a6a13e1/images/hi-res/2025/RAYBAN25/RB-2140/159953/0RB2140__901__P21__shad__qt.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Parche Led Zeppelin Bordado",
        "name_en": "Embroidered Led Zeppelin Patch",
        "description": "Parche bordado Led Zeppelin para chaqueta o mochila.",
        "description_en": "Embroidered Led Zeppelin patch for jacket or backpack.",
        "price": 5.00, "stock": 30, "discount": 0.0, "condition": "new",
        "item_slug": "parches",
        "image_url": "https://media.camden.es/product/camiseta-nirvana-unisex-nevermind-album-800x800.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Pack 10 Parches Rock Vintage",
        "name_en": "Vintage Rock Patch Pack x10",
        "description": "Pack de 10 parches bordados de bandas rock de los 70-90.",
        "description_en": "Pack of 10 embroidered patches from 70s-90s rock bands.",
        "price": 18.00, "stock": 8, "discount": 10.0, "condition": "new",
        "item_slug": "parches",
        "image_url": "https://media.camden.es/product/camiseta-nirvana-unisex-nevermind-album-800x800.jpg",
        "seller_email": "maria@test.com",
    },

    # ── COLECCIONISMO ─────────────────────────────────────────────────────────
    {
        "name": "Figura He-Man Masters of the Universe",
        "name_en": "He-Man Masters of the Universe Figure",
        "description": "He-Man original Mattel años 80 con espada y escudo.",
        "description_en": "Original 80s Mattel He-Man with sword and shield.",
        "price": 28.00, "stock": 3, "discount": 15.0, "condition": "used",
        "item_slug": "action-figures-80s-90s",
        "image_url": "https://tajmahalcomics.com/wp-content/uploads/2024/01/x_matthyd17.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Leonardo TMNT",
        "name_en": "Leonardo TMNT Figure",
        "description": "Figura original Leonardo Tortugas Ninja años 90, completa.",
        "description_en": "Original 90s Leonardo TMNT figure, complete with weapons.",
        "price": 35.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "action-figures-80s-90s",
        "image_url": "https://m.media-amazon.com/images/I/61FLOrTtrIL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Optimus Prime G1",
        "name_en": "G1 Optimus Prime Figure",
        "description": "Optimus Prime Transformers G1 original años 80, completo.",
        "description_en": "Original 80s G1 Transformers Optimus Prime, complete.",
        "price": 80.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "action-figures-80s-90s",
        "image_url": "https://m.media-amazon.com/images/I/61FLOrTtrIL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Mazinger Z Japonesa",
        "name_en": "Japanese Mazinger Z Figure",
        "description": "Figura Mazinger Z edición japonesa de coleccionista.",
        "description_en": "Japanese edition Mazinger Z collector's figure.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "figuras-anime",
        "image_url": "https://m.media-amazon.com/images/I/71i2t-c7JWL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Dragon Ball Z Goku",
        "name_en": "Dragon Ball Z Goku Figure",
        "description": "Figura original Goku Super Saiyan de Irwin, años 90.",
        "description_en": "Original Irwin Super Saiyan Goku figure, 90s.",
        "price": 45.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "figuras-anime",
        "image_url": "https://m.media-amazon.com/images/I/71i2t-c7JWL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Evangelion Unit 01 Resina",
        "name_en": "Evangelion Unit 01 Resin Figure",
        "description": "Figura resina Evangelion Unit-01 edición limitada numerada.",
        "description_en": "Evangelion Unit-01 limited edition numbered resin figure.",
        "price": 180.00, "stock": 1, "discount": 0.0, "condition": "new",
        "item_slug": "resina-edicion-limitada",
        "image_url": "https://m.media-amazon.com/images/I/71i2t-c7JWL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Pista Scalextric Años 80",
        "name_en": "80s Scalextric Track",
        "description": "Pista Scalextric completa años 80 con dos coches.",
        "description_en": "Complete 80s Scalextric track with two cars.",
        "price": 55.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "juguetes-antiguos",
        "image_url": "https://tajmahalcomics.com/wp-content/uploads/2024/01/x_matthyd17.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Etch-a-Sketch Original",
        "name_en": "Original Etch-a-Sketch",
        "description": "Etch-a-Sketch original años 80, funciona perfectamente.",
        "description_en": "Original 80s Etch-a-Sketch, works perfectly.",
        "price": 18.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "juguetes-antiguos",
        "image_url": "https://tajmahalcomics.com/wp-content/uploads/2024/01/x_matthyd17.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Star Wars Han Solo Kenner",
        "name_en": "Star Wars Han Solo Kenner Figure",
        "description": "Figura Han Solo Kenner 1978, completa con blaster.",
        "description_en": "1978 Kenner Han Solo figure, complete with blaster.",
        "price": 55.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "otros-figuras",
        "image_url": "https://m.media-amazon.com/images/I/61FLOrTtrIL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Carta Pikachu Base Set Holo",
        "name_en": "Pikachu Base Set Holo Card",
        "description": "Pikachu holográfico Base Set 1999, Near Mint.",
        "description_en": "1999 Base Set holographic Pikachu, Near Mint condition.",
        "price": 60.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "pokemon",
        "image_url": "https://m.media-amazon.com/images/I/51MxHNZf0GL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Carta Charizard Holo Base Set 1999",
        "name_en": "1999 Charizard Holo Base Set Card",
        "description": "Charizard Holo Base Set 1999, estado Near Mint.",
        "description_en": "1999 Base Set holographic Charizard, Near Mint.",
        "price": 250.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "pokemon",
        "image_url": "https://m.media-amazon.com/images/I/81y6KqdilQL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Carta Magic Black Lotus Alpha",
        "name_en": "Alpha Magic Black Lotus Card",
        "description": "Black Lotus Magic: The Gathering Alpha, auténtica.",
        "description_en": "Alpha edition Magic: The Gathering Black Lotus, authentic.",
        "price": 500.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "magic",
        "image_url": "https://i.ebayimg.com/00/s/MTYwMFgxMTU2/z/2pgAAOSwoaNePCCr/$_57.JPG",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Lote 50 Cartas Magic Vintage",
        "name_en": "Lot of 50 Vintage Magic Cards",
        "description": "Lote de 50 cartas Magic ediciones vintage 1994-1998.",
        "description_en": "Lot of 50 Magic cards vintage editions 1994-1998.",
        "price": 80.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "magic",
        "image_url": "https://i.ebayimg.com/00/s/MTYwMFgxMTU2/z/2pgAAOSwoaNePCCr/$_57.JPG",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Carta Red-Eyes Black Dragon 1ª Ed",
        "name_en": "Red-Eyes Black Dragon 1st Ed Card",
        "description": "Red-Eyes Black Dragon Yu-Gi-Oh 1ª edición, excelente estado.",
        "description_en": "Yu-Gi-Oh Red-Eyes Black Dragon 1st edition, excellent condition.",
        "price": 45.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "yugioh",
        "image_url": "https://images.saymedia-content.com/.image/t_share/MTc0NDYwODA5NDc1OTI1MzUy/top-10-cards-you-need-for-your-red-eyes-black-dragon-yu-gi-oh-deck.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Lote Cromos Panini Mundial 82",
        "name_en": "Panini World Cup 82 Sticker Lot",
        "description": "Lote de cromos Panini del Mundial de España 1982.",
        "description_en": "Lot of Panini stickers from the 1982 Spain World Cup.",
        "price": 30.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "otros-cartas",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Litografía Star Wars Numerada 1/500",
        "name_en": "Numbered Star Wars Lithograph 1/500",
        "description": "Litografía original Star Wars edición numerada 1/500.",
        "description_en": "Original Star Wars lithograph numbered edition 1/500.",
        "price": 150.00, "stock": 1, "discount": 0.0, "condition": "new",
        "item_slug": "ediciones-numeradas",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Game Boy Light Edición Japonesa",
        "name_en": "Japanese Game Boy Light Edition",
        "description": "Game Boy Light edición japonesa, descatalogada en Europa.",
        "description_en": "Japanese Game Boy Light edition, discontinued in Europe.",
        "price": 220.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "descatalogadas",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Game-Boy-FL.png/1280px-Game-Boy-FL.png",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Cartucho Prototipo NES",
        "name_en": "NES Prototype Cartridge",
        "description": "Cartucho prototipo NES sin lanzamiento comercial, rarísimo.",
        "description_en": "NES prototype cartridge never commercially released, very rare.",
        "price": 800.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "rarezas",
        "image_url": "https://www.todoconsolas.com/308618-medium_default/super_mario_bros_3_nes_sp_po8443.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Set LEGO Classic Space 928 Vintage",
        "name_en": "Vintage LEGO Classic Space 928",
        "description": "LEGO Classic Space 928 Galaxy Explorer original 1979.",
        "description_en": "Original 1979 LEGO Classic Space 928 Galaxy Explorer.",
        "price": 400.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-ediciones-limitadas",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Don Quijote Facsímil 1ª Edición 1605",
        "name_en": "Don Quixote Facsimile 1st Edition 1605",
        "description": "Facsímil certificado de la primera edición del Quijote.",
        "description_en": "Certified facsimile of the first edition of Don Quixote.",
        "price": 180.00, "stock": 2, "discount": 0.0, "condition": "new",
        "item_slug": "primeras-ediciones",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "El Señor de los Anillos Ilustrado Tolkien",
        "name_en": "Illustrated Lord of the Rings Tolkien",
        "description": "El Señor de los Anillos edición ilustrada numerada.",
        "description_en": "The Lord of the Rings numbered illustrated edition.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "new",
        "item_slug": "ediciones-especiales",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Guía Oficial Zelda Ocarina of Time",
        "name_en": "Official Zelda Ocarina of Time Guide",
        "description": "Guía oficial de Nintendo para Zelda OoT, descatalogada.",
        "description_en": "Official Nintendo guide for Zelda OoT, out of print.",
        "price": 45.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "descatalogados",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Amazing Fantasy #15 Réplica Certificada",
        "name_en": "Amazing Fantasy #15 Certified Replica",
        "description": "Réplica certificada Amazing Fantasy #15 primera aparición Spiderman.",
        "description_en": "Certified replica Amazing Fantasy #15 first Spiderman appearance.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "marvel",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Detective Comics #27 Réplica",
        "name_en": "Detective Comics #27 Replica",
        "description": "Réplica Detective Comics #27 primera aparición Batman.",
        "description_en": "Detective Comics #27 replica, first Batman appearance.",
        "price": 85.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "dc-comics",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Póster Star Wars Original 1977",
        "name_en": "Original Star Wars Poster 1977",
        "description": "Póster original de Star Wars Una Nueva Esperanza, 1977.",
        "description_en": "Original Star Wars A New Hope poster, 1977.",
        "price": 120.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "posters-originales",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Revista Micromania Nº1 1988",
        "name_en": "Micromania Magazine No.1 1988",
        "description": "Primer número de Micromania España, 1988. Pieza histórica.",
        "description_en": "First issue of Micromania Spain, 1988. Historic piece.",
        "price": 40.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "publicidad",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Cartel Publicitario Coca-Cola 1950",
        "name_en": "Coca-Cola Advertising Poster 1950",
        "description": "Cartel publicitario original Coca-Cola años 50.",
        "description_en": "Original 1950s Coca-Cola advertising poster.",
        "price": 65.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "publicidad",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Catálogo IKEA 1975",
        "name_en": "1975 IKEA Catalogue",
        "description": "Catálogo IKEA de 1975, pieza de coleccionista.",
        "description_en": "1975 IKEA catalogue, collector's piece.",
        "price": 25.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "otros-libros-comics-revistas",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Moneda Peseta 1 Pta 1947",
        "name_en": "1947 Spanish Peseta Coin",
        "description": "Moneda de 1 peseta española 1947, estado MBC.",
        "description_en": "1947 Spanish 1 peseta coin, VF condition.",
        "price": 8.00, "stock": 10, "discount": 0.0, "condition": "used",
        "item_slug": "monedas",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Lote 20 Monedas Pesetas",
        "name_en": "Lot of 20 Peseta Coins",
        "description": "Lote de 20 monedas de pesetas diferentes años.",
        "description_en": "Lot of 20 peseta coins from different years.",
        "price": 30.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "monedas",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Colección Sellos España 1930s",
        "name_en": "Spain 1930s Stamp Collection",
        "description": "Colección de sellos españoles años 30, sin circular.",
        "description_en": "Collection of 1930s Spanish stamps, mint condition.",
        "price": 45.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "sellos",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Postal Fotográfica Barcelona 1910",
        "name_en": "Old Barcelona Photographic Postcard 1910",
        "description": "Postal fotográfica de Barcelona 1910, circulada con sello.",
        "description_en": "1910 photographic postcard of Barcelona, posted with stamp.",
        "price": 12.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "postales",
        "image_url": "https://i.blogs.es/bd03d8/nova-et-accurata-tabula-hispaniae-1652/650_1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mapa Antiguo España 1652",
        "name_en": "Old Map of Spain 1652",
        "description": "Reproducción de mapa antiguo de España datado en 1652.",
        "description_en": "Reproduction of old map of Spain dated 1652.",
        "price": 35.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "postales",
        "image_url": "https://i.blogs.es/bd03d8/nova-et-accurata-tabula-hispaniae-1652/650_1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mechero Zippo Vintage",
        "name_en": "Vintage Zippo Lighter",
        "description": "Mechero Zippo original años 60 con grabado.",
        "description_en": "Original 60s Zippo lighter with engraving.",
        "price": 45.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "otros-coleccionables",
        "image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg",
        "seller_email": "alex@test.com",
    },
]


# ══════════════════════════════════════════════════════════════════════════════
# REVIEWS
# ══════════════════════════════════════════════════════════════════════════════

REVIEWS_DATA = [
    (5, "Excelente producto",        "Llegó en perfecto estado, exactamente como se describía. Muy recomendable."),
    (5, "Perfecto para coleccionar", "Difícil encontrar estos artículos en tan buen estado. Muy satisfecho con la compra."),
    (5, "Superó mis expectativas",   "El envío fue rápido y el embalaje muy cuidado. Repetiría sin dudarlo."),
    (5, "Funciona perfectamente",    "Probado y todo funciona. El vendedor fue muy atento con mis dudas."),
    (4, "Muy buen estado",           "El producto estaba bien embalado y llegó rápido. Algún desgaste menor."),
    (4, "Tal como se describe",      "Cumple exactamente lo anunciado. Buen vendedor, lo recomiendo."),
    (4, "Buena relación calidad",    "Relación calidad-precio inmejorable para ser un artículo vintage."),
    (4, "Muy contento",              "Buen estado de conservación para su antigüedad. Sin sorpresas."),
    (3, "Correcto",                  "El producto está bien pero tardó más de lo esperado en llegar."),
    (3, "Aceptable",                 "Buen estado general aunque tiene alguna marca de uso no mencionada."),
    (2, "Podría ser mejor",          "El artículo tiene más desgaste del que aparecía en las fotos."),
    (1, "Decepcionante",             "No funciona correctamente, no se corresponde con la descripción."),
]
 


# ══════════════════════════════════════════════════════════════════════════════
# FUNCIONES
# ══════════════════════════════════════════════════════════════════════════════

def reset_data():
    """Borra todos los datos (preserva estructura de BD)."""
    print("\n🗑️  Reseteando datos...")
    Review.query.delete()
    Favorite.query.delete()
    OrderDetail.query.delete()
    Order.query.delete()
    Product.query.delete()
    Seller.query.delete()
    User.query.delete()
    db.session.commit()
    print("  [OK] Datos eliminados.")


def seed_users():
    print("\n👤 Seeding usuarios...")
    users = []
    role_map = {
        "buyer":  RoleName.buyer,
        "seller": RoleName.seller,
        "admin":  RoleName.admin,
    }
    for u in USERS_DATA:
        existing = User.query.filter_by(email=u["email"]).first()
        if existing:
            print(f"  [SKIP] {u['email']}")
            users.append(existing)
        else:
            user = User(
                name=u["name"],
                last_name=u["last_name"],
                email=u["email"],
                is_active=True,
                role=role_map.get(u.get("role", "buyer"), RoleName.buyer),
                image_url=u.get("image_url"),
            )
            user.set_password(u["password"])
            db.session.add(user)
            users.append(user)
            print(f"  [OK]   {u['email']} [{u.get('role', 'buyer')}]")
    db.session.flush()
    return users


def seed_sellers():
    """Crea los perfiles de vendedor para los usuarios con role=seller."""
    print("\n🏪 Seeding vendedores...")
    sellers = {}
    status_map = {
        "pending":  SellerStatus.pending,
        "verified": SellerStatus.verified,
        "rejected": SellerStatus.rejected,
    }
    for s in SELLERS_DATA:
        user = User.query.filter_by(email=s["email"]).first()
        if not user:
            print(f"  [WARN] Usuario no encontrado: {s['email']}")
            continue

        existing = Seller.query.filter_by(user_id=user.id).first()
        if existing:
            print(f"  [SKIP] {s['store_name']}")
            sellers[s["email"]] = existing
            continue

        seller = Seller(
            user_id=user.id,
            store_name=s["store_name"],
            description=s["description"],
            logo_url=s.get("logo_url"),
            phone=s["phone"],
            nif_cif=s["nif_cif"],
            origin_address=s["origin_address"],
            origin_city=s["origin_city"],
            origin_zip=s["origin_zip"],
            origin_country=s["origin_country"],
            status=status_map.get(s.get("status", "pending"), SellerStatus.pending),
            stripe_account_id=s.get("stripe_account_id"),
            stripe_onboarding_completed=s.get("stripe_onboarding_completed", False),
        )
        db.session.add(seller)
        sellers[s["email"]] = seller
        print(f"  [OK]   {s['store_name']} [{s.get('status', 'pending')}]")

    db.session.flush()
    return sellers


def seed_products(sellers):
    print("\n📦 Seeding productos...")
    products = []
    skipped_slugs = set()

    for p in PRODUCTS_DATA:
        # Comprobar duplicado por nombre ES
        existing = Product.query.filter(
            cast(Product.name["es"], String) == f'"{p["name"]}"'
        ).first()
        if existing:
            print(f"  [SKIP] {p['name']}")
            products.append(existing)
            continue

        item = Item.query.filter_by(slug=p["item_slug"]).first()
        if not item:
            if p["item_slug"] not in skipped_slugs:
                print(f"  [WARN] Item no encontrado: '{p['item_slug']}'")
                skipped_slugs.add(p["item_slug"])
            continue

        seller = sellers.get(p["seller_email"])
        if not seller:
            print(f"  [WARN] Vendedor no encontrado: {p['seller_email']} — omitiendo {p['name']}")
            continue

        product = Product(
            name={"es": p["name"], "en": p.get("name_en", p["name"])},
            description={
                "es": p["description"],
                "en": p.get("description_en", p["description"]),
            } if p.get("description") else None,
            price=p["price"],
            stock=p["stock"],
            discount=p["discount"],
            condition=p.get("condition", "used"),
            item_id=item.id,
            seller_id=seller.id,
            image_url=p["image_url"],
            created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 365)),
        )
        db.session.add(product)
        products.append(product)
        cond = p.get("condition", "used")
        disc = f" 🏷️ -{p['discount']}%" if p["discount"] > 0 else ""
        print(f"  [OK]   {p['name']} [{cond}]{disc} — {p['price']}€ → {p['seller_email']}")

    db.session.flush()
    print(f"\n  Total productos: {len(products)}")
    return products


def seed_orders(users, products):
    """
    Crea pedidos con TODOS los estados garantizados.
    Solo los buyers y admins hacen pedidos.
    """
    print("\n🛒 Seeding pedidos...")
    orders = []
    all_statuses = list(Status)
    all_payments = list(Payment)

    # Solo usuarios no vendedores hacen pedidos
    buyers = [u for u in users if u.role != RoleName.seller]

    # Cola de estados garantizados (cada estado aparece al menos 3 veces)
    status_queue = all_statuses * 3
    random.shuffle(status_queue)

    for user in buyers:
        n_orders = random.randint(3, 6)
        for _ in range(n_orders):
            n_prods = random.randint(1, 4)
            order_products = random.sample(products, min(n_prods, len(products)))

            subtotal    = round(sum(p.price * (1 - p.discount / 100) for p in order_products), 2)
            tax         = round(subtotal * 0.21, 2)
            shipping    = round(random.uniform(3.5, 9.99), 2)
            total_price = round(subtotal + tax + shipping, 2)

            status = status_queue.pop(0) if status_queue else random.choice(all_statuses)

            days_ago = random.randint(1, 30)
            if status == Status.delivered:
                days_ago = random.randint(7, 180)
            elif status == Status.cancelled:
                days_ago = random.randint(1, 90)

            order = Order(
                user_id=user.id,
                subtotal=subtotal,
                tax=tax,
                shipping_cost=shipping,
                total_price=total_price,
                payment_method=random.choice(all_payments),
                status=status,
                created_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
            )
            db.session.add(order)
            db.session.flush()

            for product in order_products:
                db.session.add(OrderDetail(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=random.randint(1, 2),
                ))

            print(f"  [OK]   {user.email} | {status.value:12} | {total_price:.2f}€")
            orders.append(order)

    db.session.flush()
    print(f"\n  Total pedidos: {len(orders)}")

    status_counts = {}
    for o in orders:
        status_counts[o.status.value] = status_counts.get(o.status.value, 0) + 1
    print("\n  Distribución de estados:")
    for s, count in sorted(status_counts.items()):
        print(f"    {s:15} × {count}")

    return orders


def seed_reviews(users, products, orders):
    """Reviews solo para pedidos entregados."""
    print("\n⭐ Seeding reviews...")
    count = 0
    delivered = [o for o in orders if o.status == Status.delivered]

    forced_ratings = [1, 2, 3, 4, 5] * 2
    random.shuffle(forced_ratings)

    for order in delivered:
        details = list(order.order_details)
        for detail in details:
            if random.random() > 0.35:
                exists = Review.query.filter_by(
                    user_id=order.user_id,
                    product_id=detail.product_id,
                    order_id=order.id,
                ).first()
                if exists:
                    continue

                if forced_ratings:
                    rating = forced_ratings.pop(0)
                    review_pool = [r for r in REVIEWS_DATA if r[0] == rating]
                    if not review_pool:
                        review_pool = REVIEWS_DATA
                    chosen = random.choice(review_pool)
                else:
                    chosen = random.choice(REVIEWS_DATA)

                db.session.add(Review(
                    user_id=order.user_id,
                    product_id=detail.product_id,
                    order_id=order.id,
                    rating=chosen[0],
                    title=chosen[1],
                    comment=chosen[2],
                    is_visible=True,
                    created_at=order.created_at + timedelta(days=random.randint(2, 14)),
                ))
                count += 1
                print(f"  [OK]   {'★' * chosen[0]}{'☆' * (5 - chosen[0])} — producto #{detail.product_id}")

    db.session.flush()
    print(f"\n  Total reviews: {count}")


def seed_favorites(users, products):
    print("\n❤️  Seeding favoritos...")
    count = 0
    # Solo buyers tienen favoritos
    buyers = [u for u in users if u.role != RoleName.seller]
    for user in buyers:
        n = random.randint(4, 10)
        fav_pool = random.sample(products, min(n, len(products)))
        for product in fav_pool:
            exists = Favorite.query.filter_by(
                user_id=user.id,
                product_id=product.id,
            ).first()
            if not exists:
                db.session.add(Favorite(user_id=user.id, product_id=product.id))
                count += 1
    db.session.flush()
    print(f"  Total favoritos: {count}")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
def seed_playback_seller_orders(users, products):
    """Crea pedidos específicos para el seller seller@playback.com."""
    print("\n🛒 Seeding pedidos para PlayBack Seller...")

    # Buscar el seller de playback
    playback_user = User.query.filter_by(email="seller@playback.com").first()
    if not playback_user:
        print("  [WARN] seller@playback.com no encontrado")
        return []

    playback_seller = Seller.query.filter_by(user_id=playback_user.id).first()
    if not playback_seller:
        print("  [WARN] Seller profile no encontrado para seller@playback.com")
        return []

    # Productos de este seller
    my_products = [p for p in products if p.seller_id == playback_seller.id]
    if not my_products:
        print("  [WARN] Este seller no tiene productos")
        return []

    # Compradores que harán los pedidos
    buyers = [u for u in users if u.role == RoleName.buyer]

    all_statuses = [Status.confirmed, Status.processing, Status.shipped, Status.delivered, Status.cancelled]
    orders = []

    for i, buyer in enumerate(buyers):
        n_orders = random.randint(1, 3)
        for _ in range(n_orders):
            order_products = random.sample(my_products, min(random.randint(1, 3), len(my_products)))

            subtotal    = round(sum(p.price for p in order_products), 2)
            tax         = round(subtotal * 0.21, 2)
            shipping    = round(random.uniform(3.5, 9.99), 2)
            total_price = round(subtotal + tax + shipping, 2)
            status      = random.choice(all_statuses)

            order = Order(
                user_id=buyer.id,
                subtotal=subtotal,
                tax=tax,
                shipping_cost=shipping,
                total_price=total_price,
                payment_method=random.choice(list(Payment)),
                status=status,
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 120)),
            )
            db.session.add(order)
            db.session.flush()

            for product in order_products:
                db.session.add(OrderDetail(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=random.randint(1, 2),
                ))

            orders.append(order)
            print(f"  [OK]   {buyer.email} → {status.value:12} | {total_price:.2f}€")

    db.session.flush()
    print(f"\n  Total pedidos PlayBack: {len(orders)}")
    return orders
def seed_arantxa_orders(users, products):
    print("\n🛒 Seeding pedidos para Arantxa...")

    arantxa_user = User.query.filter_by(email="pro.arantxa.ordoyo@gmail.com").first()
    if not arantxa_user:
        print("  [WARN] pro.arantxa.ordoyo@gmail.com no encontrado")
        return []

    arantxa_seller = Seller.query.filter_by(user_id=arantxa_user.id).first()
    if not arantxa_seller:
        print("  [WARN] Seller profile no encontrado")
        return []

    my_products = [p for p in products if p.seller_id == arantxa_seller.id]
    if not my_products:
        print("  [WARN] Sin productos para Arantxa")
        return []

    buyers = [u for u in users if u.role == RoleName.buyer]
    all_statuses = [Status.confirmed, Status.processing, Status.shipped, Status.delivered, Status.cancelled]
    orders = []

    for buyer in buyers:
        for _ in range(random.randint(1, 3)):
            order_products = random.sample(my_products, min(random.randint(1, 3), len(my_products)))
            subtotal    = round(sum(p.price for p in order_products), 2)
            tax         = round(subtotal * 0.21, 2)
            shipping    = round(random.uniform(3.5, 9.99), 2)
            total_price = round(subtotal + tax + shipping, 2)
            status      = random.choice(all_statuses)

            order = Order(
                user_id=buyer.id,
                subtotal=subtotal, tax=tax,
                shipping_cost=shipping, total_price=total_price,
                payment_method=random.choice(list(Payment)),
                status=status,
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 120)),
            )
            db.session.add(order)
            db.session.flush()

            for p in order_products:
                db.session.add(OrderDetail(order_id=order.id, product_id=p.id, quantity=random.randint(1, 2)))

            orders.append(order)
            print(f"  [OK]   {buyer.email} → {status.value} | {total_price:.2f}€")

    db.session.flush()
    print(f"  Total: {len(orders)} pedidos")
    return orders

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed de datos de prueba")
    parser.add_argument("--reset", action="store_true", help="Borrar datos existentes antes de insertar")
    args = parser.parse_args()

    with app.app_context():
        print("🌱 Iniciando seed de datos de prueba...\n")
        try:
            if args.reset:
                reset_data()

            users    = seed_users()
            sellers  = seed_sellers()
            products = seed_products(sellers)

            if not products:
                print("\n⚠️  Sin productos — ejecuta seed_categories.py primero.")
                sys.exit(1)

            orders = seed_orders(users, products)
            seed_playback_seller_orders(users, products) 
            seed_arantxa_orders(users, products)
            seed_reviews(users, products, orders)
            seed_favorites(users, products)

            db.session.commit()

            print("\n" + "═" * 50)
            print("✅ Seed completado con éxito.")
            print("═" * 50)
            print(f"\n  👤 Usuarios:   {len(users)}")
            print(f"  🏪 Vendedores: {len(sellers)}")
            print(f"  📦 Productos:  {len(products)}")
            print(f"  🛒 Pedidos:    {len(orders)}")
            print(f"\n📋 Credenciales:")
            for u in USERS_DATA:
                print(f"   {u['email']:30} / {u['password']:12} [{u.get('role', 'buyer')}]")

        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Error: {e}")
            raise