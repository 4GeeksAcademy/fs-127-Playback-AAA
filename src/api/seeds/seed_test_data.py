"""
Seed de datos de prueba — usuarios, productos, pedidos, reviews y favoritos.
"""

import sys
import os
import random
from datetime import datetime, timezone, timedelta
from sqlalchemy import cast, String
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
    # ── CONSOLAS NINTENDO ─────────────────────────────────────────────────────
    {"name": "NES Classic Edition",            "description": "Consola NES en perfecto estado con mando original.",                        "price": 89.99,  "stock": 5,  "discount": 0.0,  "item_slug": "nes",               "image_url": "https://m.media-amazon.com/images/I/71YTum90-lL.jpg"},
    {"name": "SNES con Mario World",           "description": "Super Nintendo con cartucho de Super Mario World incluido.",                 "price": 120.00, "stock": 3,  "discount": 10.0, "item_slug": "snes",              "image_url": "https://m.media-amazon.com/images/I/51JgQtlGh8L._AC_UF894,1000_QL80_.jpg"},
    {"name": "Game Boy Original DMG",          "description": "Game Boy original modelo DMG con carcasa gris.",                            "price": 55.00,  "stock": 8,  "discount": 0.0,  "item_slug": "game-boy",          "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Game-Boy-FL.png/1280px-Game-Boy-FL.png"},
    {"name": "Game Boy Color Morada",          "description": "Game Boy Color en color morado translúcido, estado impecable.",             "price": 70.00,  "stock": 4,  "discount": 0.0,  "item_slug": "game-boy",          "image_url": "https://www.todoconsolas.com/344840-large_default/game_boy_color_violeta_po215947.jpg"},
    {"name": "Game Boy Advance SP Azul",       "description": "GBA SP con pantalla retroiluminada y cargador original.",                   "price": 95.00,  "stock": 3,  "discount": 5.0,  "item_slug": "game-boy-advance",  "image_url": "https://m.media-amazon.com/images/I/61hNR9cWhZL.jpg"},
    {"name": "Nintendo 64 Gris",               "description": "Nintendo 64 con mando y cables originales.",                                "price": 110.00, "stock": 3,  "discount": 0.0,  "item_slug": "nintendo-64",       "image_url": "https://i.blogs.es/bfd715/n64/450_1000.png"},
    {"name": "GameCube Plateada",              "description": "GameCube en color plateado con mando morado.",                              "price": 130.00, "stock": 2,  "discount": 0.0,  "item_slug": "gamecube",          "image_url": "https://media2.gameplaystores.es/74876-large_default/gamecube-plateada-mando-sin-caja-gc.jpg"},

  # ── CONSOLAS SEGA ─────────────────────────────────────────────────────────
    {"name": "Mega Drive II",                  "description": "Mega Drive II con dos mandos y cable AV.",                                  "price": 75.00,  "stock": 4,  "discount": 5.0,  "item_slug": "mega-drive",        "image_url": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRU-2bZoL0xsKAKW_z_RFuRVM9bOkacoS9Up71_rCp-byNdo9JRQindt7L2zMrdxKgQ5CqN3pnoGzcb7Tym4j-FosaGLNY3"},
    {"name": "Sega Master System II",          "description": "Master System II con Alex Kidd integrado.",                                 "price": 60.00,  "stock": 5,  "discount": 0.0,  "item_slug": "master-system",     "image_url": "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSp_w1su1Mdj8Hs7mqb3QoEfM4tdPY5bfcPzRtSVvY3kd0AJAie7_EPsrzEJ5XyR4VW2FejcOzz_BzyTHcWj1FjhUqQyzJh"},
    {"name": "Sega Game Gear Roja",            "description": "Game Gear en rojo con pantalla en perfecto estado.",                        "price": 65.00,  "stock": 3,  "discount": 10.0, "item_slug": "game-gear",         "image_url": "https://www.japanzon.com/24351-product_hd/sega-game-gear-micro-rojo.jpg"},
    {"name": "Sega Dreamcast",                 "description": "Dreamcast con VMU y mando original, funciona perfectamente.",               "price": 95.00,  "stock": 2,  "discount": 0.0,  "item_slug": "dreamcast",         "image_url": "https://i.blogs.es/5ad1a1/dreamcast_01/650_1200.jpg"},
    {"name": "Sega Saturn Gris",               "description": "Sega Saturn con mando y fuente de alimentación original.",                  "price": 120.00, "stock": 2,  "discount": 0.0,  "item_slug": "saturn",            "image_url": "https://m.media-amazon.com/images/I/71-4crm7mML.jpg"},

    # ── CONSOLAS PLAYSTATION / XBOX ───────────────────────────────────────────
    {"name": "PlayStation 1 ",                 "description": "PS1 PAL en buen estado con memory card.",                                   "price": 65.00,  "stock": 6,  "discount": 0.0,  "item_slug": "ps1",               "image_url": "https://m.media-amazon.com/images/I/71TCoWMwK+L.jpg"},
    {"name": "PlayStation 2 Slim Negra",       "description": "PS2 Slim en negro con dos mandos DualShock 2.",                             "price": 85.00,  "stock": 4,  "discount": 0.0,  "item_slug": "ps2",               "image_url": "https://d2e6ccujb3mkqf.cloudfront.net/2eb54452-73ab-4cc2-83ce-dece99b9a1f9-1_959ca981-d879-41b7-807e-204efb73d96d.jpg"},
    {"name": "PSP ",                           "description": "PSP 3000 en blanco con funda y cargador.",                                  "price": 80.00,  "stock": 5,  "discount": 5.0,  "item_slug": "psp",               "image_url": "https://m.media-amazon.com/images/I/51CbBOgUaGL.jpg"},
    {"name": "Xbox Clásica Negra",             "description": "Xbox original con mando Duke y cables.",                                    "price": 70.00,  "stock": 3,  "discount": 0.0,  "item_slug": "xbox",              "image_url": "https://i.blogs.es/f65b01/xbox-original/650_1200.jpg"},

    # ── VIDEOJUEGOS CARTUCHO ──────────────────────────────────────────────────
    {"name": "Pokémon Edición Roja",           "description": "Cartucho original de Pokémon Rojo para Game Boy.",                          "price": 35.00,  "stock": 7,  "discount": 0.0,  "item_slug": "juegos-game-boy",   "image_url": "https://media2.gameplaystores.es/77648-large_default/pokemon-rojo-cartucho-gb.jpg"},
    {"name": "Pokémon Edición Azul",           "description": "Cartucho original Pokémon Azul Game Boy, batería funcional.",               "price": 33.00,  "stock": 5,  "discount": 0.0,  "item_slug": "juegos-game-boy",   "image_url": "https://media2.gameplaystores.es/77646-large_default/pokemon-azul-cartucho-gb.jpg"},
    {"name": "Super Mario Bros 3 NES",         "description": "Cartucho original Super Mario Bros 3 para NES.",                            "price": 45.00,  "stock": 4,  "discount": 0.0,  "item_slug": "juegos-nes",        "image_url": "https://www.todoconsolas.com/308618-medium_default/super_mario_bros_3_nes_sp_po8443.jpg"},
    {"name": "Zelda A Link to the Past SNES",  "description": "The Legend of Zelda A Link to the Past cartucho PAL.",                      "price": 55.00,  "stock": 3,  "discount": 0.0,  "item_slug": "juegos-snes",       "image_url": "https://cdn11.bigcommerce.com/s-ymgqt/images/stencil/1000w/products/26452/33322/Legend-of-Zelda-A-Link-To-t__89317.1712937460.jpg?c=2"},
    {"name": "Sonic the Hedgehog Mega Drive",  "description": "Sonic 1 cartucho original para Mega Drive, completo con caja.",             "price": 40.00,  "stock": 6,  "discount": 0.0,  "item_slug": "juegos-mega-drive", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROg9k-9v7OYh9H9bwlun7oh7n9pyqI_bcq9Q&s"},
    {"name": "GoldenEye 007 N64",              "description": "GoldenEye 007 cartucho original para Nintendo 64.",                         "price": 50.00,  "stock": 4,  "discount": 0.0,  "item_slug": "juegos-nintendo-64","image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPo0fYRIsSTEYir_VND0m40qs6Oc2kdggSDg&s"},

    # ── VIDEOJUEGOS CD/DVD ────────────────────────────────────────────────────
    {"name": "Final Fantasy VII PS1",          "description": "Final Fantasy VII PAL completo con caja y manual.",                         "price": 75.00,  "stock": 3,  "discount": 0.0,  "item_slug": "juegos-ps1",        "image_url": "https://i.etsystatic.com/20685833/r/il/d09585/5220865797/il_fullxfull.5220865797_qg92.jpg"},
    {"name": "GTA San Andreas PS2",            "description": "Grand Theft Auto San Andreas para PS2, completo.",                          "price": 25.00,  "stock": 8,  "discount": 0.0,  "item_slug": "juegos-ps2",        "image_url": "https://media.game.es/COVERV2/3D_L/049/049906.png"},
    {"name": "Shenmue Dreamcast",              "description": "Shenmue para Dreamcast, edición PAL completa con caja.",                    "price": 60.00,  "stock": 2,  "discount": 0.0,  "item_slug": "juegos-dreamcast",  "image_url": "https://media.vandal.net/m/31/shenmue-201961215304614_1.jpg"},

    # ── MÚSICA - VINILOS ──────────────────────────────────────────────────────
    {"name": "Vinilo Led Zeppelin IV",         "description": "Led Zeppelin IV edición original 1971.",                                    "price": 45.00,  "stock": 2,  "discount": 0.0,  "item_slug": "discos-de-vinilo",  "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2019/10/Led-Zeppelin-1200x1200.png"},
    {"name": "Vinilo Pink Floyd The Wall",     "description": "The Wall doble vinilo edición original 1979.",                              "price": 60.00,  "stock": 2,  "discount": 0.0,  "item_slug": "discos-de-vinilo",  "image_url": "https://www.emp-online.es/dw/image/v2/BBQV_PRD/on/demandware.static/-/Sites-master-emp/default/dw9a04de7a/images/2/2/7/4/227441-emp.jpg?sw=1000&sh=800&sm=fit&sfrm=png"},
    {"name": "Vinilo David Bowie Ziggy",       "description": "Ziggy Stardust vinilo original 1972, buen estado.",                         "price": 55.00,  "stock": 3,  "discount": 0.0,  "item_slug": "discos-de-vinilo",  "image_url": "https://static.fnac-static.com/multimedia/Images/ES/NR/59/39/74/7616857/1540-1.jpg"},
    {"name": "Vinilo Nirvana Nevermind",       "description": "Nevermind edición original 1991 en perfecto estado.",                       "price": 50.00,  "stock": 4,  "discount": 0.0,  "item_slug": "discos-de-vinilo",  "image_url": "https://universalmusiconline.es/cdn/shop/files/nirvana.jpg?v=1685519501"},
    {"name": "Vinilo Michael Jackson Thriller","description": "Thriller edición original 1982, incluye encarte.",                          "price": 70.00,  "stock": 2,  "discount": 0.0,  "item_slug": "discos-de-vinilo",  "image_url": "https://undergroundrecordshop.es/wp-content/uploads/2024/12/Michael-Jackson-e1734520718418.png"},

    # ── MÚSICA - CASETES ──────────────────────────────────────────────────────
    {"name": "Casete Depeche Mode",            "description": "Casete Violator de Depeche Mode en buen estado.",                           "price": 12.00,  "stock": 10, "discount": 20.0, "item_slug": "casetes",           "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHVBpFFP68FQd9Gh1OWGXo4awKfdLAho6Qvg&s"},
    {"name": "Casete Metallica Black Album",   "description": "Metallica The Black Album casete original 1991.",                           "price": 10.00,  "stock": 6,  "discount": 0.0,  "item_slug": "casetes",           "image_url": "https://i.ebayimg.com/images/g/zK8AAOSwnh1i5Ykf/s-l1200.jpg"},
    {"name": "Casete Madonna Like a Virgin",   "description": "Madonna Like a Virgin casete original 1984.",                               "price": 8.00,   "stock": 8,  "discount": 0.0,  "item_slug": "casetes",           "image_url": "https://i.etsystatic.com/20964828/r/il/203b03/7004577808/il_570xN.7004577808_o5pm.jpg"},

    # ── REPRODUCTORES AUDIO ───────────────────────────────────────────────────
    {"name": "Walkman Sony WM-F10",            "description": "Walkman Sony con radio FM en buen estado de funcionamiento.",               "price": 40.00,  "stock": 5,  "discount": 0.0,  "item_slug": "walkman",           "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_UePqDF2twZgFm7ZVbr8sHs39o4Jjx22Ag&s"},
    {"name": "Discman Sony D-EJ955",           "description": "Discman Sony con G-Protection anti-vibración, incluye auriculares.",        "price": 45.00,  "stock": 4,  "discount": 5.0,  "item_slug": "discman",           "image_url": "https://static-data2.manualslib.com/product-images/299/214754/sony-cd-walkman-d-ej1000-cd-player.jpg"},
    {"name": "Tocadiscos Technics SL-1200",    "description": "Mítico tocadiscos Technics SL-1200 en estado de coleccionista.",            "price": 350.00, "stock": 1,  "discount": 0.0,  "item_slug": "tocadiscos",        "image_url": "https://i.blogs.es/2c45fe/direct_drive_turntable_system_sl_1200gae_3/1366_2000.jpg"},
    {"name": "Radiocassette JVC PC-W330",      "description": "Radiocassette JVC doble pletina con ecualizador.",                          "price": 65.00,  "stock": 2,  "discount": 0.0,  "item_slug": "radiocassettes",    "image_url": "https://hifivintage.eu/38222-large_default/jvc-pc-w330-l.jpg"},

    # ── TECNOLOGÍA - FOTOGRAFÍA ───────────────────────────────────────────────
    {"name": "Cámara Analógica Olympus OM1",   "description": "Cámara réflex analógica Olympus OM-1 con objetivo 50mm.",                  "price": 150.00, "stock": 2,  "discount": 0.0,  "item_slug": "camaras-analogicas","image_url": "https://cameramarket.es/cdn/shop/files/OlympusOM-1-Camera_0.png?v=1701331384&width=1214"},
    {"name": "Cámara Pentax K1000",            "description": "Pentax K1000 totalmente mecánica, no necesita batería.",                    "price": 120.00, "stock": 3,  "discount": 0.0,  "item_slug": "camaras-analogicas","image_url": "https://cdn.assets.lomography.com/ea/26f4004e1867352fe39b5b45504d2e7623031a/1216x794x2.jpg?auth=dd9b8814ecf0ac88c59e163d038f3d3a3c837540"},
    {"name": "Cámara Polaroid 600",            "description": "Polaroid 600 clásica en buen estado, lista para usar.",                     "price": 60.00,  "stock": 5,  "discount": 0.0,  "item_slug": "polaroid",          "image_url":"https://tiendainstant.com/1306-thickbox_default/polaroid-600.jpg"},
    {"name": "Canon AE-1 Program",             "description": "Canon AE-1 Program con objetivo 50mm f/1.8, estado excelente.",             "price": 180.00, "stock": 2,  "discount": 0.0,  "item_slug": "camaras-analogicas","image_url":"https://cameramarket.es/cdn/shop/files/CapturadePantalla2023-10-05alas20.05.01.png?v=1696622103&width=1920"},

    # ── TECNOLOGÍA - TELEFONÍA ────────────────────────────────────────────────
    {"name": "Nokia 3310 Azul",                "description": "Nokia 3310 clásico en azul, batería nueva, funciona perfectamente.",        "price": 35.00,  "stock": 6,  "discount": 0.0,  "item_slug": "moviles-antiguos",  "image_url": "https://vintagemobile.fr/cdn/shop/files/Nokia-3310-Vintage-Mobile-777.jpg?v=1684801535"},
    {"name": "Motorola Razr V3 Plata",         "description": "Motorola RAZR V3 plateado, icónico móvil plegable.",                        "price": 50.00,  "stock": 4,  "discount": 0.0,  "item_slug": "moviles-antiguos",  "image_url": "https://m.media-amazon.com/images/I/81EAOq92VaL.jpg"},
    {"name": "Sony Ericsson T610",             "description": "Sony Ericsson T610 con cámara integrada, buen estado.",                     "price": 30.00,  "stock": 5,  "discount": 0.0,  "item_slug": "moviles-antiguos",  "image_url": "https://i.ebayimg.com/images/g/~LoAAOSwrNhmHVaL/s-l400.jpg"},

    # ── COLECCIONISMO - FIGURAS ───────────────────────────────────────────────
    {"name": "Figura Action He-Man",           "description": "Action figure He-Man original años 80 con espada.",                         "price": 28.00,  "stock": 3,  "discount": 15.0, "item_slug": "action-figures-80s-90s","image_url": "https://tajmahalcomics.com/wp-content/uploads/2024/01/x_matthyd17.jpg"},
    {"name": "Figura Tortugas Ninja Leonardo", "description": "Figura original Leonardo TMNT años 90, completa con armas.",                "price": 35.00,  "stock": 4,  "discount": 0.0,  "item_slug": "action-figures-80s-90s","image_url": "https://m.media-amazon.com/images/I/61FLOrTtrIL._AC_UF894,1000_QL80_.jpg"},
    {"name": "Figura Transformers Optimus",    "description": "Optimus Prime G1 original años 80, completo y funcional.",                  "price": 80.00,  "stock": 2,  "discount": 0.0,  "item_slug": "action-figures-80s-90s","image_url": "https://www.toysrus.es/medias/?context=bWFzdGVyfHByb2R1Y3RfaW1hZ2VzfDMwNTIxfGltYWdlL2pwZWd8YUdNNEwyaGhOaTh4TlRZMU1UazFOVGcyTnpZM09BfGE5ODdmMGU3ODEwNTMzODEyNDBhYTBjYmY0YTdlNTNiZjY5NTBjY2ZjN2EzMDE0YjljOTIyNWI3ZTgxZWU1OTE"},
    {"name": "Figura Mazinger Z",              "description": "Figura Mazinger Z de coleccionista, edición japonesa.",                     "price": 95.00,  "stock": 2,  "discount": 0.0,  "item_slug": "figuras-anime",     "image_url": "https://m.media-amazon.com/images/I/71i2t-c7JWL._AC_UF894,1000_QL80_.jpg"},

    # ── COLECCIONISMO - CARTAS ────────────────────────────────────────────────
    {"name": "Carta Pikachu Base Set",        "description": "Lote de 20 cartas de la Base Set original de Pokémon.",                     "price": 60.00,  "stock": 4,  "discount": 0.0,  "item_slug": "pokemon",           "image_url": "https://m.media-amazon.com/images/I/51MxHNZf0GL._AC_UF894,1000_QL80_.jpg"},
    {"name": "Carta Charizard Holo 1999",      "description": "Charizard Holográfico Base Set 1999, estado Near Mint.",                    "price": 250.00, "stock": 1,  "discount": 0.0,  "item_slug": "pokemon",           "image_url": "https://m.media-amazon.com/images/I/81y6KqdilQL._AC_UF894,1000_QL80_.jpg"},
    {"name": "Carta Magic Black Lotus",       "description": "Carta Black Lotus Magic: The Gathering edición Alpha, auténtica.",          "price": 500.00, "stock": 1,  "discount": 0.0,  "item_slug": "magic",             "image_url": "https://i.ebayimg.com/00/s/MTYwMFgxMTU2/z/2pgAAOSwoaNePCCr/$_57.JPG?set_id=8800005007"},
    {"name": "Cartas Yu-Gi-Oh Red-Eyes B. Dragon",            "description": "Lote 15 cartas Legend of Blue Eyes White Dragon, 1ª edición.",              "price": 45.00,  "stock": 3,  "discount": 0.0,  "item_slug": "yugioh",            "image_url": "https://images.saymedia-content.com/.image/t_share/MTc0NDYwODA5NDc1OTI1MzUy/top-10-cards-you-need-for-your-red-eyes-black-dragon-yu-gi-oh-deck.jpg"},

    # ── COLECCIONISMO - OTROS ─────────────────────────────────────────────────
    {"name": "Póster Star Wars Original 1977", "description": "Póster original de Star Wars Una Nueva Esperanza, 1977.",                   "price": 120.00, "stock": 1,  "discount": 0.0,  "item_slug": "posters-originales","image_url": "https://i.ebayimg.com/images/g/7o0AAOSweE9j9C4U/s-l1200.jpg"},
    {"name": "Mapa de España",                  "description": "Perfecto para coleccionistas, llegó en perfecto estado.",                   "price": 4.99,   "stock": 10, "discount": 0.0,  "item_slug": "postales",          "image_url": "https://i.blogs.es/bd03d8/nova-et-accurata-tabula-hispaniae-1652/650_1200.jpg"},

    # ── MODA ──────────────────────────────────────────────────────────────────
    {"name": "Camiseta Nirvana Nevermind 90s", "description": "Camiseta vintage Nirvana Nevermind, talla L, algodón 100%.",                "price": 22.00,  "stock": 8,  "discount": 0.0,  "item_slug": "camisetas-80s-90s", "image_url": "https://media.camden.es/product/camiseta-nirvana-unisex-nevermind-album-800x800.jpg?width=1200"},
    {"name": "Sudadera Champion Vintage",      "description": "Sudadera Champion con logo bordado años 90, talla M.",                     "price": 38.00,  "stock": 5,  "discount": 0.0,  "item_slug": "sudaderas",         "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSep2jVyni3fNTPvcuEB5a72p7TfWok-Xf__Q&s"},
    {"name": "Vaqueros Levi's 501 Vintage",    "description": "Levi's 501 originales años 80, talla 32x32, desgaste natural.",             "price": 65.00,  "stock": 3,  "discount": 0.0,  "item_slug": "levis",             "image_url": "https://lsco.scene7.com/is/image/lsco/501540107-alt2-pdp-lse?fmt=jpeg&qlt=70&resMode=sharp2&fit=crop,1&op_usm=0.6,0.6,8&wid=2000&hei=2500"},
    {"name": "Zapatillas Nike Air Max 90",     "description": "Nike Air Max 90 retro en colorway OG, talla 42.",                          "price": 120.00, "stock": 2,  "discount": 0.0,  "item_slug": "zapatillas",        "image_url": "https://www.dooerssneakers.com/images/nike-zapatillas-hombre-air-max-90-drift-lateral-exterior-1001014908-1200x1200-d"},
    {"name": "Reloj Casio F-91W",              "description": "El reloj digital más icónico de Casio, nuevo en caja.",                    "price": 18.00,  "stock": 15, "discount": 0.0,  "item_slug": "relojes",           "image_url": "https://www.joyeriasanchez.com/177814-large_default/reloj-casio-digital-f-91w-1yeg.jpg"},
    {"name": "Gafas Ray-Ban Wayfarer Vintage", "description": "Ray-Ban Wayfarer originales años 80, montura negra.",                      "price": 85.00,  "stock": 4,  "discount": 0.0,  "item_slug": "gafas",             "image_url": "https://www.opticauniversitaria.es/dw/image/v2/BJDL_PRD/on/demandware.static/-/Sites-optica-master-catalog/default/dw4a6a13e1/images/hi-res/2025/RAYBAN25/RB-2140/159953/0RB2140__901__P21__shad__qt.png?sw=860&q=100"},

    # ── OFERTAS ───────────────────────────────────────────────────────────────
    {"name": "Pack Consola + 5 Juegos NES",    "description": "NES en buen estado con 5 juegos incluidos: Mario, Contra, Tetris y más.",   "price": 130.00, "stock": 2,  "discount": 20.0, "item_slug": "packs",             "image_url": "https://cloud10.todocoleccion.online/videojuegos-consola-nes/tc/2013/11/24/04/40154757.jpg"},
    {"name": "Game Boy + 3 Juegos Reacond.",   "description": "Game Boy reacondicionada con pantalla nueva y 3 juegos incluidos.",         "price": 70.00,  "stock": 3,  "discount": 15.0, "item_slug": "reacondicionados",  "image_url": "https://images.cults3d.com/7sHQTRGfI12-4GrEgIUwSK6SCCI=/516x516/filters:no_upscale()/https://fbi.cults3d.com/uploaders/14477641/illustration-file/f268fa67-00a6-4265-9024-7c9f410da209/IMG_20221108_194017.jpg"},
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
        existing = Product.query.filter(cast(Product.name["es"], String) == f'"{p["name"]}"').first()
        if existing:
            print(f"  [UPDATE] Producto ya existe: {p['name']}")
            products.append(existing)
            continue

        item = Item.query.filter_by(slug=p["item_slug"]).first()
        if not item:
            print(f"  [SKIP] Item no encontrado para slug '{p['item_slug']}' — ejecuta seed_categories primero")
            continue

        product = Product(
            name={"es": p["name"], "en": p["name"]}, 
            description={"es": p["description"], "en": p["description"]} if p.get("description") else None,
            price=p["price"],
            stock=p["stock"],
            discount=p["discount"],
            item_id=item.id,
            image_url=p["image_url"],
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