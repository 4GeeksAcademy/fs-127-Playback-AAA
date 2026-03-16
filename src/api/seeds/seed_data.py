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
from api.models.address import Address
from api.models.shipment import Shipment
from api.models.incident import Incident


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
        "status": "verified",
        "stripe_account_id": "acct_1T9rsRC9ziS9X0PW",
				"stripe_onboarding_completed": True,
    },
    {
        "email": "pro.arantxa.ordoyo@gmail.com",
        "store_name": "ArantxaTienda",
        "description": "Tienda oficial de PlayBack.",
        "logo_url": "https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Arantxa+Tienda",
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
        "name": "NES Classic",
        "name_en": "Classic NES",
        "name_ca": "NES Classic",
        "name_gl": "NES Classic",
        "description": "NES en perfecto estado con mando.",
        "description_en": "NES in perfect condition with controller.",
        "description_ca": "NES en perfecte estat amb comandament.",
        "description_gl": "NES en perfecto estado con mando.",
        "price": 79.99,
        "stock": 3,
        "discount": 0.0,
        "condition": "used",
        "item_slug": "nes",
        "image_url": "https://m.media-amazon.com/images/I/71YTum90-lL.jpg",
        "seller_email": "pro.arantxa.ordoyo@gmail.com"
    },
    {
        "name": "Vinilo Led Zeppelin IV",
        "name_en": " Led Zeppelin IV Vinyl",
        "name_ca": "Vinil Led Zeppelin IV",
        "name_gl": "Vinilo Led Zeppelin IV",
        "description": "Led Zeppelin IV edición original.",
        "description_en": "Led Zeppelin IV original edition.",
        "description_ca": "Led Zeppelin IV edició original.",
        "description_gl": "Led Zeppelin IV edición orixinal.",
        "price": 42.00,
        "stock": 2,
        "discount": 10.0,
        "condition": "used",
        "item_slug": "discos-de-vinilo",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2019/10/Led-Zeppelin-1200x1200.png",
        "seller_email": "pro.arantxa.ordoyo@gmail.com"
    },
    {
        "name": "Game Boy DMG",
        "name_en": "Game Boy DMG",
        "name_ca": "Game Boy DMG",
        "name_gl": "Game Boy DMG",
        "description": "Game Boy original DMG funcionando.",
        "description_en": "Working original DMG Game Boy.",
        "description_ca": "Game Boy original DMG funcionant.",
        "description_gl": "Game Boy orixinal DMG funcionando.",
        "price": 52.00,
        "stock": 4,
        "discount": 0.0,
        "condition": "used",
        "item_slug": "game-boy",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Game-Boy-FL.png/1280px-Game-Boy-FL.png",
        "seller_email": "pro.arantxa.ordoyo@gmail.com"
    },
    {
        "name": "Nokia 3310",
        "name_en": "Nokia 3310",
        "name_ca": "Nokia 3310",
        "name_gl": "Nokia 3310",
        "description": "Nokia 3310 azul con batería nueva.",
        "description_en": "Blue Nokia 3310 with new battery.",
        "description_ca": "Nokia 3310 blau amb bateria nova.",
        "description_gl": "Nokia 3310 azul con batería nova.",
        "price": 32.00,
        "stock": 5,
        "discount": 0.0,
        "condition": "used",
        "item_slug": "moviles-antiguos",
        "image_url": "https://vintagemobile.fr/cdn/shop/files/Nokia-3310-Vintage-Mobile-777.jpg",
        "seller_email": "pro.arantxa.ordoyo@gmail.com"
    },
    {
        "name": "Walkman Sony",
        "name_en": "Sony Walkman",
        "name_ca": "Walkman Sony",
        "name_gl": "Walkman Sony",
        "description": "Walkman Sony con radio FM.",
        "description_en": "Sony Walkman with FM radio.",
        "description_ca": "Walkman Sony amb ràdio FM.",
        "description_gl": "Walkman Sony con radio FM.",
        "price": 38.00,
        "stock": 3,
        "discount": 5.0,
        "condition": "used",
        "item_slug": "walkman",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_UePqDF2twZgFm7ZVbr8sHs39o4Jjx22Ag&s",
        "seller_email": "pro.arantxa.ordoyo@gmail.com"
    },
    
    # ── CONSOLAS › Nintendo Clásica ── nes ─────────────────────────────────────
    {
        "name": "NES Classic Edition",
        "name_en": "NES Classic Edition",
        "name_ca": "NES Classic Edition",
        "name_gl": "NES Classic Edition",
        "description": "NES en perfecto estado con mando original y cables.",
        "description_en": "NES in perfect condition with original controller and cables.",
        "description_ca": "NES en perfecte estat amb comandament original i cables.",
        "description_gl": "NES en perfecto estado con mando orixinal e cables.",
        "price": 89.99, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "nes",
        "image_url": "https://m.media-amazon.com/images/I/71YTum90-lL.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "NES con 10 juegos",
        "name_en": "NES with 10 games",
        "name_ca": "NES amb 10 jocs",
        "name_gl": "NES con 10 xogos",
        "description": "Pack NES con 10 cartuchos en buen estado.",
        "description_en": "NES bundle with 10 cartridges in good condition.",
        "description_ca": "Pack NES amb 10 cartutxos en bon estat.",
        "description_gl": "Pack NES con 10 cartuchos en bo estado.",
        "price": 140.00, "stock": 2, "discount": 10.0, "condition": "used",
        "item_slug": "nes",
        "image_url": "https://hardzone.es/app/uploads-hardzone.es/2023/06/nes-nintendo.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── snes ───────────────────────────────────────────────────────────────────
    {
        "name": "SNES con Super Mario World",
        "name_en": "SNES with Super Mario World",
        "name_ca": "SNES amb Super Mario World",
        "name_gl": "SNES con Super Mario World",
        "description": "Super Nintendo con cartucho de Super Mario World incluido.",
        "description_en": "Super Nintendo with Super Mario World cartridge included.",
        "description_ca": "Super Nintendo amb cartutx de Super Mario World inclòs.",
        "description_gl": "Super Nintendo con cartucho de Super Mario World incluído.",
        "price": 120.00, "stock": 3, "discount": 10.0, "condition": "used",
        "item_slug": "snes",
        "image_url": "https://m.media-amazon.com/images/I/51JgQtlGh8L._AC_UF894,1000_QL80_.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "SNES Reacondicionada",
        "name_en": "SNES Refurbished",
        "name_ca": "SNES Recondicionada",
        "name_gl": "SNES Reacondicionada",
        "description": "SNES revisada y limpiada, funciona como nueva.",
        "description_en": "SNES serviced and cleaned, works like new.",
        "description_ca": "SNES revisada i netejada, funciona com a nova.",
        "description_gl": "SNES revisada e limpa, funciona como nova.",
        "price": 95.00, "stock": 4, "discount": 0.0, "condition": "refurbished",
        "item_slug": "snes",
        "image_url": "https://cdn-products.eneba.com/resized-products/e54c7018578b11edbcec929548667aa2_350x200_1x-0",
        "seller_email": "carlos@test.com",
    },

    # ── nintendo-64 ────────────────────────────────────────────────────────────
    {
        "name": "Nintendo 64 Gris",
        "name_en": "Nintendo 64 Grey",
        "name_ca": "Nintendo 64 Gris",
        "name_gl": "Nintendo 64 Gris",
        "description": "N64 con mando y cables originales.",
        "description_en": "N64 with original controller and cables.",
        "description_ca": "N64 amb comandament i cables originals.",
        "description_gl": "N64 con mando e cables orixinais.",
        "price": 110.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "nintendo-64",
        "image_url": "https://i.blogs.es/bfd715/n64/450_1000.png",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Nintendo 64 con Expansion Pak",
        "name_en": "Nintendo 64 with Expansion Pak",
        "name_ca": "Nintendo 64 amb Expansion Pak",
        "name_gl": "Nintendo 64 con Expansion Pak",
        "description": "N64 con Expansion Pak y mando, lista para Majora's Mask.",
        "description_en": "N64 with Expansion Pak and controller, ready for Majora's Mask.",
        "description_ca": "N64 amb Expansion Pak i comandament, llesta per a Majora's Mask.",
        "description_gl": "N64 con Expansion Pak e mando, lista para Majora's Mask.",
        "price": 135.00, "stock": 2, "discount": 5.0, "condition": "used",
        "item_slug": "nintendo-64",
        "image_url": "https://cdn.wallapop.com/images/10420/dc/bp/__/c10420p806762443/i3050428381.jpg?pictureSize=W640",
        "seller_email": "carlos@test.com",
    },
    # ── gamecube ──────────────────────────────────────────────────────────────
    {
        "name": "GameCube Plateada",
        "name_en": "Silver GameCube",
        "name_ca": "GameCube Plateada",
        "name_gl": "GameCube Prateada",
        "description": "GameCube en color plateado con mando morado.",
        "description_en": "Silver GameCube with purple controller.",
        "description_ca": "GameCube en color platejat amb comandament morat.",
        "description_gl": "GameCube en cor prateado con mando morado.",
        "price": 130.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "gamecube",
        "image_url": "https://media2.gameplaystores.es/74876-large_default/gamecube-plateada-mando-sin-caja-gc.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "GameCube Negra con Lector Roto",
        "name_en": "Black GameCube Broken Reader",
        "name_ca": "GameCube Negra amb Lector Trencat",
        "name_gl": "GameCube Negra con Lector Roto",
        "description": "GameCube negra, el lector no lee discos. Ideal para piezas.",
        "description_en": "Black GameCube, disc reader not working. For parts.",
        "description_ca": "GameCube negra, el lector no llegeix discos. Ideal per a peces.",
        "description_gl": "GameCube negra, o lector non le discos. Ideal para pezas.",
        "price": 25.00, "stock": 1, "discount": 0.0, "condition": "broken",
        "item_slug": "gamecube",
        "image_url": "https://media.gameplaystores.es/99746-large_default/gamecube-negra-sin-mando-con-caja-.jpg",
        "seller_email": "carlos@test.com",
    },
    # ── game-boy ───────────────────────────────────────────────────────────────
    {
        "name": "Game Boy Original DMG",
        "name_en": "Original Game Boy DMG",
        "name_ca": "Game Boy Original DMG",
        "name_gl": "Game Boy Orixinal DMG",
        "description": "Game Boy original modelo DMG con carcasa gris.",
        "description_en": "Original Game Boy DMG model with grey shell.",
        "description_ca": "Game Boy original model DMG amb carcassa grisa.",
        "description_gl": "Game Boy orixinal modelo DMG con carcasa gris.",
        "price": 55.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "game-boy",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Game-Boy-FL.png/1280px-Game-Boy-FL.png",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Game Boy Color Morada",
        "name_en": "Purple Game Boy Color",
        "name_ca": "Game Boy Color Morada",
        "name_gl": "Game Boy Color Morada",
        "description": "Game Boy Color en morado translúcido, estado impecable.",
        "description_en": "Translucent purple Game Boy Color, impeccable condition.",
        "description_ca": "Game Boy Color en morat translúcid, estat impecable.",
        "description_gl": "Game Boy Color en morado translúcido, estado impecable.",
        "price": 70.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "game-boy",
        "image_url": "https://www.todoconsolas.com/344840-large_default/game_boy_color_violeta_po215947.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── game-boy-advance ───────────────────────────────────────────────────────
    {
        "name": "Game Boy Advance SP Azul",
        "name_en": "Blue Game Boy Advance SP",
        "name_ca": "Game Boy Advance SP Blau",
        "name_gl": "Game Boy Advance SP Azul",
        "description": "GBA SP con pantalla retroiluminada y cargador original.",
        "description_en": "GBA SP with backlit screen and original charger.",
        "description_ca": "GBA SP amb pantalla retroil·luminada i carregador original.",
        "description_gl": "GBA SP con pantalla retroiluminada e cargador orixinal.",
        "price": 95.00, "stock": 3, "discount": 5.0, "condition": "used",
        "item_slug": "game-boy-advance",
        "image_url": "https://m.media-amazon.com/images/I/61hNR9cWhZL.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Game Boy Advance Transparente",
        "name_en": "Transparent Game Boy Advance",
        "name_ca": "Game Boy Advance Transparent",
        "name_gl": "Game Boy Advance Transparente",
        "description": "GBA carcasa transparente reacondicionada.",
        "description_en": "Refurbished GBA with transparent shell.",
        "description_ca": "GBA carcassa transparent recondicionada.",
        "description_gl": "GBA carcasa transparente reacondicionada.",
        "price": 60.00, "stock": 2, "discount": 0.0, "condition": "refurbished",
        "item_slug": "game-boy-advance",
        "image_url": "https://bucket.stash.cl/images/3404_1914_154deadc-0a18-4bc1-bc99-2e8751fe96ec_game_boy_advance(_transparente).webp",
        "seller_email": "carlos@test.com",
    },

    # ── accesorios ────────────────────────────────────────────────────────────
    {
        "name": "Mando NES Original",
        "name_en": "Original NES Controller",
        "name_ca": "Comandament NES Original",
        "name_gl": "Mando NES Orixinal",
        "description": "Mando NES original en buen estado de funcionamiento.",
        "description_en": "Original NES controller in good working condition.",
        "description_ca": "Comandament NES original en bon estat de funcionament.",
        "description_gl": "Mando NES orixinal en bo estado de funcionamento.",
        "price": 12.00, "stock": 10, "discount": 0.0, "condition": "used",
        "item_slug": "accesorios",
        "image_url": "https://www.videojuegoshoracio.com/public/IMG_4990.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Pack Mandos SNES x2",
        "name_en": "SNES Controller Pack x2",
        "name_ca": "Pack Comandaments SNES x2",
        "name_gl": "Pack Mandos SNES x2",
        "description": "Dos mandos originales de SNES en perfecto estado.",
        "description_en": "Two original SNES controllers in perfect condition.",
        "description_ca": "Dos comandaments originals de SNES en perfecte estat.",
        "description_gl": "Dous mandos orixinais de SNES en perfecto estado.",
        "price": 20.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "accesorios",
        "image_url": "https://elblogdemanu.com/adaptador-de-mandos-de-snes-a-usb/a2.webp",
        "seller_email": "carlos@test.com",
    },

    # ── otros-nintendo-clasica ─────────────────────────────────────────────────
    {
        "name": "Virtual Boy con Stand",
        "name_en": "Virtual Boy with Stand",
        "name_ca": "Virtual Boy amb Suport",
        "name_gl": "Virtual Boy con Soporte",
        "description": "Virtual Boy de Nintendo con stand y mando original.",
        "description_en": "Nintendo Virtual Boy with stand and original controller.",
        "description_ca": "Virtual Boy de Nintendo amb suport i comandament original.",
        "description_gl": "Virtual Boy de Nintendo con soporte e mando orixinal.",
        "price": 180.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-nintendo-clasica",
        "image_url": "https://files.virtual-boy.com/vb-stand-hack-scaled.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── CONSOLAS › SEGA ───────────────────────────────────────────────────────
    {
        "name": "Sega Master System II",
        "name_en": "Sega Master System II",
        "name_ca": "Sega Master System II",
        "name_gl": "Sega Master System II",
        "description": "Master System II con Alex Kidd integrado.",
        "description_en": "Master System II with built-in Alex Kidd.",
        "description_ca": "Master System II amb Alex Kidd integrat.",
        "description_gl": "Master System II con Alex Kidd integrado.",
        "price": 60.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "master-system",
        "image_url": "https://guide-images.cdn.ifixit.com/igi/UxsSanKSYPneQ6Ge.large",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mega Drive II",
        "name_en": "Mega Drive II",
        "name_ca": "Mega Drive II",
        "name_gl": "Mega Drive II",
        "description": "Mega Drive II con dos mandos y cable AV.",
        "description_en": "Mega Drive II with two controllers and AV cable.",
        "description_ca": "Mega Drive II amb dos comandaments i cable AV.",
        "description_gl": "Mega Drive II con dous mandos e cable AV.",
        "price": 75.00, "stock": 4, "discount": 5.0, "condition": "used",
        "item_slug": "mega-drive",
        "image_url": "https://www.museodelvideojuego.com/files/imgs/consolas/Mega-Drive-II-caja.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mega Drive Sin Cables (Piezas)",
        "name_en": "Mega Drive No Cables (Parts)",
        "name_ca": "Mega Drive Sense Cables (Peces)",
        "name_gl": "Mega Drive Sen Cables (Pezas)",
        "description": "Mega Drive primera versión sin cables ni mandos. Para piezas.",
        "description_en": "First version Mega Drive, no cables or controllers. For parts.",
        "description_ca": "Mega Drive primera versió sense cables ni comandaments. Per a peces.",
        "description_gl": "Mega Drive primeira versión sen cables nin mandos. Para pezas.",
        "price": 20.00, "stock": 2, "discount": 0.0, "condition": "broken",
        "item_slug": "mega-drive",
        "image_url": "https://media2.gameplaystores.es/72316-thickbox_default/megadrive-mando-sin-caja-.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Sega Saturn Gris",
        "name_en": "Grey Sega Saturn",
        "name_ca": "Sega Saturn Gris",
        "name_gl": "Sega Saturn Gris",
        "description": "Sega Saturn con mando y fuente de alimentación original.",
        "description_en": "Sega Saturn with original controller and power supply.",
        "description_ca": "Sega Saturn amb comandament i font d'alimentació original.",
        "description_gl": "Sega Saturn con mando e fonte de alimentación orixinal.",
        "price": 120.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "saturn",
        "image_url": "https://media2.gameplaystores.es/103967-large_default/controller-sega-saturn-gris-transparente-licenciado.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Sega Dreamcast",
        "name_en": "Sega Dreamcast",
        "name_ca": "Sega Dreamcast",
        "name_gl": "Sega Dreamcast",
        "description": "Dreamcast con VMU y mando original, funciona perfectamente.",
        "description_en": "Dreamcast with VMU and original controller, works perfectly.",
        "description_ca": "Dreamcast amb VMU i comandament original, funciona perfectament.",
        "description_gl": "Dreamcast con VMU e mando orixinal, funciona perfectamente.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "dreamcast",
        "image_url": "https://i.blogs.es/5ad1a1/dreamcast_01/650_1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Sega Game Gear Roja",
        "name_en": "Red Sega Game Gear",
        "name_ca": "Sega Game Gear Vermella",
        "name_gl": "Sega Game Gear Vermella",
        "description": "Game Gear en rojo con pantalla en perfecto estado.",
        "description_en": "Red Game Gear with screen in perfect condition.",
        "description_ca": "Game Gear en vermell amb pantalla en perfecte estat.",
        "description_gl": "Game Gear en vermello con pantalla en perfecto estado.",
        "price": 65.00, "stock": 3, "discount": 10.0, "condition": "used",
        "item_slug": "game-gear",
        "image_url": "https://www.japanzon.com/24351-product_hd/sega-game-gear-micro-rojo.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Game Gear Reacondicionada",
        "name_en": "Refurbished Game Gear",
        "name_ca": "Game Gear Recondicionada",
        "name_gl": "Game Gear Reacondicionada",
        "description": "Game Gear revisada con condensadores nuevos.",
        "description_en": "Game Gear with new capacitors, perfect screen.",
        "description_ca": "Game Gear revisada amb condensadors nous.",
        "description_gl": "Game Gear revisada con condensadores novos.",
        "price": 85.00, "stock": 2, "discount": 0.0, "condition": "refurbished",
        "item_slug": "game-gear",
        "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Sega-Game-Gear-WB.png/500px-Sega-Game-Gear-WB.png",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Sega Pico (Consola Infantil)",
        "name_en": "Sega Pico (Kids Console)",
        "name_ca": "Sega Pico (Consola Infantil)",
        "name_gl": "Sega Pico (Consola Infantil)",
        "description": "Sega Pico, la consola educativa de Sega para niños.",
        "description_en": "Sega Pico, the educational console for kids.",
        "description_ca": "Sega Pico, la consola educativa de Sega per a nens.",
        "description_gl": "Sega Pico, a consola educativa de Sega para nenos.",
        "price": 40.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "otros-sega",
        "image_url": "https://images.wikidexcdn.net/mwuploads/wikidex/0/0b/latest/20130315195556/Sega_Pico.jpg",
        "seller_email": "alex@test.com",
    },

    # ── CONSOLAS › PlayStation y Xbox ─────────────────────────────────────────
    {
        "name": "PlayStation 1 PAL",
        "name_en": "PlayStation 1 PAL",
        "name_ca": "PlayStation 1 PAL",
        "name_gl": "PlayStation 1 PAL",
        "description": "PS1 PAL en buen estado con memory card original.",
        "description_en": "PAL PS1 in good condition with original memory card.",
        "description_ca": "PS1 PAL en bon estat amb memory card original.",
        "description_gl": "PS1 PAL en bo estado con memory card orixinal.",
        "price": 65.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "ps1",
        "image_url": "https://m.media-amazon.com/images/I/71TCoWMwK+L.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "PlayStation 1 Reacondicionada",
        "name_en": "Refurbished PlayStation 1",
        "name_ca": "PlayStation 1 Recondicionada",
        "name_gl": "PlayStation 1 Reacondicionada",
        "description": "PS1 revisada, lector limpiado y testado, garantía 3 meses.",
        "description_en": "Serviced PS1, cleaned and tested reader, 3-month warranty.",
        "description_ca": "PS1 revisada, lector netejat i testat, garantia 3 mesos.",
        "description_gl": "PS1 revisada, lector limpado e testado, garantía 3 meses.",
        "price": 80.00, "stock": 3, "discount": 0.0, "condition": "refurbished",
        "item_slug": "ps1",
        "image_url": "https://tresubresdobles.com/wp-content/uploads/2020/08/restaurando-una-playstation-ps1-p9N7AEZnhp8.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "PlayStation 2 Slim Negra",
        "name_en": "Black PlayStation 2 Slim",
        "name_ca": "PlayStation 2 Slim Negra",
        "name_gl": "PlayStation 2 Slim Negra",
        "description": "PS2 Slim en negro con dos mandos DualShock 2.",
        "description_en": "Black PS2 Slim with two DualShock 2 controllers.",
        "description_ca": "PS2 Slim en negre amb dos comandaments DualShock 2.",
        "description_gl": "PS2 Slim en negro con dous mandos DualShock 2.",
        "price": 85.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "ps2",
        "image_url": "https://d2e6ccujb3mkqf.cloudfront.net/2eb54452-73ab-4cc2-83ce-dece99b9a1f9-1_959ca981-d879-41b7-807e-204efb73d96d.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "PSP 3000 Blanca",
        "name_en": "White PSP 3000",
        "name_ca": "PSP 3000 Blanca",
        "name_gl": "PSP 3000 Branca",
        "description": "PSP 3000 en blanco con funda y cargador.",
        "description_en": "White PSP 3000 with case and charger.",
        "description_ca": "PSP 3000 en blanc amb funda i carregador.",
        "description_gl": "PSP 3000 en branco con funda e cargador.",
        "price": 80.00, "stock": 5, "discount": 5.0, "condition": "used",
        "item_slug": "psp",
        "image_url": "https://www.todoconsolas.com/186979-medium_default/psp_3000_blanca_po152723.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "PSP sin Pantalla (Piezas)",
        "name_en": "PSP No Screen (Parts)",
        "name_ca": "PSP sense Pantalla (Peces)",
        "name_gl": "PSP sen Pantalla (Pezas)",
        "description": "PSP 2000 con pantalla rota, resto funciona.",
        "description_en": "PSP 2000 with broken screen, rest works. For parts.",
        "description_ca": "PSP 2000 amb pantalla trencada, la resta funciona.",
        "description_gl": "PSP 2000 con pantalla rota, o resto funciona.",
        "price": 15.00, "stock": 2, "discount": 0.0, "condition": "broken",
        "item_slug": "psp",
        "image_url": "https://m.media-amazon.com/images/I/51CbBOgUaGL.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Xbox Clásica Negra",
        "name_en": "Classic Black Xbox",
        "name_ca": "Xbox Clàssica Negra",
        "name_gl": "Xbox Clásica Negra",
        "description": "Xbox original con mando Duke y cables.",
        "description_en": "Original Xbox with Duke controller and cables.",
        "description_ca": "Xbox original amb comandament Duke i cables.",
        "description_gl": "Xbox orixinal con mando Duke e cables.",
        "price": 70.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "xbox",
        "image_url": "https://i.blogs.es/f65b01/xbox-original/650_1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mando DualShock 2 Azul",
        "name_en": "Blue DualShock 2 Controller",
        "name_ca": "Comandament DualShock 2 Blau",
        "name_gl": "Mando DualShock 2 Azul",
        "description": "Mando DualShock 2 en color azul para PS2.",
        "description_en": "Blue DualShock 2 controller for PS2.",
        "description_ca": "Comandament DualShock 2 en color blau per a PS2.",
        "description_gl": "Mando DualShock 2 en cor azul para PS2.",
        "price": 18.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "otros-playstation-xbox",
        "image_url": "https://cdn-products.eneba.com/resized-products/fd16264003f711ed96e2c68b8d5107b0_350x200_1x-0",
        "seller_email": "alex@test.com",
    },

    # ── CONSOLAS › Otras Consolas ──────────────────────────────────────────────
    {
        "name": "Atari 2600",
        "name_en": "Atari 2600",
        "name_ca": "Atari 2600",
        "name_gl": "Atari 2600",
        "description": "Atari 2600 con joystick original y 5 cartuchos.",
        "description_en": "Atari 2600 with original joystick and 5 cartridges.",
        "description_ca": "Atari 2600 amb joystick original i 5 cartutxos.",
        "description_gl": "Atari 2600 con joystick orixinal e 5 cartuchos.",
        "price": 85.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "atari",
        "image_url": "https://sm.ign.com/ign_latam/gallery/a/atari-2600/atari-2600-images_pyet.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Neo Geo Pocket Color",
        "name_en": "Neo Geo Pocket Color",
        "name_ca": "Neo Geo Pocket Color",
        "name_gl": "Neo Geo Pocket Color",
        "description": "Neo Geo Pocket Color en estado excelente con 3 juegos.",
        "description_en": "Neo Geo Pocket Color in excellent condition with 3 games.",
        "description_ca": "Neo Geo Pocket Color en estat excel·lent amb 3 jocs.",
        "description_gl": "Neo Geo Pocket Color en estado excelente con 3 xogos.",
        "price": 150.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "neo-geo",
        "image_url": "https://i.ebayimg.com/images/g/YWYAAOSwQrBj-Uvw/s-l1600.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "NEC PC Engine",
        "name_en": "NEC PC Engine",
        "name_ca": "NEC PC Engine",
        "name_gl": "NEC PC Engine",
        "description": "PC Engine con Hu-Card de PC Denjin.",
        "description_en": "PC Engine with PC Denjin Hu-Card.",
        "description_ca": "PC Engine amb Hu-Card de PC Denjin.",
        "description_gl": "PC Engine con Hu-Card de PC Denjin.",
        "price": 130.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "pc-engine",
        "image_url": "https://i0.wp.com/retromaquinitas.com/wp-content/uploads/2023/05/P7270042.jpg?resize=1160%2C653&ssl=1",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Commodore 64 con Datasette",
        "name_en": "Commodore 64 with Datasette",
        "name_ca": "Commodore 64 amb Datasette",
        "name_gl": "Commodore 64 con Datasette",
        "description": "C64 con datasette y joystick, funciona perfectamente.",
        "description_en": "C64 with datasette and joystick, works perfectly.",
        "description_ca": "C64 amb datasette i joystick, funciona perfectament.",
        "description_gl": "C64 con datasette e joystick, funciona perfectamente.",
        "price": 120.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "commodore-64",
        "image_url": "http://vintagecomputer.com/wp-content/uploads/2012/01/commodore-datasette.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Amstrad CPC 464",
        "name_en": "Amstrad CPC 464",
        "name_ca": "Amstrad CPC 464",
        "name_gl": "Amstrad CPC 464",
        "description": "Amstrad CPC 464 con monitor color y datasette integrado.",
        "description_en": "Amstrad CPC 464 with color monitor and built-in datasette.",
        "description_ca": "Amstrad CPC 464 amb monitor color i datasette integrat.",
        "description_gl": "Amstrad CPC 464 con monitor cor e datasette integrado.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "amstrad",
        "image_url": "https://i0.wp.com/auamstrad.es/wp-content/uploads/2018/12/464.png",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Magnavox Odyssey",
        "name_en": "Magnavox Odyssey",
        "name_ca": "Magnavox Odyssey",
        "name_gl": "Magnavox Odyssey",
        "description": "La primera consola doméstica de la historia.",
        "description_en": "The first home console in history.",
        "description_ca": "La primera consola domèstica de la història.",
        "description_gl": "A primeira consola doméstica da historia.",
        "price": 200.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-otras-consolas",
        "image_url": "https://i.3dmodels.org/uploads/preorder/magnavox_odyssey_1972_/magnavox_odyssey_1972__1000_0001.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── VIDEOJUEGOS › Cartucho ─────────────────────────────────────────────────
    {
        "name": "Super Mario Bros 3 NES",
        "name_en": "Super Mario Bros 3 NES",
        "name_ca": "Super Mario Bros 3 NES",
        "name_gl": "Super Mario Bros 3 NES",
        "description": "Cartucho original Super Mario Bros 3 para NES.",
        "description_en": "Original Super Mario Bros 3 NES cartridge.",
        "description_ca": "Cartutx original Super Mario Bros 3 per a NES.",
        "description_gl": "Cartucho orixinal Super Mario Bros 3 para NES.",
        "price": 45.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-nes",
        "image_url": "https://www.todoconsolas.com/308618-medium_default/super_mario_bros_3_nes_sp_po8443.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mega Man 2 NES",
        "name_en": "Mega Man 2 NES",
        "name_ca": "Mega Man 2 NES",
        "name_gl": "Mega Man 2 NES",
        "description": "Mega Man 2 cartucho PAL para NES, muy buen estado.",
        "description_en": "Mega Man 2 PAL cartridge for NES, very good condition.",
        "description_ca": "Mega Man 2 cartutx PAL per a NES, molt bon estat.",
        "description_gl": "Mega Man 2 cartucho PAL para NES, moi bo estado.",
        "price": 38.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-nes",
        "image_url": "https://www.elconsolas.cl/wp-content/uploads/2021/01/mega-man-2-02.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Zelda A Link to the Past SNES",
        "name_en": "Zelda A Link to the Past SNES",
        "name_ca": "Zelda A Link to the Past SNES",
        "name_gl": "Zelda A Link to the Past SNES",
        "description": "The Legend of Zelda A Link to the Past cartucho PAL.",
        "description_en": "The Legend of Zelda A Link to the Past PAL cartridge.",
        "description_ca": "The Legend of Zelda A Link to the Past cartutx PAL.",
        "description_gl": "The Legend of Zelda A Link to the Past cartucho PAL.",
        "price": 55.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-snes",
        "image_url": "https://cdn11.bigcommerce.com/s-ymgqt/images/stencil/1000w/products/26452/33322/Legend-of-Zelda-A-Link-To-t__89317.1712937460.jpg?c=2",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Donkey Kong Country SNES",
        "name_en": "Donkey Kong Country SNES",
        "name_ca": "Donkey Kong Country SNES",
        "name_gl": "Donkey Kong Country SNES",
        "description": "Donkey Kong Country cartucho PAL SNES, estado muy bueno.",
        "description_en": "Donkey Kong Country PAL SNES cartridge, very good condition.",
        "description_ca": "Donkey Kong Country cartutx PAL SNES, estat molt bo.",
        "description_gl": "Donkey Kong Country cartucho PAL SNES, estado moi bo.",
        "price": 35.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-snes",
        "image_url": "https://http2.mlstatic.com/D_NQ_NP_606378-MLU78257877346_082024-O.webp",
        "seller_email": "alex@test.com",
    },
    {
        "name": "GoldenEye 007 N64",
        "name_en": "GoldenEye 007 N64",
        "name_ca": "GoldenEye 007 N64",
        "name_gl": "GoldenEye 007 N64",
        "description": "GoldenEye 007 cartucho original para Nintendo 64.",
        "description_en": "GoldenEye 007 original cartridge for Nintendo 64.",
        "description_ca": "GoldenEye 007 cartutx original per a Nintendo 64.",
        "description_gl": "GoldenEye 007 cartucho orixinal para Nintendo 64.",
        "price": 50.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-nintendo-64",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPo0fYRIsSTEYir_VND0m40qs6Oc2kdggSDg&s",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Super Mario 64",
        "name_en": "Super Mario 64",
        "name_ca": "Super Mario 64",
        "name_gl": "Super Mario 64",
        "description": "Super Mario 64 cartucho original PAL N64.",
        "description_en": "Super Mario 64 original PAL N64 cartridge.",
        "description_ca": "Super Mario 64 cartutx original PAL N64.",
        "description_gl": "Super Mario 64 cartucho orixinal PAL N64.",
        "price": 45.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-nintendo-64",
        "image_url": "https://static.wikia.nocookie.net/mario64hacks/images/9/9a/SMB3D.png/revision/latest?cb=20180429184218",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Sonic the Hedgehog Mega Drive",
        "name_en": "Sonic the Hedgehog Mega Drive",
        "name_ca": "Sonic the Hedgehog Mega Drive",
        "name_gl": "Sonic the Hedgehog Mega Drive",
        "description": "Sonic 1 cartucho original para Mega Drive, completo con caja.",
        "description_en": "Sonic 1 original cartridge for Mega Drive, complete with box.",
        "description_ca": "Sonic 1 cartutx original per a Mega Drive, complet amb caixa.",
        "description_gl": "Sonic 1 cartucho orixinal para Mega Drive, completo con caixa.",
        "price": 40.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-mega-drive",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROg9k-9v7OYh9H9bwlun7oh7n9pyqI_bcq9Q&s",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Streets of Rage 2 Mega Drive",
        "name_en": "Streets of Rage 2 Mega Drive",
        "name_ca": "Streets of Rage 2 Mega Drive",
        "name_gl": "Streets of Rage 2 Mega Drive",
        "description": "Streets of Rage 2 cartucho Mega Drive PAL, buen estado.",
        "description_en": "Streets of Rage 2 Mega Drive PAL cartridge, good condition.",
        "description_ca": "Streets of Rage 2 cartutx Mega Drive PAL, bon estat.",
        "description_gl": "Streets of Rage 2 cartucho Mega Drive PAL, bo estado.",
        "price": 35.00, "stock": 3, "discount": 15.0, "condition": "used",
        "item_slug": "juegos-mega-drive",
        "image_url": "https://http2.mlstatic.com/D_NQ_NP_822592-MLB44888916938_022021-O.webp",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Pokémon Edición Roja",
        "name_en": "Pokémon Red Edition",
        "name_ca": "Pokémon Edició Roja",
        "name_gl": "Pokémon Edición Vermella",
        "description": "Cartucho original de Pokémon Rojo para Game Boy.",
        "description_en": "Original Pokémon Red cartridge for Game Boy.",
        "description_ca": "Cartutx original de Pokémon Vermell per a Game Boy.",
        "description_gl": "Cartucho orixinal de Pokémon Vermello para Game Boy.",
        "price": 35.00, "stock": 7, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-game-boy",
        "image_url": "https://media2.gameplaystores.es/77648-large_default/pokemon-rojo-cartucho-gb.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Pokémon Edición Azul",
        "name_en": "Pokémon Blue Edition",
        "name_ca": "Pokémon Edició Blava",
        "name_gl": "Pokémon Edición Azul",
        "description": "Cartucho original Pokémon Azul Game Boy, batería funcional.",
        "description_en": "Original Pokémon Blue Game Boy cartridge, working battery.",
        "description_ca": "Cartutx original Pokémon Blau Game Boy, bateria funcional.",
        "description_gl": "Cartucho orixinal Pokémon Azul Game Boy, batería funcional.",
        "price": 33.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-game-boy",
        "image_url": "https://media2.gameplaystores.es/77646-large_default/pokemon-azul-cartucho-gb.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Tetris Game Boy",
        "name_en": "Tetris Game Boy",
        "name_ca": "Tetris Game Boy",
        "name_gl": "Tetris Game Boy",
        "description": "Tetris original para Game Boy, el clásico de los clásicos.",
        "description_en": "Original Tetris for Game Boy.",
        "description_ca": "Tetris original per a Game Boy, el clàssic dels clàssics.",
        "description_gl": "Tetris orixinal para Game Boy, o clásico dos clásicos.",
        "price": 15.00, "stock": 10, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-game-boy",
        "image_url": "https://sm.ign.com/t/ign_es/cover/t/tetris-gam/tetris-game-boy_9x5h.300.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Lote 20 Cartuchos Variados",
        "name_en": "Lot of 20 Mixed Cartridges",
        "name_ca": "Lot 20 Cartutxos Variats",
        "name_gl": "Lote 20 Cartuchos Variados",
        "description": "Lote de 20 cartuchos para diferentes consolas.",
        "description_en": "Lot of 20 cartridges for various consoles.",
        "description_ca": "Lot de 20 cartutxos per a diferents consoles.",
        "description_gl": "Lote de 20 cartuchos para diferentes consolas.",
        "price": 60.00, "stock": 2, "discount": 20.0, "condition": "used",
        "item_slug": "otros-cartucho",
        "image_url": "https://www.todoconsolas.com/308618-medium_default/super_mario_bros_3_nes_sp_po8443.jpg",
        "seller_email": "alex@test.com",
    },

    # ── VIDEOJUEGOS › CD/DVD ───────────────────────────────────────────────────
    {
        "name": "Final Fantasy VII PS1",
        "name_en": "Final Fantasy VII PS1",
        "name_ca": "Final Fantasy VII PS1",
        "name_gl": "Final Fantasy VII PS1",
        "description": "Final Fantasy VII PAL completo con caja y manual.",
        "description_en": "Final Fantasy VII PAL complete with box and manual.",
        "description_ca": "Final Fantasy VII PAL complet amb caixa i manual.",
        "description_gl": "Final Fantasy VII PAL completo con caixa e manual.",
        "price": 75.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-ps1",
        "image_url": "https://i.etsystatic.com/20685833/r/il/d09585/5220865797/il_fullxfull.5220865797_qg92.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Metal Gear Solid PS1",
        "name_en": "Metal Gear Solid PS1",
        "name_ca": "Metal Gear Solid PS1",
        "name_gl": "Metal Gear Solid PS1",
        "description": "Metal Gear Solid PAL PS1, completo con caja.",
        "description_en": "Metal Gear Solid PAL PS1, complete with box.",
        "description_ca": "Metal Gear Solid PAL PS1, complet amb caixa.",
        "description_gl": "Metal Gear Solid PAL PS1, completo con caixa.",
        "price": 45.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-ps1",
        "image_url": "https://oldgame.com.br/wp-content/uploads/2022/10/metal-gear-solid-ps1-3.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "GTA San Andreas PS2",
        "name_en": "GTA San Andreas PS2",
        "name_ca": "GTA San Andreas PS2",
        "name_gl": "GTA San Andreas PS2",
        "description": "Grand Theft Auto San Andreas para PS2, completo.",
        "description_en": "Grand Theft Auto San Andreas for PS2, complete.",
        "description_ca": "Grand Theft Auto San Andreas per a PS2, complet.",
        "description_gl": "Grand Theft Auto San Andreas para PS2, completo.",
        "price": 25.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-ps2",
        "image_url": "https://media.game.es/COVERV2/3D_L/049/049906.png",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Shadow of the Colossus PS2",
        "name_en": "Shadow of the Colossus PS2",
        "name_ca": "Shadow of the Colossus PS2",
        "name_gl": "Shadow of the Colossus PS2",
        "description": "Shadow of the Colossus PS2 PAL completo.",
        "description_en": "Shadow of the Colossus PS2 PAL complete.",
        "description_ca": "Shadow of the Colossus PS2 PAL complet.",
        "description_gl": "Shadow of the Colossus PS2 PAL completo.",
        "price": 35.00, "stock": 3, "discount": 10.0, "condition": "used",
        "item_slug": "juegos-ps2",
        "image_url": "https://media.vandal.net/m/1903/20051224193432_1.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Shenmue Dreamcast",
        "name_en": "Shenmue Dreamcast",
        "name_ca": "Shenmue Dreamcast",
        "name_gl": "Shenmue Dreamcast",
        "description": "Shenmue para Dreamcast, edición PAL completa con caja.",
        "description_en": "Shenmue for Dreamcast, complete PAL edition with box.",
        "description_ca": "Shenmue per a Dreamcast, edició PAL completa amb caixa.",
        "description_gl": "Shenmue para Dreamcast, edición PAL completa con caixa.",
        "price": 60.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-dreamcast",
        "image_url": "https://media.vandal.net/m/31/shenmue-201961215304614_1.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Soul Calibur Dreamcast",
        "name_en": "Soul Calibur Dreamcast",
        "name_ca": "Soul Calibur Dreamcast",
        "name_gl": "Soul Calibur Dreamcast",
        "description": "Soul Calibur para Dreamcast, estado impecable.",
        "description_en": "Soul Calibur for Dreamcast, impeccable condition.",
        "description_ca": "Soul Calibur per a Dreamcast, estat impecable.",
        "description_gl": "Soul Calibur para Dreamcast, estado impecable.",
        "price": 30.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-dreamcast",
        "image_url": "https://elrincondelretro.com/storage/images/image?remote=https:%2F%2Felrincondelretro.com%2FWebRoot%2FStore19%2FShops%2Fad583ff4-95d5-4b1d-b578-9925a0fc4b7c%2F6703%2FC66F%2F07AD%2FB8D4%2F4F93%2F0A48%2F356D%2F8F33%2FIMG-0722.JPG&shop=ad583ff4-95d5-4b1d-b578-9925a0fc4b7c",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Panzer Dragoon Saga Saturn",
        "name_en": "Panzer Dragoon Saga Saturn",
        "name_ca": "Panzer Dragoon Saga Saturn",
        "name_gl": "Panzer Dragoon Saga Saturn",
        "description": "Panzer Dragoon Saga para Sega Saturn, joya rara PAL.",
        "description_en": "Panzer Dragoon Saga for Sega Saturn, rare PAL gem.",
        "description_ca": "Panzer Dragoon Saga per a Sega Saturn, joia rara PAL.",
        "description_gl": "Panzer Dragoon Saga para Sega Saturn, xoia rara PAL.",
        "price": 200.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-saturn",
        "image_url": "https://www.museodelvideojuego.com/files/caratulas/sega-saturn/pal/panzer_dragoon_saga_disco_4.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Half-Life PC CD-ROM",
        "name_en": "Half-Life PC CD-ROM",
        "name_ca": "Half-Life PC CD-ROM",
        "name_gl": "Half-Life PC CD-ROM",
        "description": "Half-Life para PC en caja original con manual.",
        "description_en": "Half-Life for PC in original box with manual.",
        "description_ca": "Half-Life per a PC en caixa original amb manual.",
        "description_gl": "Half-Life para PC en caixa orixinal con manual.",
        "price": 20.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-pc",
        "image_url": "https://m.media-amazon.com/images/I/91U8dILGZ5L.__AC_SX300_SY300_QL70_ML2_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Diablo II PC",
        "name_en": "Diablo II PC",
        "name_ca": "Diablo II PC",
        "name_gl": "Diablo II PC",
        "description": "Diablo II PC completo con Lord of Destruction.",
        "description_en": "Diablo II PC complete with Lord of Destruction.",
        "description_ca": "Diablo II PC complet amb Lord of Destruction.",
        "description_gl": "Diablo II PC completo con Lord of Destruction.",
        "price": 25.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "juegos-pc",
        "image_url": "https://retrogamevalencia.com/21169-large_default/diablo-ii-pc.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Lote 10 Juegos PS1 Variados",
        "name_en": "Lot of 10 Mixed PS1 Games",
        "name_ca": "Lot 10 Jocs PS1 Variats",
        "name_gl": "Lote 10 Xogos PS1 Variados",
        "description": "Lote de 10 juegos de PS1 en buen estado.",
        "description_en": "Lot of 10 PS1 games in good condition.",
        "description_ca": "Lot de 10 jocs de PS1 en bon estat.",
        "description_gl": "Lote de 10 xogos de PS1 en bo estado.",
        "price": 40.00, "stock": 3, "discount": 15.0, "condition": "used",
        "item_slug": "otros-cd-dvd",
        "image_url": "https://http2.mlstatic.com/D_NQ_NP_725923-MLM75954992293_042024-O.webp",
        "seller_email": "alex@test.com",
    },
    
    # ── VIDEOJUEGOS › Ediciones Especiales ───────────────────────────────────
    {
        "name": "Zelda Ocarina of Time Collector's",
        "name_en": "Zelda Ocarina of Time Collector's",
        "name_ca": "Zelda Ocarina of Time Collector's",
        "name_gl": "Zelda Ocarina of Time Collector's",
        "description": "Zelda OoT Collector's Edition N64 precintada.",
        "description_en": "Zelda OoT Collector's Edition N64 sealed.",
        "description_ca": "Zelda OoT Collector's Edition N64 precintada.",
        "description_gl": "Zelda OoT Collector's Edition N64 precintada.",
        "price": 300.00, "stock": 1, "discount": 0.0, "condition": "new",
        "item_slug": "collectors-edition",
        "image_url": "https://m.media-amazon.com/images/I/81I3FYpVKYL._SL1500_.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Metal Gear Solid 3 Steelbook",
        "name_en": "Metal Gear Solid 3 Steelbook",
        "name_ca": "Metal Gear Solid 3 Steelbook",
        "name_gl": "Metal Gear Solid 3 Steelbook",
        "description": "MGS3 Snake Eater Steelbook PS2, edición europea.",
        "description_en": "MGS3 Snake Eater Steelbook PS2, European edition.",
        "description_ca": "MGS3 Snake Eater Steelbook PS2, edició europea.",
        "description_gl": "MGS3 Snake Eater Steelbook PS2, edición europea.",
        "price": 85.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "steelbook",
        "image_url": "https://storage.googleapis.com/retrobroker/products/rtr_img_6221_170629354758527/thumbnail.webp",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Final Fantasy X Precintado PAL",
        "name_en": "Final Fantasy X Sealed PAL",
        "name_ca": "Final Fantasy X Precintado PAL",
        "name_gl": "Final Fantasy X Precintado PAL",
        "description": "Final Fantasy X PAL completamente precintado.",
        "description_en": "Final Fantasy X PAL completely sealed.",
        "description_ca": "Final Fantasy X PAL completament precintado.",
        "description_gl": "Final Fantasy X PAL completamente precintado.",
        "price": 120.00, "stock": 1, "discount": 0.0, "condition": "new",
        "item_slug": "precintados",
        "image_url": "https://www.saldojuegos.com/3711-large_default/final-fantasy-x-ps2-nuevo-precintado.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Dragon Ball Z Super Butōden Import SNES",
        "name_en": "Dragon Ball Z Super Butōden Import SNES",
        "name_ca": "Dragon Ball Z Super Butōden Import SNES",
        "name_gl": "Dragon Ball Z Super Butōden Import SNES",
        "description": "Dragon Ball Z Super Butōden import japonés para SNES.",
        "description_en": "Dragon Ball Z Super Butōden Japanese import for SNES.",
        "description_ca": "Dragon Ball Z Super Butōden import japonès per a SNES.",
        "description_gl": "Dragon Ball Z Super Butōden import xaponés para SNES.",
        "price": 55.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "japoneses-import",
        "image_url": "https://www.elconsolas.cl/wp-content/uploads/2020/12/dragon.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Press Kit Resident Evil 2",
        "name_en": "Resident Evil 2 Press Kit",
        "name_ca": "Press Kit Resident Evil 2",
        "name_gl": "Press Kit Resident Evil 2",
        "description": "Press kit original de Resident Evil 2, rarísimo.",
        "description_en": "Original Resident Evil 2 press kit, extremely rare.",
        "description_ca": "Press kit original de Resident Evil 2, raríssim.",
        "description_gl": "Press kit orixinal de Resident Evil 2, rarísimo.",
        "price": 250.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-ediciones-especiales",
        "image_url": "https://www.ecured.cu/images/0/04/Re2_portada.jpg",
        "seller_email": "carlos@test.com",
    },
    
    # ── MÚSICA › Medios Físicos ───────────────────────────────────────────────
    {
        "name": "Vinilo Led Zeppelin IV",
        "name_en": "Led Zeppelin IV Vinyl",
        "name_ca": "Vinil Led Zeppelin IV",
        "name_gl": "Vinilo Led Zeppelin IV",
        "description": "Led Zeppelin IV edición original 1971.",
        "description_en": "Led Zeppelin IV original 1971 edition.",
        "description_ca": "Led Zeppelin IV edició original.",
        "description_gl": "Led Zeppelin IV edición orixinal.",
        "price": 45.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "discos-de-vinilo",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2019/10/Led-Zeppelin-1200x1200.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Pink Floyd The Wall",
        "name_en": "Pink Floyd The Wall Vinyl",
        "name_ca": "Vinil Pink Floyd The Wall",
        "name_gl": "Vinilo Pink Floyd The Wall",
        "description": "The Wall doble vinilo edición original 1979.",
        "description_en": "The Wall double vinyl original 1979 edition.",
        "description_ca": "The Wall doble vinil edició original 1979.",
        "description_gl": "The Wall dobre vinilo edición orixinal 1979.",
        "price": 60.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "discos-de-vinilo",
        "image_url": "https://signosdisqueria.cl/cdn/shop/files/pink-floyd-the-wall-vinilo-2.jpg?v=1702653827&width=1000",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Nirvana Nevermind",
        "name_en": "Nirvana Nevermind Vinyl",
        "name_ca": "Vinil Nirvana Nevermind",
        "name_gl": "Vinilo Nirvana Nevermind",
        "description": "Nevermind edición original 1991 en perfecto estado.",
        "description_en": "Nevermind original 1991 edition in perfect condition.",
        "description_ca": "Nevermind edició original 1991 en perfecte estat.",
        "description_gl": "Nevermind edición orixinal 1991 en perfecto estado.",
        "price": 50.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "discos-de-vinilo",
        "image_url": "https://universalmusiconline.es/cdn/shop/files/nirvana.jpg?v=1685519501",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Michael Jackson Thriller",
        "name_en": "Michael Jackson Thriller Vinyl",
        "name_ca": "Vinil Michael Jackson Thriller",
        "name_gl": "Vinilo Michael Jackson Thriller",
        "description": "Thriller edición original 1982, incluye encarte.",
        "description_en": "Thriller original 1982 edition, includes insert.",
        "description_ca": "Thriller edició original 1982, inclou encart.",
        "description_gl": "Thriller edición orixinal 1982, inclúe encarte.",
        "price": 70.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "discos-de-vinilo",
        "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2024/12/Michael-Jackson-e1734520718418.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "CD Radiohead OK Computer",
        "name_en": "Radiohead OK Computer CD",
        "name_ca": "CD Radiohead OK Computer",
        "name_gl": "CD Radiohead OK Computer",
        "description": "CD OK Computer Radiohead edición original 1997.",
        "description_en": "OK Computer Radiohead CD original 1997 edition.",
        "description_ca": "CD OK Computer Radiohead edició original 1997.",
        "description_gl": "CD OK Computer Radiohead edición orixinal 1997.",
        "price": 12.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "cds",
        "image_url": "https://dojiw2m9tvv09.cloudfront.net/51271/product/img-22535344.jpeg?47&time=1676056059",
        "seller_email": "maria@test.com",
    },
    {
        "name": "CD Daft Punk Random Access Memories",
        "name_en": "Daft Punk Random Access Memories CD",
        "name_ca": "CD Daft Punk Random Access Memories",
        "name_gl": "CD Daft Punk Random Access Memories",
        "description": "Random Access Memories CD edición especial con libreto.",
        "description_en": "Random Access Memories CD special edition with booklet.",
        "description_ca": "Random Access Memories CD edició especial amb llibret.",
        "description_gl": "Random Access Memories CD edición especial con libreto.",
        "price": 15.00, "stock": 5, "discount": 20.0, "condition": "new",
        "item_slug": "cds",
        "image_url": "https://dovinilos.cl/wp-content/uploads/2023/01/Daft-Punk-–-Random-Access-Memories.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Casete Depeche Mode Violator",
        "name_en": "Depeche Mode Violator Cassette",
        "name_ca": "Casset Depeche Mode Violator",
        "name_gl": "Casete Depeche Mode Violator",
        "description": "Casete Violator de Depeche Mode en buen estado.",
        "description_en": "Depeche Mode Violator cassette in good condition.",
        "description_ca": "Casset Violator de Depeche Mode en bon estat.",
        "description_gl": "Casete Violator de Depeche Mode en bo estado.",
        "price": 12.00, "stock": 10, "discount": 20.0, "condition": "used",
        "item_slug": "casetes",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHVBpFFP68FQd9Gh1OWGXo4awKfdLAho6Qvg&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Casete Metallica Black Album",
        "name_en": "Metallica Black Album Cassette",
        "name_ca": "Casset Metallica Black Album",
        "name_gl": "Casete Metallica Black Album",
        "description": "Metallica The Black Album casete original 1991.",
        "description_en": "Metallica The Black Album original 1991 cassette.",
        "description_ca": "Metallica The Black Album casset original 1991.",
        "description_gl": "Metallica The Black Album casete orixinal 1991.",
        "price": 10.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "casetes",
        "image_url": "https://i.ebayimg.com/images/g/zK8AAOSwnh1i5Ykf/s-l1200.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Casete Madonna Like a Virgin",
        "name_en": "Madonna Like a Virgin Cassette",
        "name_ca": "Casset Madonna Like a Virgin",
        "name_gl": "Casete Madonna Like a Virgin",
        "description": "Madonna Like a Virgin casete original 1984.",
        "description_en": "Madonna Like a Virgin original 1984 cassette.",
        "description_ca": "Madonna Like a Virgin casset original 1984.",
        "description_gl": "Madonna Like a Virgin casete orixinal 1984.",
        "price": 8.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "casetes",
        "image_url": "https://i.etsystatic.com/20964828/r/il/203b03/7004577808/il_570xN.7004577808_o5pm.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Mini Disc Sony MZ-R70",
        "name_en": "Sony MZ-R70 MiniDisc",
        "name_ca": "Mini Disc Sony MZ-R70",
        "name_gl": "Mini Disc Sony MZ-R70",
        "description": "Grabador Sony MZ-R70 con caja y auriculares originales.",
        "description_en": "Sony MZ-R70 MiniDisc recorder with original box and earphones.",
        "description_ca": "Gravador Sony MZ-R70 amb caixa i auriculars originals.",
        "description_gl": "Gravador Sony MZ-R70 con caixa e auriculares orixinais.",
        "price": 55.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "otros-vinilos",
        "image_url": "https://m.media-amazon.com/images/I/91ayTKQJS0L._AC_SL1500_.jpg",
        "seller_email": "maria@test.com",
    },

    # ── MÚSICA › Épocas ───────────────────────────────────────────────────────
    {
        "name": "Vinilo The Beatles Abbey Road",
        "name_en": "The Beatles Abbey Road Vinyl",
        "name_ca": "Vinil The Beatles Abbey Road",
        "name_gl": "Vinilo The Beatles Abbey Road",
        "description": "Abbey Road vinilo original 1969, buen estado general.",
        "description_en": "Abbey Road original 1969 vinyl, good general condition.",
        "description_ca": "Abbey Road vinil original 1969, bon estat general.",
        "description_gl": "Abbey Road vinilo orixinal 1969, bo estado xeral.",
        "price": 80.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "los-60",
        "image_url": "https://dondisco.net/22310-thickbox_default/beatles-vinilo-abbey-road-50-aniv.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo The Rolling Stones Exile",
        "name_en": "The Rolling Stones Exile on Main St. Vinyl",
        "name_ca": "Vinil The Rolling Stones Exile",
        "name_gl": "Vinilo The Rolling Stones Exile",
        "description": "Exile on Main St. doble vinilo original 1972.",
        "description_en": "Exile on Main St. original double vinyl 1972.",
        "description_ca": "Exile on Main St. doble vinil original 1972.",
        "description_gl": "Exile on Main St. dobre vinilo orixinal 1972.",
        "price": 65.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "los-60",
        "image_url": "https://images-na.ssl-images-amazon.com/images/I/913zQMka2zL._SL1500_.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo David Bowie Ziggy Stardust",
        "name_en": "David Bowie Ziggy Stardust Vinyl",
        "name_ca": "Vinil David Bowie Ziggy Stardust",
        "name_gl": "Vinilo David Bowie Ziggy Stardust",
        "description": "Ziggy Stardust vinilo original 1972, buen estado.",
        "description_en": "Ziggy Stardust original 1972 vinyl, good condition.",
        "description_ca": "Ziggy Stardust vinil original 1972, bon estat.",
        "description_gl": "Ziggy Stardust vinilo orixinal 1972, bo estado.",
        "price": 55.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "los-70",
        "image_url": "https://static.fnac-static.com/multimedia/Images/ES/NR/59/39/74/7616857/1540-1.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Madonna Like a Virgin",
        "name_en": "Madonna Like a Virgin Vinyl",
        "name_ca": "Vinil Madonna Like a Virgin",
        "name_gl": "Vinilo Madonna Like a Virgin",
        "description": "Like a Virgin vinilo original 1984.",
        "description_en": "Like a Virgin original 1984 vinyl.",
        "description_ca": "Like a Virgin vinil original 1984.",
        "description_gl": "Like a Virgin vinilo orixinal 1984.",
        "price": 30.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "los-80",
        "image_url": "https://http2.mlstatic.com/D_NQ_NP_835198-MLC70019230713_062023-O.webp",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Michael Jackson Bad",
        "name_en": "Michael Jackson Bad Vinyl",
        "name_ca": "Vinil Michael Jackson Bad",
        "name_gl": "Vinilo Michael Jackson Bad",
        "description": "Bad de Michael Jackson edición original 1987.",
        "description_en": "Michael Jackson Bad original 1987 edition.",
        "description_ca": "Bad de Michael Jackson edició original 1987.",
        "description_gl": "Bad de Michael Jackson edición orixinal 1987.",
        "price": 40.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "los-80",
        "image_url": "https://static.wixstatic.com/media/54fc53_2cd0abf5f1654f9098152f9b203b150d~mv2_d_1200_1200_s_2.jpg/v1/fill/w_980,h_980,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/54fc53_2cd0abf5f1654f9098152f9b203b150d~mv2_d_1200_1200_s_2.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "CD Nirvana Nevermind 1991",
        "name_en": "Nirvana Nevermind CD 1991",
        "name_ca": "CD Nirvana Nevermind 1991",
        "name_gl": "CD Nirvana Nevermind 1991",
        "description": "Nevermind CD edición original 1991.",
        "description_en": "Nevermind original 1991 CD edition.",
        "description_ca": "Nevermind CD edició original 1991.",
        "description_gl": "Nevermind CD edición orixinal 1991.",
        "price": 18.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "los-90",
        "image_url": "https://http2.mlstatic.com/D_NQ_NP_934502-MLM43192280186_082020-O.webp",
        "seller_email": "maria@test.com",
    },
    {
        "name": "CD Oasis (What's the Story) Morning Glory?",
        "name_en": "Oasis (What's the Story) Morning Glory? CD",
        "name_ca": "CD Oasis (What's the Story) Morning Glory?",
        "name_gl": "CD Oasis (What's the Story) Morning Glory?",
        "description": "What's the Story Morning Glory? CD original 1995.",
        "description_en": "What's the Story Morning Glory? original 1995 CD.",
        "description_ca": "What's the Story Morning Glory? CD original 1995.",
        "description_gl": "What's the Story Morning Glory? CD orixinal 1995.",
        "price": 14.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "los-90",
        "image_url": "https://dojiw2m9tvv09.cloudfront.net/51271/product/default1186.jpeg?46&time=1700694983",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vinilo Jazz Blue Note Años 50",
        "name_en": "50s Blue Note Jazz Vinyl",
        "name_ca": "Vinil Jazz Blue Note Anys 50",
        "name_gl": "Vinilo Jazz Blue Note Anos 50",
        "description": "Selección de vinilos jazz de Blue Note años 50.",
        "description_en": "Blue Note jazz vinyl selection from the 50s.",
        "description_ca": "Selecció de vinils jazz de Blue Note anys 50.",
        "description_gl": "Selección de vinilos jazz de Blue Note anos 50.",
        "price": 90.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-epocas",
        "image_url": "https://http2.mlstatic.com/D_NQ_NP_684075-MLU72345704004_102023-O.webp",
        "seller_email": "maria@test.com",
    },

    # ── MÚSICA › Reproductores ────────────────────────────────────────────────
    {
        "name": "Walkman Sony WM-F10",
        "name_en": "Sony WM-F10 Walkman",
        "name_ca": "Walkman Sony WM-F10",
        "name_gl": "Walkman Sony WM-F10",
        "description": "Walkman Sony con radio FM en buen estado.",
        "description_en": "Sony Walkman with FM radio in good working condition.",
        "description_ca": "Walkman Sony amb ràdio FM en bon estat.",
        "description_gl": "Walkman Sony con radio FM en bo estado.",
        "price": 40.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "walkman",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_UePqDF2twZgFm7ZVbr8sHs39o4Jjx22Ag&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Walkman Sony WM-EX1 Reacondicionado",
        "name_en": "Refurbished Sony WM-EX1 Walkman",
        "name_ca": "Walkman Sony WM-EX1 Recondicionat",
        "name_gl": "Walkman Sony WM-EX1 Reacondicionado",
        "description": "Walkman Sony WM-EX1 revisado, funciona perfectamente.",
        "description_en": "Serviced Sony WM-EX1 Walkman, works perfectly.",
        "description_ca": "Walkman Sony WM-EX1 revisat, funciona perfectament.",
        "description_gl": "Walkman Sony WM-EX1 revisado, funciona perfectamente.",
        "price": 55.00, "stock": 2, "discount": 0.0, "condition": "refurbished",
        "item_slug": "walkman",
        "image_url": "https://www.picclickimg.com/aywAAOSwXIVmI9YE/Sony-walkman-WM-EX1-casette-player.webp",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Discman Sony D-EJ955",
        "name_en": "Sony D-EJ955 Discman",
        "name_ca": "Discman Sony D-EJ955",
        "name_gl": "Discman Sony D-EJ955",
        "description": "Discman Sony con G-Protection, incluye auriculares.",
        "description_en": "Sony Discman with G-Protection, includes headphones.",
        "description_ca": "Discman Sony amb G-Protection, inclou auriculars.",
        "description_gl": "Discman Sony con G-Protection, inclúe auriculares.",
        "price": 45.00, "stock": 4, "discount": 5.0, "condition": "used",
        "item_slug": "discman",
        "image_url": "https://static-data2.manualslib.com/product-images/299/214754/sony-cd-walkman-d-ej1000-cd-player.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Radiocassette JVC PC-W330",
        "name_en": "JVC PC-W330 Radiocassette",
        "name_ca": "Radiocasset JVC PC-W330",
        "name_gl": "Radiocasete JVC PC-W330",
        "description": "Radiocassette JVC doble pletina con ecualizador.",
        "description_en": "JVC double-deck radiocassette with equalizer.",
        "description_ca": "Radiocasset JVC doble plat amb equalitzador.",
        "description_gl": "Radiocasete JVC dobre pletina con ecualizador.",
        "price": 65.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "radiocassettes",
        "image_url": "https://hifivintage.eu/38222-large_default/jvc-pc-w330-l.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Tocadiscos Technics SL-1200",
        "name_en": "Technics SL-1200 Turntable",
        "name_ca": "Giradiscos Technics SL-1200",
        "name_gl": "Tocadiscos Technics SL-1200",
        "description": "Mítico Technics SL-1200 en estado de coleccionista.",
        "description_en": "Legendary Technics SL-1200 turntable in collector condition.",
        "description_ca": "Mític Technics SL-1200 en estat de col·leccionista.",
        "description_gl": "Mítico Technics SL-1200 en estado de coleccionista.",
        "price": 350.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "tocadiscos",
        "image_url": "https://i.blogs.es/2c45fe/direct_drive_turntable_system_sl_1200gae_3/1366_2000.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Amplificador Marantz PM-80",
        "name_en": "Marantz PM-80 Amplifier",
        "name_ca": "Amplificador Marantz PM-80",
        "name_gl": "Amplificador Marantz PM-80",
        "description": "Amplificador Marantz PM-80 vintage en perfecto estado.",
        "description_en": "Vintage Marantz PM-80 amplifier in perfect condition.",
        "description_ca": "Amplificador Marantz PM-80 vintage en perfecte estat.",
        "description_gl": "Amplificador Marantz PM-80 vintage en perfecto estado.",
        "price": 180.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "amplificadores",
        "image_url": "https://assets.catawiki.nl/assets/2020/7/22/d/b/f/dbf16928-5dec-49c8-b3c1-8c348bd9fc25.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Equipo de Música Aiwa CX-NA777",
        "name_en": "Aiwa CX-NA777 Hi-Fi System",
        "name_ca": "Equip de Música Aiwa CX-NA777",
        "name_gl": "Equipo de Música Aiwa CX-NA777",
        "description": "Equipo Aiwa CX-NA777 con 5 CD, radio y cassette.",
        "description_en": "Aiwa CX-NA777 hi-fi system with 5CD, radio and cassette.",
        "description_ca": "Equip Aiwa CX-NA777 amb 5 CD, ràdio i casset.",
        "description_gl": "Equipo Aiwa CX-NA777 con 5 CD, radio e casete.",
        "price": 90.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-reproductores-audio",
        "image_url": "https://i.blogs.es/2c45fe/direct_drive_turntable_system_sl_1200gae_3/1366_2000.jpg",
        "seller_email": "maria@test.com",
    },

    # ── MÚSICA › Instrumentos ─────────────────────────────────────────────────
    {
        "name": "Guitarra Fender Stratocaster 80s",
        "name_en": "Fender Stratocaster 80s Guitar",
        "name_ca": "Guitarra Fender Stratocaster 80s",
        "name_gl": "Guitarra Fender Stratocaster 80s",
        "description": "Fender Stratocaster Made in Japan años 80, sonido increíble.",
        "description_en": "Fender Stratocaster Made in Japan 80s, incredible sound.",
        "description_ca": "Fender Stratocaster Made in Japan anys 80, so increïble.",
        "description_gl": "Fender Stratocaster Made in Japan anos 80, son incribles.",
        "price": 650.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "guitarras",
        "image_url": "https://thunderguitars.com/wp-content/uploads/2025/03/IMG_8483.jpeg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Piano Casio CT-310 Vintage",
        "name_en": "Vintage Casio CT-310 Piano",
        "name_ca": "Piano Casio CT-310 Vintage",
        "name_gl": "Piano Casio CT-310 Vintage",
        "description": "Teclado Casio CT-310 de los 80, funciona perfectamente.",
        "description_en": "80s Casio CT-310 keyboard, works perfectly.",
        "description_ca": "Teclat Casio CT-310 dels 80, funciona perfectament.",
        "description_gl": "Teclado Casio CT-310 dos 80, funciona perfectamente.",
        "price": 90.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "pianos",
        "image_url": "https://images.evisos.cl/2011/06/01/oferta-casio-ht-3000-casio-ct-310_d01222ef47_3.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Batería Pearl Export 90s",
        "name_en": "Pearl Export 90s Drum Kit",
        "name_ca": "Bateria Pearl Export 90s",
        "name_gl": "Batería Pearl Export 90s",
        "description": "Batería Pearl Export años 90 completa, buen estado.",
        "description_en": "Complete Pearl Export 90s drum kit, good condition.",
        "description_ca": "Bateria Pearl Export anys 90 completa, bon estat.",
        "description_gl": "Batería Pearl Export anos 90 completa, bo estado.",
        "price": 400.00, "stock": 1, "discount": 10.0, "condition": "used",
        "item_slug": "baterias",
        "image_url": "https://ultramaraudio.com/wp-content/uploads/2023/01/1911291727239209_01_medium.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Trompeta Yamaha YTR-2320 Vintage",
        "name_en": "Vintage Yamaha YTR-2320 Trumpet",
        "name_ca": "Trompeta Yamaha YTR-2320 Vintage",
        "name_gl": "Trompeta Yamaha YTR-2320 Vintage",
        "description": "Trompeta Yamaha YTR-2320 en excelente estado.",
        "description_en": "Yamaha YTR-2320 trumpet in excellent condition.",
        "description_ca": "Trompeta Yamaha YTR-2320 en excel·lent estat.",
        "description_gl": "Trompeta Yamaha YTR-2320 en excelente estado.",
        "price": 220.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-instrumentos",
        "image_url": "https://vientosur.cl/116-large_default/trompeta-yamaha-ytr-2320.jpg",
        "seller_email": "maria@test.com",
    },

    # ── TECNOLOGÍA › Ordenadores ──────────────────────────────────────────────
    {
        "name": "IBM PC XT 5160",
        "name_en": "IBM PC XT 5160",
        "name_ca": "IBM PC XT 5160",
        "name_gl": "IBM PC XT 5160",
        "description": "IBM PC XT con monitor monocromo y teclado original.",
        "description_en": "IBM PC XT with monochrome monitor and original keyboard.",
        "description_ca": "IBM PC XT amb monitor monocrom i teclat original.",
        "description_gl": "IBM PC XT con monitor monocromo e teclado orixinal.",
        "price": 200.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "ibm",
        "image_url": "https://www.umadivulga.uma.es/wp-content/uploads/2021/09/partes-ibm-xt-5160-image3.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Commodore 64 Completo",
        "name_en": "Complete Commodore 64",
        "name_ca": "Commodore 64 Complet",
        "name_gl": "Commodore 64 Completo",
        "description": "C64 con datasette, joystick y caja original.",
        "description_en": "C64 with datasette, joystick and original box.",
        "description_ca": "C64 amb datasette, joystick i caixa original.",
        "description_gl": "C64 con datasette, joystick e caixa orixinal.",
        "price": 130.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "commodore",
        "image_url": "https://consolasmini.net/wp-content/uploads/2020/10/IE-008KKEDIT.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Amiga 500",
        "name_en": "Amiga 500",
        "name_ca": "Amiga 500",
        "name_gl": "Amiga 500",
        "description": "Commodore Amiga 500 con joystick y juegos.",
        "description_en": "Commodore Amiga 500 with joystick and games.",
        "description_ca": "Commodore Amiga 500 amb joystick i jocs.",
        "description_gl": "Commodore Amiga 500 con joystick e xogos.",
        "price": 160.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "amiga",
        "image_url": "https://museodeinformatica.org.ar/wp-content/uploads/2015/06/amiga500.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Amstrad PC 1512",
        "name_en": "Amstrad PC 1512",
        "name_ca": "Amstrad PC 1512",
        "name_gl": "Amstrad PC 1512",
        "description": "Amstrad PC 1512 con monitor color y MS-DOS.",
        "description_en": "Amstrad PC 1512 with color monitor and MS-DOS.",
        "description_ca": "Amstrad PC 1512 amb monitor color i MS-DOS.",
        "description_gl": "Amstrad PC 1512 con monitor cor e MS-DOS.",
        "price": 110.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "amstrad-tech",
        "image_url": "https://live.staticflickr.com/65535/53056859679_30c9131c4b_c.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Apple Macintosh 128K",
        "name_en": "Apple Macintosh 128K",
        "name_ca": "Apple Macintosh 128K",
        "name_gl": "Apple Macintosh 128K",
        "description": "Macintosh 128K original 1984, funciona y enciende.",
        "description_en": "Original 1984 Macintosh 128K, works and boots.",
        "description_ca": "Macintosh 128K original 1984, funciona i s'encén.",
        "description_gl": "Macintosh 128K orixinal 1984, funciona e acende.",
        "price": 450.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "macintosh",
        "image_url": "https://guide-images.cdn.ifixit.com/igi/GtJsssF5C32GYZU5.large",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Spectrum ZX 48K",
        "name_en": "ZX Spectrum 48K",
        "name_ca": "Spectrum ZX 48K",
        "name_gl": "Spectrum ZX 48K",
        "description": "Sinclair ZX Spectrum 48K con cargador y joystick.",
        "description_en": "Sinclair ZX Spectrum 48K with power supply and joystick.",
        "description_ca": "Sinclair ZX Spectrum 48K amb carregador i joystick.",
        "description_gl": "Sinclair ZX Spectrum 48K con cargador e joystick.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "otros-ordenadores",
        "image_url": "https://media3.gameplaystores.es/71658-thickbox_default/ordenador-zx-spectrum-48k.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── TECNOLOGÍA › Telefonía ────────────────────────────────────────────────
    {
        "name": "Teléfono Ericofon",
        "name_en": "Ericofon Fixed Phone",
        "name_ca": "Telèfon Ericofon",
        "name_gl": "Teléfono Ericofon",
        "description": "Teléfono Ericofon de los 60, pieza de museo.",
        "description_en": "60s Ericofon telephone, museum piece.",
        "description_ca": "Telèfon Ericofon dels 60, peça de museu.",
        "description_gl": "Teléfono Ericofon dos 60, peza de museo.",
        "price": 85.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "telefonos-fijos",
        "image_url": "https://3.bp.blogspot.com/-4waGj5Ae1NI/T8gOVLRLLmI/AAAAAAAAAMA/CGHFVJz9-a4/s1600/Ericofon+05.JPG",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Nokia 3310 Azul",
        "name_en": "Blue Nokia 3310",
        "name_ca": "Nokia 3310 Blau",
        "name_gl": "Nokia 3310 Azul",
        "description": "Nokia 3310 clásico en azul, batería nueva.",
        "description_en": "Classic Nokia 3310 in blue, new battery.",
        "description_ca": "Nokia 3310 clàssic en blau, bateria nova.",
        "description_gl": "Nokia 3310 clásico en azul, batería nova.",
        "price": 35.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "moviles-antiguos",
        "image_url": "https://vintagemobile.fr/cdn/shop/files/Nokia-3310-Vintage-Mobile-777.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Motorola Razr V3 Plata",
        "name_en": "Silver Motorola Razr V3",
        "name_ca": "Motorola Razr V3 Plata",
        "name_gl": "Motorola Razr V3 Prata",
        "description": "Motorola RAZR V3 plateado, icónico móvil plegable.",
        "description_en": "Silver Motorola RAZR V3, iconic flip phone.",
        "description_ca": "Motorola RAZR V3 platejat, icònic mòbil plegable.",
        "description_gl": "Motorola RAZR V3 prateado, icónico móbil dobrable.",
        "price": 50.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "moviles-antiguos",
        "image_url": "https://m.media-amazon.com/images/I/81EAOq92VaL.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Sony Ericsson T610",
        "name_en": "Sony Ericsson T610",
        "name_ca": "Sony Ericsson T610",
        "name_gl": "Sony Ericsson T610",
        "description": "Sony Ericsson T610 con cámara integrada, buen estado.",
        "description_en": "Sony Ericsson T610 with integrated camera, good condition.",
        "description_ca": "Sony Ericsson T610 amb càmera integrada, bon estat.",
        "description_gl": "Sony Ericsson T610 con cámara integrada, bo estado.",
        "price": 30.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "moviles-antiguos",
        "image_url": "https://www.celulares.com/fotos/sony-ericsson-t610-1698-g-alt.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "iPhone 2G Original",
        "name_en": "Original iPhone 2G",
        "name_ca": "iPhone 2G Original",
        "name_gl": "iPhone 2G Orixinal",
        "description": "iPhone 2G original 2007, funciona pero batería agotada.",
        "description_en": "Original 2007 iPhone 2G, works but battery dead.",
        "description_ca": "iPhone 2G original 2007, funciona però bateria esgotada.",
        "description_gl": "iPhone 2G orixinal 2007, funciona pero batería esgotada.",
        "price": 120.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "smartphones",
        "image_url": "https://assets.catawiki.nl/assets/2022/10/13/e/f/b/efb8f147-507e-4e7c-bc8c-01ee36eab594.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Cargador Nokia Universal",
        "name_en": "Universal Nokia Charger",
        "name_ca": "Carregador Nokia Universal",
        "name_gl": "Cargador Nokia Universal",
        "description": "Cargador universal para Nokia 3310 y similares.",
        "description_en": "Universal charger for Nokia 3310 and similar models.",
        "description_ca": "Carregador universal per a Nokia 3310 i similars.",
        "description_gl": "Cargador universal para Nokia 3310 e similares.",
        "price": 8.00, "stock": 15, "discount": 0.0, "condition": "new",
        "item_slug": "accesorios-telefonia",
        "image_url": "https://tienda.todomovil.co/wp-content/uploads/2024/06/cargador-nokia.jpeg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Walkie Talkie Motorola TalkAbout",
        "name_en": "Motorola TalkAbout Walkie Talkie",
        "name_ca": "Walkie Talkie Motorola TalkAbout",
        "name_gl": "Walkie Talkie Motorola TalkAbout",
        "description": "Par de walkie-talkies Motorola TalkAbout años 90.",
        "description_en": "Pair of 90s Motorola TalkAbout walkie-talkies.",
        "description_ca": "Parell de walkie-talkies Motorola TalkAbout anys 90.",
        "description_gl": "Par de walkie-talkies Motorola TalkAbout anos 90.",
        "price": 28.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "otros-telefonia",
        "image_url": "https://assets.mmsrg.com/isr/166325/c1/-/ASSET_MP_88925677/fee_786_587_png",
        "seller_email": "carlos@test.com",
    },

    # ── TECNOLOGÍA › Fotografía ───────────────────────────────────────────────
    {
        "name": "Olympus OM-1",
        "name_en": "Olympus OM-1",
        "name_ca": "Olympus OM-1",
        "name_gl": "Olympus OM-1",
        "description": "Cámara réflex Olympus OM-1 con objetivo 50mm.",
        "description_en": "Olympus OM-1 reflex camera with 50mm lens.",
        "description_ca": "Càmera rèflex Olympus OM-1 amb objectiu 50mm.",
        "description_gl": "Cámara réflex Olympus OM-1 con obxectivo 50mm.",
        "price": 150.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "camaras-analogicas",
        "image_url": "https://i.pinimg.com/originals/ed/71/29/ed7129fc61265c56a748c2c83c66e73f.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Canon AE-1 Program",
        "name_en": "Canon AE-1 Program",
        "name_ca": "Canon AE-1 Program",
        "name_gl": "Canon AE-1 Program",
        "description": "Canon AE-1 Program con objetivo 50mm f/1.8.",
        "description_en": "Canon AE-1 Program with 50mm f/1.8 lens.",
        "description_ca": "Canon AE-1 Program amb objectiu 50mm f/1.8.",
        "description_gl": "Canon AE-1 Program con obxectivo 50mm f/1.8.",
        "price": 180.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "camaras-analogicas",
        "image_url": "https://cameramarket.es/cdn/shop/files/CapturadePantalla2023-10-05alas20.05.01.png",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Pentax K1000",
        "name_en": "Pentax K1000",
        "name_ca": "Pentax K1000",
        "name_gl": "Pentax K1000",
        "description": "Pentax K1000 totalmente mecánica, no necesita batería.",
        "description_en": "Fully mechanical Pentax K1000, no battery needed.",
        "description_ca": "Pentax K1000 totalment mecànica, no necessita bateria.",
        "description_gl": "Pentax K1000 totalmente mecánica, non necesita batería.",
        "price": 120.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "camaras-analogicas",
        "image_url": "https://cdn.assets.lomography.com/ea/26f4004e1867352fe39b5b45504d2e7623031a/1216x794x2.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Polaroid 600",
        "name_en": "Polaroid 600",
        "name_ca": "Polaroid 600",
        "name_gl": "Polaroid 600",
        "description": "Polaroid 600 clásica en buen estado, lista para usar.",
        "description_en": "Classic Polaroid 600 in good condition, ready to use.",
        "description_ca": "Polaroid 600 clàssica en bon estat, llesta per usar.",
        "description_gl": "Polaroid 600 clásica en bo estado, lista para usar.",
        "price": 60.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "polaroid",
        "image_url": "https://tiendainstant.com/1306-thickbox_default/polaroid-600.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Cámara Super 8 Chinon",
        "name_en": "Chinon Super 8 Camera",
        "name_ca": "Càmera Super 8 Chinon",
        "name_gl": "Cámara Super 8 Chinon",
        "description": "Cámara Super 8 Chinon 8F-MA, funciona perfectamente.",
        "description_en": "Chinon 8F-MA Super 8 camera, works perfectly.",
        "description_ca": "Càmera Super 8 Chinon 8F-MA, funciona perfectament.",
        "description_gl": "Cámara Super 8 Chinon 8F-MA, funciona perfectamente.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "super-8",
        "image_url": "https://cloud10.todocoleccion.online/antiguedades-tecnicas/tc/2018/11/18/12/140568778_112612776.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Objetivo Takumar 50mm f/1.4",
        "name_en": "Takumar 50mm f/1.4 Lens",
        "name_ca": "Objectiu Takumar 50mm f/1.4",
        "name_gl": "Obxectivo Takumar 50mm f/1.4",
        "description": "Super-Takumar 50mm f/1.4 M42, óptica de coleccionista.",
        "description_en": "Super-Takumar 50mm f/1.4 M42, collector's optics.",
        "description_ca": "Super-Takumar 50mm f/1.4 M42, òptica de col·leccionista.",
        "description_gl": "Super-Takumar 50mm f/1.4 M42, óptica de coleccionista.",
        "price": 75.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "objetivos-antiguos",
        "image_url": "https://cdnx.jumpseller.com/used/image/34543364/resize/960/960?1682546484",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Proyector de Diapositivas Leitz",
        "name_en": "Leitz Slide Projector",
        "name_ca": "Projector de Diapositives Leitz",
        "name_gl": "Proxector de Diapositivas Leitz",
        "description": "Proyector de diapositivas Leitz Pradovit, estado impecable.",
        "description_en": "Leitz Pradovit slide projector, impeccable condition.",
        "description_ca": "Projector de diapositives Leitz Pradovit, estat impecable.",
        "description_gl": "Proxector de diapositivas Leitz Pradovit, estado impecable.",
        "price": 70.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-fotografia",
        "image_url": "https://assets.catawiki.nl/assets/2021/1/17/d/8/d/d8d9cc20-7170-4f21-ac10-f75e2291bc55.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── TECNOLOGÍA › Accesorios Tech ──────────────────────────────────────────
    {
        "name": "Ratón Microsoft Serial Vintage",
        "name_en": "Vintage Microsoft Serial Mouse",
        "name_ca": "Ratolí Microsoft Serial Vintage",
        "name_gl": "Rato Microsoft Serial Vintage",
        "description": "Ratón Microsoft IntelliMouse serial original años 90.",
        "description_en": "Original 90s Microsoft IntelliMouse serial mouse.",
        "description_ca": "Ratolí Microsoft IntelliMouse serial original anys 90.",
        "description_gl": "Rato Microsoft IntelliMouse serial orixinal anos 90.",
        "price": 25.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "ratones-antiguos",
        "image_url": "https://secondhandeuropean.com/wp-content/uploads/2023/01/Serial-Mouse-Microsoft-sh00231.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Teclado IBM Model M",
        "name_en": "IBM Model M Keyboard",
        "name_ca": "Teclat IBM Model M",
        "name_gl": "Teclado IBM Model M",
        "description": "IBM Model M buckling spring, el mejor teclado de la historia.",
        "description_en": "IBM Model M buckling spring, the best keyboard ever made.",
        "description_ca": "IBM Model M buckling spring, el millor teclat de la història.",
        "description_gl": "IBM Model M buckling spring, o mellor teclado da historia.",
        "price": 120.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "teclados-mecanicos",
        "image_url": "https://vintageuy.com/img_productos/tamanio_unico/6eb0037ee682df92e2f47f45417f5e2b9e99d402.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Cable SCART Dorado",
        "name_en": "Gold SCART Cable",
        "name_ca": "Cable SCART Daurat",
        "name_gl": "Cable SCART Dourado",
        "description": "Cable SCART dorado de alta calidad para consolas retro.",
        "description_en": "High quality gold SCART cable for retro consoles.",
        "description_ca": "Cable SCART daurat d'alta qualitat per a consoles retro.",
        "description_gl": "Cable SCART dourado de alta calidade para consolas retro.",
        "price": 8.00, "stock": 20, "discount": 0.0, "condition": "new",
        "item_slug": "cables",
        "image_url": "https://ae01.alicdn.com/kf/HTB1mzrVKVXXXXb7apXXq6xXFXXXo/Scart-1-8m-RGB-Scart-Video-HD-TV-AV-Cable-For-XBOX-360-Version-Gamepads-High.jpg_640x640.jpg",
        "seller_email": "carlos@test.com",
    },
    {
        "name": "Módem 56K US Robotics",
        "name_en": "US Robotics 56K Modem",
        "name_ca": "Mòdem 56K US Robotics",
        "name_gl": "Módem 56K US Robotics",
        "description": "Módem externo US Robotics 56K, años 90.",
        "description_en": "External US Robotics 56K modem, 90s.",
        "description_ca": "Mòdem extern US Robotics 56K, anys 90.",
        "description_gl": "Módem externo US Robotics 56K, anos 90.",
        "price": 20.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "otros-accesorios-tech",
        "image_url": "https://images.pcel.com/mp/Redes-Modems-para-PC-US-Robotics-22542-4cea49ce1c97a.jpg",
        "seller_email": "carlos@test.com",
    },

    # ── MODA ──────────────────────────────────────────────────────────────────
    {
        "name": "Camiseta Nirvana Nevermind 90s",
        "name_en": "Nirvana Nevermind 90s T-Shirt",
        "name_ca": "Samarreta Nirvana Nevermind 90s",
        "name_gl": "Camiseta Nirvana Nevermind 90s",
        "description": "Camiseta vintage Nirvana Nevermind, talla L, algodón 100%.",
        "description_en": "Nirvana Nevermind vintage T-shirt, size L, 100% cotton.",
        "description_ca": "Samarreta vintage Nirvana Nevermind, talla L, cotó 100%.",
        "description_gl": "Camiseta vintage Nirvana Nevermind, talla L, algodón 100%.",
        "price": 22.00, "stock": 8, "discount": 0.0, "condition": "used",
        "item_slug": "camisetas-80s-90s",
        "image_url": "https://media.camden.es/product/camiseta-nirvana-unisex-nevermind-album-800x800.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Camiseta AC/DC Back in Black Tour",
        "name_en": "AC/DC Back in Black Tour T-Shirt",
        "name_ca": "Samarreta AC/DC Back in Black Tour",
        "name_gl": "Camiseta AC/DC Back in Black Tour",
        "description": "Camiseta tour AC/DC Back in Black 1980, original.",
        "description_en": "Original AC/DC Back in Black 1980 tour T-shirt.",
        "description_ca": "Samarreta tour AC/DC Back in Black 1980, original.",
        "description_gl": "Camiseta tour AC/DC Back in Black 1980, orixinal.",
        "price": 35.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "camisetas-80s-90s",
        "image_url": "https://media.camden.es/product/camiseta-acdc-back-in-black-800x800.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Sudadera Champion Vintage",
        "name_en": "Vintage Champion Sweatshirt",
        "name_ca": "Dessuadora Champion Vintage",
        "name_gl": "Sudadeira Champion Vintage",
        "description": "Sudadera Champion con logo bordado años 90, talla M.",
        "description_en": "90s Champion sweatshirt with embroidered logo, size M.",
        "description_ca": "Dessuadora Champion amb logo brodat anys 90, talla M.",
        "description_gl": "Sudadeira Champion con logo bordado anos 90, talla M.",
        "price": 38.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "sudaderas",
        "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSep2jVyni3fNTPvcuEB5a72p7TfWok-Xf__Q&s",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Chaqueta Levi's Trucker Vintage",
        "name_en": "Vintage Levi's Trucker Jacket",
        "name_ca": "Jaqueta Levi's Trucker Vintage",
        "name_gl": "Chaqueta Levi's Trucker Vintage",
        "description": "Chaqueta vaquera Levi's Trucker años 80, talla L.",
        "description_en": "80s Levi's Trucker denim jacket, size L.",
        "description_ca": "Jaqueta texana Levi's Trucker anys 80, talla L.",
        "description_gl": "Chaqueta vaqueira Levi's Trucker anos 80, talla L.",
        "price": 85.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "chaquetas",
        "image_url": "https://m.media-amazon.com/images/I/61p40rOP6cL._AC_SL1000_.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Chándal Adidas Firebird Vintage",
        "name_en": "Vintage Adidas Firebird Tracksuit",
        "name_ca": "Xandall Adidas Firebird Vintage",
        "name_gl": "Chándal Adidas Firebird Vintage",
        "description": "Chándal Adidas Firebird completo años 80, talla M.",
        "description_en": "Complete 80s Adidas Firebird tracksuit, size M.",
        "description_ca": "Xandall Adidas Firebird complet anys 80, talla M.",
        "description_gl": "Chándal Adidas Firebird completo anos 80, talla M.",
        "price": 65.00, "stock": 3, "discount": 15.0, "condition": "used",
        "item_slug": "chandales-clasicos",
        "image_url": "https://fashionlawinstitute.es/wp-content/uploads/2024/05/412j-V0GpyS._SL160_.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Vaqueros Levi's 501 Vintage",
        "name_en": "Vintage Levi's 501 Jeans",
        "name_ca": "Texans Levi's 501 Vintage",
        "name_gl": "Vaqueiros Levi's 501 Vintage",
        "description": "Levi's 501 originales años 80, talla 32x32.",
        "description_en": "Original 80s Levi's 501, size 32x32.",
        "description_ca": "Levi's 501 originals anys 80, talla 32x32.",
        "description_gl": "Levi's 501 orixinais anos 80, talla 32x32.",
        "price": 65.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "levis",
        "image_url": "https://media.revistagq.com/photos/63cfabf0c40d662c393df90d/master/w_1600%2Cc_limit/198799_1200_A.jpeg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Zapatos Oxford Vintage",
        "name_en": "Vintage Oxford Shoes",
        "name_ca": "Sabates Oxford Vintage",
        "name_gl": "Zapatos Oxford Vintage",
        "description": "Zapatos Oxford de cuero años 70, talla 42.",
        "description_en": "70s leather Oxford shoes, size 42.",
        "description_ca": "Sabates Oxford de cuir anys 70, talla 42.",
        "description_gl": "Zapatos Oxford de coiro anos 70, talla 42.",
        "price": 45.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "zapatos",
        "image_url": "https://hombresconestilo.com/wp-content/uploads/2018/11/ejemplo-zapatos-oxford.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Zapatillas Nike Air Max 90",
        "name_en": "Nike Air Max 90 Sneakers",
        "name_ca": "Sabatilles Nike Air Max 90",
        "name_gl": "Zapatillas Nike Air Max 90",
        "description": "Nike Air Max 90 retro en colorway OG, talla 42.",
        "description_en": "Nike Air Max 90 retro in OG colorway, size 42.",
        "description_ca": "Nike Air Max 90 retro en colorway OG, talla 42.",
        "description_gl": "Nike Air Max 90 retro en colorway OG, talla 42.",
        "price": 120.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "zapatillas",
        "image_url": "https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/21536089-ba55-416a-9ee6-4ab5dc9f1116/W+AIR+MAX+90+SE.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Botas Doc Martens 1460",
        "name_en": "Doc Martens 1460 Boots",
        "name_ca": "Botes Doc Martens 1460",
        "name_gl": "Botas Doc Martens 1460",
        "description": "Doc Martens 1460 originales Made in England, talla 41.",
        "description_en": "Original Made in England Doc Martens 1460, size 41.",
        "description_ca": "Doc Martens 1460 originals Made in England, talla 41.",
        "description_gl": "Doc Martens 1460 orixinais Made in England, talla 41.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "botas",
        "image_url": "https://www.docmartens.com.co/images/large/60693621466554/Botas_Dr_Martens_1460_Abruzzo_Cuero_Enca_652_3_ZOOM.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Sandalias Birkenstock Arizona Vintage",
        "name_en": "Vintage Birkenstock Arizona Sandals",
        "name_ca": "Sandàlies Birkenstock Arizona Vintage",
        "name_gl": "Sandalias Birkenstock Arizona Vintage",
        "description": "Birkenstock Arizona años 80, cuero marrón claro.",
        "description_en": "80s Birkenstock Arizona sandals, light brown leather.",
        "description_ca": "Birkenstock Arizona anys 80, cuir marró clar.",
        "description_gl": "Birkenstock Arizona anos 80, coiro marrón claro.",
        "price": 55.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "otros-zapatos",
        "image_url": "http://ulanka.com/cdn/shop/files/3918605-S-PT-S-2-1.jpg?v=1722925133",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Anillo de Plata Años 70",
        "name_en": "70s Silver Ring",
        "name_ca": "Anell de Plata Anys 70",
        "name_gl": "Anel de Prata Anos 70",
        "description": "Anillo de plata de ley con grabado floral años 70.",
        "description_en": "Sterling silver ring with floral engraving, 70s.",
        "description_ca": "Anell de plata de llei amb gravat floral anys 70.",
        "description_gl": "Anel de prata de lei con gravado floral anos 70.",
        "price": 28.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "anillos",
        "image_url": "https://sacsash.com/wp-content/uploads/2024/07/anillo-artesanal-plata.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Pendientes Vintage Clip Dorados",
        "name_en": "Vintage Gold Clip-On Earrings",
        "name_ca": "Arracades Vintage Clip Daurades",
        "name_gl": "Pendentes Vintage Clip Dourados",
        "description": "Pendientes de clip dorados años 60, sin perforación.",
        "description_en": "60s gold clip-on earrings, no piercing needed.",
        "description_ca": "Arracades de clip daurades anys 60, sense perforació.",
        "description_gl": "Pendentes de clip dourados anos 60, sen perforación.",
        "price": 15.00, "stock": 6, "discount": 0.0, "condition": "used",
        "item_slug": "pendientes",
        "image_url": "https://cloud10.todocoleccion.online/vintage-moda/tc/2019/10/25/01/180984387_tcimg_3CB1FE29.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Collar Medallón Años 70",
        "name_en": "70s Medallion Necklace",
        "name_ca": "Collar Medalló Anys 70",
        "name_gl": "Colar Medallón Anos 70",
        "description": "Collar con medallón dorado de los años 70.",
        "description_en": "Gold medallion necklace from the 70s.",
        "description_ca": "Collar amb medalló daurat dels anys 70.",
        "description_gl": "Colar con medallón dourado dos anos 70.",
        "price": 22.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "collares",
        "image_url": "https://www.impulsivos.es/images/productos/CYLC.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Reloj Casio F-91W",
        "name_en": "Casio F-91W Watch",
        "name_ca": "Rellotge Casio F-91W",
        "name_gl": "Reloxo Casio F-91W",
        "description": "El reloj digital más icónico de Casio, nuevo en caja.",
        "description_en": "The most iconic Casio digital watch, new in box.",
        "description_ca": "El rellotge digital més icònic de Casio, nou en caixa.",
        "description_gl": "O reloxo dixital máis icónico de Casio, novo en caixa.",
        "price": 18.00, "stock": 15, "discount": 0.0, "condition": "new",
        "item_slug": "relojes",
        "image_url": "https://www.joyeriasanchez.com/177814-large_default/reloj-casio-digital-f-91w-1yeg.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Reloj Seiko 5 Automático Vintage",
        "name_en": "Vintage Seiko 5 Automatic Watch",
        "name_ca": "Rellotge Seiko 5 Automàtic Vintage",
        "name_gl": "Reloxo Seiko 5 Automático Vintage",
        "description": "Seiko 5 automático años 70, revisado con correa nueva.",
        "description_en": "70s Seiko 5 automatic, serviced with new strap.",
        "description_ca": "Seiko 5 automàtic anys 70, revisat amb corretja nova.",
        "description_gl": "Seiko 5 automático anos 70, revisado con correa nova.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "refurbished",
        "item_slug": "relojes",
        "image_url": "https://i.ebayimg.com/images/g/jyoAAOSwh7tk5yHK/s-l1200.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Broche Camafeo Vintage",
        "name_en": "Vintage Cameo Brooch",
        "name_ca": "Fermall Camafeu Vintage",
        "name_gl": "Broche Camafeo Vintage",
        "description": "Broche camafeo de nácar años 50, pieza única.",
        "description_en": "50s mother-of-pearl cameo brooch, unique piece.",
        "description_ca": "Fermall camafeu de nacre anys 50, peça única.",
        "description_gl": "Broche camafeo de nácar anos 50, peza única.",
        "price": 35.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "otros-joyeria-relojes",
        "image_url": "https://lh5.ggpht.com/-GQtLBFOrjf0/UUISlPj6nuI/AAAAAAAAANA/vPxkTz0M-q8/s1600/DSC_0205.JPG",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Bolso Gucci Vintage GG Canvas",
        "name_en": "Vintage Gucci GG Canvas Bag",
        "name_ca": "Bossa Gucci Vintage GG Canvas",
        "name_gl": "Bolso Gucci Vintage GG Canvas",
        "description": "Bolso Gucci GG canvas años 80, auténtico.",
        "description_en": "80s Gucci GG canvas bag, authentic.",
        "description_ca": "Bossa Gucci GG canvas anys 80, autèntica.",
        "description_gl": "Bolso Gucci GG canvas anos 80, auténtico.",
        "price": 250.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "bolsos",
        "image_url": "https://assets.catawiki.nl/assets/2024/10/3/f/f/0/ff0cd775-2664-461b-8977-93a3f0a8233a.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Riñonera Fila Vintage",
        "name_en": "Vintage Fila Fanny Pack",
        "name_ca": "Riñonera Fila Vintage",
        "name_gl": "Riñoneira Fila Vintage",
        "description": "Riñonera Fila años 90, estado impecable.",
        "description_en": "90s Fila fanny pack, impeccable condition.",
        "description_ca": "Riñonera Fila anys 90, estat impecable.",
        "description_gl": "Riñoneira Fila anos 90, estado impecable.",
        "price": 20.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "rinoneras",
        "image_url": "https://img.michollo.com/deals/EFcAJhvH2.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Gafas Ray-Ban Wayfarer Vintage",
        "name_en": "Vintage Ray-Ban Wayfarer Sunglasses",
        "name_ca": "Ulleres Ray-Ban Wayfarer Vintage",
        "name_gl": "Gafas Ray-Ban Wayfarer Vintage",
        "description": "Ray-Ban Wayfarer originales años 80, montura negra.",
        "description_en": "Original 80s Ray-Ban Wayfarer, black frame.",
        "description_ca": "Ray-Ban Wayfarer originals anys 80, muntura negra.",
        "description_gl": "Ray-Ban Wayfarer orixinais anos 80, montura negra.",
        "price": 85.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "gafas",
        "image_url": "https://assets2.sunglasshut.com/cdn-record-files-pi/71c68633-dfbb-4a35-9bc2-a358000441ec/0a37755b-5550-4bab-846f-b01300c7048e/0RB2140__902_57__P21__noshad__qt.png",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Parche Led Zeppelin Bordado",
        "name_en": "Embroidered Led Zeppelin Patch",
        "name_ca": "Pegat Led Zeppelin Brodat",
        "name_gl": "Parche Led Zeppelin Bordado",
        "description": "Parche bordado Led Zeppelin para chaqueta o mochila.",
        "description_en": "Embroidered Led Zeppelin patch for jacket or backpack.",
        "description_ca": "Pegat brodat Led Zeppelin per a jaqueta o motxilla.",
        "description_gl": "Parche bordado Led Zeppelin para chaqueta ou mochila.",
        "price": 5.00, "stock": 30, "discount": 0.0, "condition": "new",
        "item_slug": "parches",
        "image_url": "https://custom13.com/17991-thickbox_default/parche-bordado-led-zeppelin-redondo.jpg",
        "seller_email": "maria@test.com",
    },
    {
        "name": "Pack 10 Parches Rock Vintage",
        "name_en": "Vintage Rock Patch Pack x10",
        "name_ca": "Pack 10 Pegats Rock Vintage",
        "name_gl": "Pack 10 Parches Rock Vintage",
        "description": "Pack de 10 parches bordados de bandas rock de los 70-90.",
        "description_en": "Pack of 10 embroidered patches from 70s-90s rock bands.",
        "description_ca": "Pack de 10 pegats brodats de bandes rock dels 70-90.",
        "description_gl": "Pack de 10 parches bordados de bandas rock dos 70-90.",
        "price": 18.00, "stock": 8, "discount": 10.0, "condition": "new",
        "item_slug": "parches",
        "image_url": "https://www.rock4u.eu/img/c/32-Niara_category.jpg",
        "seller_email": "maria@test.com",
    },

    # ── COLECCIONISMO ─────────────────────────────────────────────────────────
    {
        "name": "Figura He-Man Masters of the Universe",
        "name_en": "He-Man Masters of the Universe Figure",
        "name_ca": "Figura He-Man Masters of the Universe",
        "name_gl": "Figura He-Man Masters of the Universe",
        "description": "He-Man original Mattel años 80 con espada y escudo.",
        "description_en": "Original 80s Mattel He-Man with sword and shield.",
        "description_ca": "He-Man original Mattel anys 80 amb espasa i escut.",
        "description_gl": "He-Man orixinal Mattel anos 80 con espada e escudo.",
        "price": 28.00, "stock": 3, "discount": 15.0, "condition": "used",
        "item_slug": "action-figures-80s-90s",
        "image_url": "https://tajmahalcomics.com/wp-content/uploads/2024/01/x_matthyd17.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Leonardo TMNT",
        "name_en": "Leonardo TMNT Figure",
        "name_ca": "Figura Leonardo TMNT",
        "name_gl": "Figura Leonardo TMNT",
        "description": "Figura original Leonardo Tortugas Ninja años 90, completa.",
        "description_en": "Original 90s Leonardo TMNT figure, complete with weapons.",
        "description_ca": "Figura original Leonardo Tortugues Ninja anys 90, completa.",
        "description_gl": "Figura orixinal Leonardo Tartarugas Ninja anos 90, completa.",
        "price": 35.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "action-figures-80s-90s",
        "image_url": "https://m.media-amazon.com/images/I/61FLOrTtrIL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Optimus Prime G1",
        "name_en": "G1 Optimus Prime Figure",
        "name_ca": "Figura Optimus Prime G1",
        "name_gl": "Figura Optimus Prime G1",
        "description": "Optimus Prime Transformers G1 original años 80, completo.",
        "description_en": "Original 80s G1 Transformers Optimus Prime, complete.",
        "description_ca": "Optimus Prime Transformers G1 original anys 80, complet.",
        "description_gl": "Optimus Prime Transformers G1 orixinal anos 80, completo.",
        "price": 80.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "action-figures-80s-90s",
        "image_url": "https://http2.mlstatic.com/D_NQ_NP_870309-MPE80752064401_112024-O.webp",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Mazinger Z Japonesa",
        "name_en": "Japanese Mazinger Z Figure",
        "name_ca": "Figura Mazinger Z Japonesa",
        "name_gl": "Figura Mazinger Z Xaponesa",
        "description": "Figura Mazinger Z edición japonesa de coleccionista.",
        "description_en": "Japanese edition Mazinger Z collector's figure.",
        "description_ca": "Figura Mazinger Z edició japonesa de col·leccionista.",
        "description_gl": "Figura Mazinger Z edición xaponesa de coleccionista.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "figuras-anime",
        "image_url": "https://m.media-amazon.com/images/I/71i2t-c7JWL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Dragon Ball Z Goku",
        "name_en": "Dragon Ball Z Goku Figure",
        "name_ca": "Figura Dragon Ball Z Goku",
        "name_gl": "Figura Dragon Ball Z Goku",
        "description": "Figura original Goku Super Saiyan de Irwin, años 90.",
        "description_en": "Original Irwin Super Saiyan Goku figure, 90s.",
        "description_ca": "Figura original Goku Super Saiyan d'Irwin, anys 90.",
        "description_gl": "Figura orixinal Goku Super Saiyan de Irwin, anos 90.",
        "price": 45.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "figuras-anime",
        "image_url": "https://pokeplush.cl/wp-content/uploads/2023/10/Figura-Dragon-Ball-Z-Goku.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Evangelion Unit 01 Resina",
        "name_en": "Evangelion Unit 01 Resin Figure",
        "name_ca": "Figura Evangelion Unit 01 Resina",
        "name_gl": "Figura Evangelion Unit 01 Resina",
        "description": "Figura resina Evangelion Unit-01 edición limitada numerada.",
        "description_en": "Evangelion Unit-01 limited edition numbered resin figure.",
        "description_ca": "Figura resina Evangelion Unit-01 edició limitada numerada.",
        "description_gl": "Figura resina Evangelion Unit-01 edición limitada numerada.",
        "price": 180.00, "stock": 1, "discount": 0.0, "condition": "new",
        "item_slug": "resina-edicion-limitada",
        "image_url": "https://cdn.athmanager.com/nihonfigures/archivos/evangelion-figura-alloy-anima-evangelion-unit-1-final-model-29-cm-p8803788i12961.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Pista Scalextric Años 80",
        "name_en": "80s Scalextric Track",
        "name_ca": "Circuit Scalextric Anys 80",
        "name_gl": "Pista Scalextric Anos 80",
        "description": "Pista Scalextric completa años 80 con dos coches.",
        "description_en": "Complete 80s Scalextric track with two cars.",
        "description_ca": "Circuit Scalextric complet anys 80 amb dos cotxes.",
        "description_gl": "Pista Scalextric completa anos 80 con dous coches.",
        "price": 55.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "juguetes-antiguos",
        "image_url": "https://offloadmedia.feverup.com/madridsecreto.co/wp-content/uploads/2021/03/16043823/WhatsApp-Image-2020-07-02-at-10.38.42-1.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Etch-a-Sketch Original",
        "name_en": "Original Etch-a-Sketch",
        "name_ca": "Etch-a-Sketch Original",
        "name_gl": "Etch-a-Sketch Orixinal",
        "description": "Etch-a-Sketch original años 80, funciona perfectamente.",
        "description_en": "Original 80s Etch-a-Sketch, works perfectly.",
        "description_ca": "Etch-a-Sketch original anys 80, funciona perfectament.",
        "description_gl": "Etch-a-Sketch orixinal anos 80, funciona perfectamente.",
        "price": 18.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "juguetes-antiguos",
        "image_url": "https://http2.mlstatic.com/D_NQ_NP_668266-MLM79961325084_102024-O.webp",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Figura Star Wars Han Solo Kenner",
        "name_en": "Star Wars Han Solo Kenner Figure",
        "name_ca": "Figura Star Wars Han Solo Kenner",
        "name_gl": "Figura Star Wars Han Solo Kenner",
        "description": "Figura Han Solo Kenner 1978, completa con blaster.",
        "description_en": "1978 Kenner Han Solo figure, complete with blaster.",
        "description_ca": "Figura Han Solo Kenner 1978, completa amb blaster.",
        "description_gl": "Figura Han Solo Kenner 1978, completa con blaster.",
        "price": 55.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "otros-figuras",
        "image_url": "https://cdn.juguetilandia.com/images/articulos/1999971862g00.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Carta Pikachu Base Set Holo",
        "name_en": "Pikachu Base Set Holo Card",
        "name_ca": "Carta Pikachu Base Set Holo",
        "name_gl": "Carta Pikachu Base Set Holo",
        "description": "Pikachu holográfico Base Set 1999, Near Mint.",
        "description_en": "1999 Base Set holographic Pikachu, Near Mint condition.",
        "description_ca": "Pikachu hologràfic Base Set 1999, Near Mint.",
        "description_gl": "Pikachu holográfico Base Set 1999, Near Mint.",
        "price": 60.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "pokemon",
        "image_url": "https://images.wikidexcdn.net/mwuploads/wikidex/9/99/latest/20180603165645/Pikachu_(Base_Set_2_TCG).png",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Carta Charizard Holo Base Set 1999",
        "name_en": "1999 Charizard Holo Base Set Card",
        "name_ca": "Carta Charizard Holo Base Set 1999",
        "name_gl": "Carta Charizard Holo Base Set 1999",
        "description": "Charizard Holo Base Set 1999, estado Near Mint.",
        "description_en": "1999 Base Set holographic Charizard, Near Mint.",
        "description_ca": "Charizard Holo Base Set 1999, estat Near Mint.",
        "description_gl": "Charizard Holo Base Set 1999, estado Near Mint.",
        "price": 250.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "pokemon",
        "image_url": "https://m.media-amazon.com/images/I/81y6KqdilQL._AC_UF894,1000_QL80_.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Carta Magic Black Lotus Alpha",
        "name_en": "Alpha Magic Black Lotus Card",
        "name_ca": "Carta Magic Black Lotus Alpha",
        "name_gl": "Carta Magic Black Lotus Alpha",
        "description": "Black Lotus Magic: The Gathering Alpha, auténtica.",
        "description_en": "Alpha edition Magic: The Gathering Black Lotus, authentic.",
        "description_ca": "Black Lotus Magic: The Gathering Alpha, autèntica.",
        "description_gl": "Black Lotus Magic: The Gathering Alpha, auténtica.",
        "price": 500.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "magic",
        "image_url": "https://i.ebayimg.com/00/s/MTYwMFgxMTU2/z/2pgAAOSwoaNePCCr/$_57.JPG",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Lote 50 Cartas Magic Vintage",
        "name_en": "Lot of 50 Vintage Magic Cards",
        "name_ca": "Lot 50 Cartes Magic Vintage",
        "name_gl": "Lote 50 Cartas Magic Vintage",
        "description": "Lote de 50 cartas Magic ediciones vintage 1994-1998.",
        "description_en": "Lot of 50 Magic cards vintage editions 1994-1998.",
        "description_ca": "Lot de 50 cartes Magic edicions vintage 1994-1998.",
        "description_gl": "Lote de 50 cartas Magic edicións vintage 1994-1998.",
        "price": 80.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "magic",
        "image_url": "https://foto.digdelray.com/upload/7/4b/74b28164f56ae3c24ad1b5767bf0b4eb_thumb.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Carta Red-Eyes Black Dragon 1ª Ed",
        "name_en": "Red-Eyes Black Dragon 1st Ed Card",
        "name_ca": "Carta Red-Eyes Black Dragon 1a Ed",
        "name_gl": "Carta Red-Eyes Black Dragon 1ª Ed",
        "description": "Red-Eyes Black Dragon Yu-Gi-Oh 1ª edición, excelente estado.",
        "description_en": "Yu-Gi-Oh Red-Eyes Black Dragon 1st edition, excellent condition.",
        "description_ca": "Red-Eyes Black Dragon Yu-Gi-Oh 1a edició, excel·lent estat.",
        "description_gl": "Red-Eyes Black Dragon Yu-Gi-Oh 1ª edición, excelente estado.",
        "price": 45.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "yugioh",
        "image_url": "https://images.saymedia-content.com/.image/t_share/MTc0NDYwODA5NDc1OTI1MzUy/top-10-cards-you-need-for-your-red-eyes-black-dragon-yu-gi-oh-deck.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Lote Cromos Panini Mundial 82",
        "name_en": "Panini World Cup 82 Sticker Lot",
        "name_ca": "Lot Cromos Panini Mundial 82",
        "name_gl": "Lote Cromos Panini Mundial 82",
        "description": "Lote de cromos Panini del Mundial de España 1982.",
        "description_en": "Lot of Panini stickers from the 1982 Spain World Cup.",
        "description_ca": "Lot de cromos Panini del Mundial d'Espanya 1982.",
        "description_gl": "Lote de cromos Panini do Mundial de España 1982.",
        "price": 30.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "otros-cartas",
        "image_url": "https://imgv2-2-f.scribdassets.com/img/document/721934165/original/833e8c8d65/1714316611?v=1",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Litografía Star Wars Numerada 1/500",
        "name_en": "Numbered Star Wars Lithograph 1/500",
        "name_ca": "Litografia Star Wars Numerada 1/500",
        "name_gl": "Litografía Star Wars Numerada 1/500",
        "description": "Litografía original Star Wars edición numerada 1/500.",
        "description_en": "Original Star Wars lithograph numbered edition 1/500.",
        "description_ca": "Litografia original Star Wars edició numerada 1/500.",
        "description_gl": "Litografía orixinal Star Wars edición numerada 1/500.",
        "price": 150.00, "stock": 1, "discount": 0.0, "condition": "new",
        "item_slug": "ediciones-numeradas",
        "image_url": "https://coleccionanostalgia.com/2333-large_default/star-wars.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Game Boy Light Edición Japonesa",
        "name_en": "Japanese Game Boy Light Edition",
        "name_ca": "Game Boy Light Edició Japonesa",
        "name_gl": "Game Boy Light Edición Xaponesa",
        "description": "Game Boy Light edición japonesa, descatalogada en Europa.",
        "description_en": "Japanese Game Boy Light edition, discontinued in Europe.",
        "description_ca": "Game Boy Light edició japonesa, descatalogada a Europa.",
        "description_gl": "Game Boy Light edición xaponesa, descatalogada en Europa.",
        "price": 220.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "descatalogadas",
        "image_url": "https://static.wixstatic.com/media/970a22_eb8915d219cc4d408ecf332efd8cda34~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Cartucho Prototipo NES",
        "name_en": "NES Prototype Cartridge",
        "name_ca": "Cartutx Prototip NES",
        "name_gl": "Cartucho Prototipo NES",
        "description": "Cartucho prototipo NES sin lanzamiento comercial, rarísimo.",
        "description_en": "NES prototype cartridge never commercially released, very rare.",
        "description_ca": "Cartutx prototip NES sense llançament comercial, raríssim.",
        "description_gl": "Cartucho prototipo NES sen lanzamento comercial, rarísimo.",
        "price": 800.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "rarezas",
        "image_url": "https://pxplayers.com/wp-content/uploads/2023/11/NES-Cartucho-1-scaled.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Set LEGO Classic Space 928 Vintage",
        "name_en": "Vintage LEGO Classic Space 928",
        "name_ca": "Set LEGO Classic Space 928 Vintage",
        "name_gl": "Set LEGO Classic Space 928 Vintage",
        "description": "LEGO Classic Space 928 Galaxy Explorer original 1979.",
        "description_en": "Original 1979 LEGO Classic Space 928 Galaxy Explorer.",
        "description_ca": "LEGO Classic Space 928 Galaxy Explorer original 1979.",
        "description_gl": "LEGO Classic Space 928 Galaxy Explorer orixinal 1979.",
        "price": 400.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "otros-ediciones-limitadas",
        "image_url": "https://media.karousell.com/media/photos/products/2020/4/27/vintage_lego_classic_space_set_1587997697_6b71ce2f_progressive.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Don Quijote Facsímil 1ª Edición 1605",
        "name_en": "Don Quixote Facsimile 1st Edition 1605",
        "name_ca": "Don Quijote Facsímil 1a Edició 1605",
        "name_gl": "Don Quixote Facsímile 1ª Edición 1605",
        "description": "Facsímil certificado de la primera edición del Quijote.",
        "description_en": "Certified facsimile of the first edition of Don Quixote.",
        "description_ca": "Facsímil certificat de la primera edició del Quixot.",
        "description_gl": "Facsímile certificado da primeira edición do Quixote.",
        "price": 180.00, "stock": 2, "discount": 0.0, "condition": "new",
        "item_slug": "primeras-ediciones",
        "image_url": "https://1.bp.blogspot.com/-_3dc31B0tnA/VxhzUKgtDaI/AAAAAAAAPuw/vUYL0VUPris5z0K7NfZLHyt2sUSwAEQrQCLcB/s1600/IMG_20160421_082924.JPG",
        "seller_email": "alex@test.com",
    },
    {
        "name": "El Señor de los Anillos Ilustrado Tolkien",
        "name_en": "Illustrated Lord of the Rings Tolkien",
        "name_ca": "El Senyor dels Anells Il·lustrat Tolkien",
        "name_gl": "O Señor dos Aneis Ilustrado Tolkien",
        "description": "El Señor de los Anillos edición ilustrada numerada.",
        "description_en": "The Lord of the Rings numbered illustrated edition.",
        "description_ca": "El Senyor dels Anells edició il·lustrada numerada.",
        "description_gl": "O Señor dos Aneis edición ilustrada numerada.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "new",
        "item_slug": "ediciones-especiales",
        "image_url": "https://aurynlibros.mx/wp-content/uploads/2025/02/9788445019580-552x777.png",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Guía Oficial Zelda Ocarina of Time",
        "name_en": "Official Zelda Ocarina of Time Guide",
        "name_ca": "Guia Oficial Zelda Ocarina of Time",
        "name_gl": "Guía Oficial Zelda Ocarina of Time",
        "description": "Guía oficial de Nintendo para Zelda OoT, descatalogada.",
        "description_en": "Official Nintendo guide for Zelda OoT, out of print.",
        "description_ca": "Guia oficial de Nintendo per a Zelda OoT, descatalogada.",
        "description_gl": "Guía oficial de Nintendo para Zelda OoT, descatalogada.",
        "price": 45.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "descatalogados",
        "image_url": "https://imgv2-2-f.scribdassets.com/img/document/75039623/original/fcd56740d0/1724010116?v=1",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Amazing Fantasy #15 Réplica Certificada",
        "name_en": "Amazing Fantasy #15 Certified Replica",
        "name_ca": "Amazing Fantasy #15 Rèplica Certificada",
        "name_gl": "Amazing Fantasy #15 Réplica Certificada",
        "description": "Réplica certificada Amazing Fantasy #15 primera aparición Spiderman.",
        "description_en": "Certified replica Amazing Fantasy #15 first Spiderman appearance.",
        "description_ca": "Rèplica certificada Amazing Fantasy #15 primera aparició Spiderman.",
        "description_gl": "Réplica certificada Amazing Fantasy #15 primeira aparición Spiderman.",
        "price": 95.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "marvel",
        "image_url": "https://i.ebayimg.com/images/g/XiMAAeSwZUFpkNKx/s-l1600.webp",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Detective Comics #27 Réplica",
        "name_en": "Detective Comics #27 Replica",
        "name_ca": "Detective Comics #27 Rèplica",
        "name_gl": "Detective Comics #27 Réplica",
        "description": "Réplica Detective Comics #27 primera aparición Batman.",
        "description_en": "Detective Comics #27 replica, first Batman appearance.",
        "description_ca": "Rèplica Detective Comics #27 primera aparició Batman.",
        "description_gl": "Réplica Detective Comics #27 primeira aparición Batman.",
        "price": 85.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "dc-comics",
        "image_url": "https://imgv2-2-f.scribdassets.com/img/document/614391696/original/4d08240ac3/1707849084?v=1",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Póster Star Wars Original 1977",
        "name_en": "Original Star Wars Poster 1977",
        "name_ca": "Pòster Star Wars Original 1977",
        "name_gl": "Póster Star Wars Orixinal 1977",
        "description": "Póster original de Star Wars Una Nueva Esperanza, 1977.",
        "description_en": "Original Star Wars A New Hope poster, 1977.",
        "description_ca": "Pòster original de Star Wars Una Nova Esperança, 1977.",
        "description_gl": "Póster orixinal de Star Wars Unha Nova Esperanza, 1977.",
        "price": 120.00, "stock": 1, "discount": 0.0, "condition": "used",
        "item_slug": "posters-originales",
        "image_url": "http://posterhouseuy.com/cdn/shop/files/20231114_023356494_iOS.jpg?v=1700524552",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Revista Micromania Nº1 1988",
        "name_en": "Micromania Magazine No.1 1988",
        "name_ca": "Revista Micromania Nº1 1988",
        "name_gl": "Revista Micromania Nº1 1988",
        "description": "Primer número de Micromania España, 1988. Pieza histórica.",
        "description_en": "First issue of Micromania Spain, 1988. Historic piece.",
        "description_ca": "Primer número de Micromania Espanya, 1988. Peça històrica.",
        "description_gl": "Primeiro número de Micromania España, 1988. Peza histórica.",
        "price": 40.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "publicidad",
        "image_url": "https://cloud10.todocoleccion.online/coleccionismo-revistas-periodicos/tc/2024/07/10/17/490470477_tcimg_EC327385.jpg?r=3&size=230x230&crop=true",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Cartel Publicitario Coca-Cola 1950",
        "name_en": "Coca-Cola Advertising Poster 1950",
        "name_ca": "Cartell Publicitari Coca-Cola 1950",
        "name_gl": "Cartel Publicitario Coca-Cola 1950",
        "description": "Cartel publicitario original Coca-Cola años 50.",
        "description_en": "Original 1950s Coca-Cola advertising poster.",
        "description_ca": "Cartell publicitari original Coca-Cola anys 50.",
        "description_gl": "Cartel publicitario orixinal Coca-Cola anos 50.",
        "price": 65.00, "stock": 2, "discount": 0.0, "condition": "used",
        "item_slug": "publicidad",
        "image_url": "https://cloud10.todocoleccion.online/coleccionismo-coca-cola/tc/2016/12/04/14/68372649.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Catálogo IKEA 1975",
        "name_en": "1975 IKEA Catalogue",
        "name_ca": "Catàleg IKEA 1975",
        "name_gl": "Catálogo IKEA 1975",
        "description": "Catálogo IKEA de 1975, pieza de coleccionista.",
        "description_en": "1975 IKEA catalogue, collector's piece.",
        "description_ca": "Catàleg IKEA de 1975, peça de col·leccionista.",
        "description_gl": "Catálogo IKEA de 1975, peza de coleccionista.",
        "price": 25.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "otros-libros-comics-revistas",
        "image_url": "https://ikeamuseum.com/wp-content/uploads/2021/04/im-ikeacatalogue-1975.jpg?sv=2022-11-02&ss=bf&srt=o&sp=rwact&se=2032-07-19T20:53:53Z&st=2023-07-19T00:53:53Z&spr=https,http&sig=CbW5rmYp6FrCBT77fuGZVaQIyQ6kOS0Coe6AbA3prrw%3D",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Moneda Peseta 1 Pta 1947",
        "name_en": "1947 Spanish Peseta Coin",
        "name_ca": "Moneda Pesseta 1 Pta 1947",
        "name_gl": "Moeda Peseta 1 Pta 1947",
        "description": "Moneda de 1 peseta española 1947, estado MBC.",
        "description_en": "1947 Spanish 1 peseta coin, VF condition.",
        "description_ca": "Moneda d'1 pesseta espanyola 1947, estat MBC.",
        "description_gl": "Moeda de 1 peseta española 1947, estado MBC.",
        "price": 8.00, "stock": 10, "discount": 0.0, "condition": "used",
        "item_slug": "monedas",
        "image_url": "https://cloud10.todocoleccion.online/monedas-franco/tc/2019/01/03/20/145643094.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Lote 20 Monedas Pesetas",
        "name_en": "Lot of 20 Peseta Coins",
        "name_ca": "Lot 20 Monedes Pessetes",
        "name_gl": "Lote 20 Moedas Pesetas",
        "description": "Lote de 20 monedas de pesetas diferentes años.",
        "description_en": "Lot of 20 peseta coins from different years.",
        "description_ca": "Lot de 20 monedes de pessetes de diferents anys.",
        "description_gl": "Lote de 20 moedas de pesetas de diferentes anos.",
        "price": 30.00, "stock": 4, "discount": 0.0, "condition": "used",
        "item_slug": "monedas",
        "image_url": "https://cloud10.todocoleccion.online/monedas-franco/tc/2019/11/11/15/182858928.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Colección Sellos España 1930s",
        "name_en": "Spain 1930s Stamp Collection",
        "name_ca": "Col·lecció Segells Espanya 1930s",
        "name_gl": "Colección Selos España 1930s",
        "description": "Colección de sellos españoles años 30, sin circular.",
        "description_en": "Collection of 1930s Spanish stamps, mint condition.",
        "description_ca": "Col·lecció de segells espanyols anys 30, sense circular.",
        "description_gl": "Colección de selos españois anos 30, sen circular.",
        "price": 45.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "sellos",
        "image_url": "https://www.filateliahaeffner.com/wp-content/uploads/2021/02/MARROC-81-001.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Postal Fotográfica Barcelona 1910",
        "name_en": "Old Barcelona Photographic Postcard 1910",
        "name_ca": "Postal Fotogràfica Barcelona 1910",
        "name_gl": "Postal Fotográfica Barcelona 1910",
        "description": "Postal fotográfica de Barcelona 1910, circulada con sello.",
        "description_en": "1910 photographic postcard of Barcelona, posted with stamp.",
        "description_ca": "Postal fotogràfica de Barcelona 1910, circulada amb segell.",
        "description_gl": "Postal fotográfica de Barcelona 1910, circulada con selo.",
        "price": 12.00, "stock": 5, "discount": 0.0, "condition": "used",
        "item_slug": "postales",
        "image_url": "https://publicacions-media.dtibcn.cat/7IUAVxXN4PFqhZl_18KEWbZDZm8=/fit-in/700x699/filters:fill(fff,1):quality(100)/files/20236/dfa79e8d_alb_2480.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mapa Antiguo España 1652",
        "name_en": "Old Map of Spain 1652",
        "name_ca": "Mapa Antic Espanya 1652",
        "name_gl": "Mapa Antigo España 1652",
        "description": "Reproducción de mapa antiguo de España datado en 1652.",
        "description_en": "Reproduction of old map of Spain dated 1652.",
        "description_ca": "Reprodució de mapa antic d'Espanya datat de 1652.",
        "description_gl": "Reprodución de mapa antigo de España datado en 1652.",
        "price": 35.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "postales",
        "image_url": "https://i.blogs.es/bd03d8/nova-et-accurata-tabula-hispaniae-1652/650_1200.jpg",
        "seller_email": "alex@test.com",
    },
    {
        "name": "Mechero Zippo Vintage",
        "name_en": "Vintage Zippo Lighter",
        "name_ca": "Encenedor Zippo Vintage",
        "name_gl": "Mecheiro Zippo Vintage",
        "description": "Mechero Zippo original años 60 con grabado.",
        "description_en": "Original 60s Zippo lighter with engraving.",
        "description_ca": "Encenedor Zippo original anys 60 amb gravat.",
        "description_gl": "Mecheiro Zippo orixinal anos 60 con gravado.",
        "price": 45.00, "stock": 3, "discount": 0.0, "condition": "used",
        "item_slug": "otros-coleccionables",
        "image_url": "https://fenixterra.com/wp-content/uploads/2022/07/60001167-scaled.jpeg",
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
    Incident.query.delete()
    Shipment.query.delete()
    OrderDetail.query.delete()
    Order.query.delete()
    Address.query.delete()
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


def seed_addresses(users):
    """Crea una dirección por cada usuario."""
    print("\n📍 Seeding direcciones...")
    addresses = {}

    address_data = [
        {"full_name": "Lucía Sánchez",   "phone": "+34 611 111 111", "address": "Calle Mayor 1",        "city": "Madrid",    "province": "Madrid",    "postal_code": "28001", "country": "España"},
        {"full_name": "Pablo Fernández", "phone": "+34 622 222 222", "address": "Calle Sierpes 10",     "city": "Sevilla",   "province": "Sevilla",   "postal_code": "41001", "country": "España"},
        {"full_name": "Elena Ruiz",      "phone": "+34 633 333 333", "address": "Passeig de Gràcia 20", "city": "Barcelona", "province": "Barcelona", "postal_code": "08007", "country": "España"},
        {"full_name": "Javier Moreno",   "phone": "+34 644 444 444", "address": "Gran Vía 5",           "city": "Valencia",  "province": "Valencia",  "postal_code": "46002", "country": "España"},
        {"full_name": "Ana Jiménez",     "phone": "+34 655 555 555", "address": "Calle Larios 3",       "city": "Málaga",    "province": "Málaga",    "postal_code": "29005", "country": "España"},
        {"full_name": "PlayBack Admin",  "phone": "+34 666 000 000", "address": "Calle Sin Nombre 0",   "city": "Madrid",    "province": "Madrid",    "postal_code": "28001", "country": "España"},
        {"full_name": "Carlos García",   "phone": "+34 612 345 678", "address": "Calle Mayor 12",       "city": "Madrid",    "province": "Madrid",    "postal_code": "28001", "country": "España"},
        {"full_name": "María López",     "phone": "+34 623 456 789", "address": "Passeig de Gràcia 55", "city": "Barcelona", "province": "Barcelona", "postal_code": "08007", "country": "España"},
        {"full_name": "Alejandro Martínez", "phone": "+34 634 567 890", "address": "Gran Vía 10",       "city": "Valencia",  "province": "Valencia",  "postal_code": "46002", "country": "España"},
        {"full_name": "Arantxa Ordoyo",  "phone": "+34 600 000 000", "address": "Calle Test 1",         "city": "Madrid",    "province": "Madrid",    "postal_code": "28001", "country": "España"},
        {"full_name": "PlayBack Seller", "phone": "+34 666 000 666", "address": "Calle Sin Nombre 1",   "city": "Madrid",    "province": "Madrid",    "postal_code": "28001", "country": "España"},
    ]

    for i, user in enumerate(users):
        data = address_data[i % len(address_data)]
        addr = Address(
            user_id=user.id,
            full_name=data["full_name"],
            phone=data["phone"],
            address=data["address"],
            city=data["city"],
            province=data["province"],
            postal_code=data["postal_code"],
            country=data["country"],
        )
        db.session.add(addr)
        db.session.flush()
        addresses[user.id] = addr
        print(f"  [OK]   {user.email} → {addr.city}")

    return addresses


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
            name={
                "es": p["name"],
                "en": p.get("name_en", p["name"]),
                "ca": p.get("name_ca", p["name"]),
                "gl": p.get("name_gl", p["name"]),
            },
            description={
                "es": p["description"],
                "en": p.get("description_en", p["description"]),
                "ca": p.get("description_ca", p["description"]),
                "gl": p.get("description_gl", p["description"]),
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


def seed_orders(users, products, addresses):
    """
    Crea pedidos con diferentes estados.
    Solo los buyers y admins hacen pedidos.
    """
    print("\n🛒 Seeding pedidos...")
    orders = []
    all_statuses = [Status.confirmed, Status.paid, Status.shipped, Status.delivered, Status.cancelled]
    all_payments = list(Payment)

    # Solo usuarios no vendedores hacen pedidos
    buyers = [u for u in users if u.role != RoleName.seller]

    # Cola de estados garantizados (cada estado aparece al menos 3 veces)
    status_queue = all_statuses * 3
    random.shuffle(status_queue)

    

    for user in buyers:
        addr = addresses.get(user.id)
        n_orders = random.randint(3, 6)
        for _ in range(n_orders):
            order_items = [(p, random.randint(1, 2)) for p in random.sample(products, min(random.randint(1, 4), len(products)))]

            subtotal    = round(sum(p.price * (1 - p.discount / 100) * qty for p, qty in order_items), 2)
            tax         = round(subtotal - (subtotal / 1.21), 2)
            shipping    = round(random.uniform(3.5, 9.99), 2)
            total_price = round(subtotal + shipping, 2)

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
                shipping_address_id=addr.id if addr else None,
                billing_address_id=addr.id if addr else None,
            )
            db.session.add(order)
            db.session.flush()

            for p, qty in order_items:
                db.session.add(OrderDetail(order_id=order.id, product_id=p.id, quantity=qty))

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


def seed_playback_seller_orders(users, products, addresses):
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

    all_statuses = [Status.confirmed, Status.paid, Status.shipped, Status.delivered, Status.cancelled]
    orders = []

    for buyer in buyers:
        addr = addresses.get(buyer.id)
        for _ in range(random.randint(1, 3)):
            order_items = [(p, random.randint(1, 2)) for p in random.sample(my_products, min(random.randint(1, 3), len(my_products)))]

            subtotal    = round(sum(p.price * (1 - p.discount / 100) * qty for p, qty in order_items), 2)
            tax         = round(subtotal - (subtotal / 1.21), 2)
            shipping    = round(random.uniform(3.5, 9.99), 2)
            total_price = round(subtotal + shipping, 2)
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
                shipping_address_id=addr.id if addr else None,
                billing_address_id=addr.id if addr else None,
            )
            db.session.add(order)
            db.session.flush()

            for p, qty in order_items:
                db.session.add(OrderDetail(order_id=order.id, product_id=p.id, quantity=qty))

            orders.append(order)
            print(f"  [OK]   {buyer.email} → {status.value:12} | {total_price:.2f}€")

    db.session.flush()
    print(f"\n  Total pedidos PlayBack: {len(orders)}")
    return orders


def seed_arantxa_orders(users, products, addresses):
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
    all_statuses = [Status.confirmed, Status.paid, Status.shipped, Status.delivered, Status.cancelled]
    orders = []

    for buyer in buyers:
        addr = addresses.get(buyer.id)
        for _ in range(random.randint(1, 3)):
            order_items = [(p, random.randint(1, 2)) for p in random.sample(my_products, min(random.randint(1, 3), len(my_products)))]

            subtotal    = round(sum(p.price * (1 - p.discount / 100) * qty for p, qty in order_items), 2)
            tax         = round(subtotal - (subtotal / 1.21), 2)
            shipping    = round(random.uniform(3.5, 9.99), 2)
            total_price = round(subtotal + shipping, 2)
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
                shipping_address_id=addr.id if addr else None,
                billing_address_id=addr.id if addr else None,
            )
            db.session.add(order)
            db.session.flush()

            for p, qty in order_items:
                db.session.add(OrderDetail(order_id=order.id, product_id=p.id, quantity=qty))

            orders.append(order)
            print(f"  [OK]   {buyer.email} → {status.value} | {total_price:.2f}€")

    db.session.flush()
    print(f"  Total: {len(orders)} pedidos")
    return orders
# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
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
            addresses = seed_addresses(users)
            products = seed_products(sellers)

            if not products:
                print("\n⚠️  Sin productos — ejecuta seed_categories.py primero.")
                sys.exit(1)

            orders = seed_orders(users, products, addresses)
            seed_playback_seller_orders(users, products, addresses) 
            seed_arantxa_orders(users, products, addresses)
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