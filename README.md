<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="64">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="64">
</p>

<p align="center">Marketplace de segunda mano para videojuegos, consolas y accesorios retro.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.13-blue?logo=python" />
  <img src="https://img.shields.io/badge/Flask-backend-lightgrey?logo=flask" />
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" />
  <img src="https://img.shields.io/badge/PostgreSQL-database-336791?logo=postgresql" />
  <img src="https://img.shields.io/badge/Stripe-payments-635bff?logo=stripe" />
</p>

---

## ✨ Funcionalidades

**Clientes**
- Explorar catálogo por categorías y subcategorías
- Búsqueda y filtrado por precio y categoría
- Carrito persistente y gestión de pedidos
- Seguimiento del estado de envíos
- Favoritos y reseñas de productos comprados
- Panel personal con historial y perfil

**Vendedores**
- Publicación y gestión de productos con imágenes
- Control de stock y precios
- Panel de ventas con estadísticas
- Gestión de pedidos y alertas de stock bajo

**Administradores**
- Aprobación y moderación de productos
- Gestión global de usuarios, pedidos y productos
- Panel de administración con sistema de roles

**General**
- Registro y login con email/contraseña y Google OAuth 2.0
- Pagos seguros con Stripe Connect (comisión de plataforma configurable)
- Notificaciones por email vía Brevo SMTP
- Sistema de tickets de atención al cliente
- Internacionalización ES / EN
- Modo claro y oscuro
- Diseño responsive

> El proyecto está en desarrollo activo. Este README se actualiza conforme se añaden funcionalidades.

---

## 🚀 Instalación

Consulta la guía completa:

👉 [README de instalación y arranque](./docs/README_SETUP.md)

---

## 🛠️ Stack tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | UI |
| React Router DOM | 6 | Navegación |
| Tailwind CSS | 3 | Estilos |
| Vite | 4 | Bundler |
| i18next | – | Internacionalización |
| Lucide React | – | Iconos |
| Stripe.js + React Stripe.js | – | Pagos en cliente |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Python | 3.13 | Runtime |
| Flask | – | Framework web |
| Flask-SQLAlchemy | – | ORM |
| Flask-Migrate | – | Migraciones |
| Flask-JWT-Extended | 4.6 | Autenticación JWT |
| Flask-Mail | – | Envío de emails |
| Flask-CORS | – | Control de acceso |
| Flask-Admin | 2.0 | Panel de administración |
| bcrypt | – | Hash de contraseñas |
| deep-translator | – | Traducciones automáticas |
| Stripe Python SDK | – | Pagos y transferencias |
| Gunicorn | – | Servidor WSGI |

### Base de datos
| Tecnología | Uso |
|---|---|
| PostgreSQL | Base de datos principal |
| SQLAlchemy | ORM y queries |
| psycopg2-binary | Driver PostgreSQL |

### Servicios externos
| Servicio | Uso |
|---|---|
| Cloudinary | Almacenamiento y gestión de imágenes |
| Stripe Connect | Pagos, transferencias y comisiones |
| Brevo (SMTP) | Envío de emails transaccionales |
| Google OAuth 2.0 | Login social |

---

## 📚 Documentación

| Doc | Descripción |
|---|---|
| [🚀 Instalación y arranque](./docs/README_SETUP.md) | Guía paso a paso para instalar, configurar y arrancar el proyecto |
| [🌱 Seed de categorías](./docs/README_SEED_CATEGORIES.md) | Cómo poblar la BD con categorías, subcategorías e ítems |
| [🧪 Seed de datos de prueba](./docs/README_SEED_DATA.md) | Cómo poblar la BD con usuarios, productos y pedidos de prueba |
| [🌗 Sistema de temas](./docs/README_DARK_MODE.md) | Sistema de colores semánticos para modo claro/oscuro |
| [📸 Cloudinary](./docs/README_CLOUDINARY.md) | Configuración de Cloudinary para subida de imágenes |
| [💳 Stripe](./docs/README_STRIPE.md) | Sistema de pagos con Stripe Connect y webhooks |
| [📧 Email (Brevo)](./docs/README_EMAIL.md) | Configuración del sistema de email con Brevo SMTP |

---

## 🌍 Despliegue

El proyecto es compatible con despliegue en plataformas como **Render.com**.

> ⚠️ Asegúrate de configurar todas las variables de entorno en el entorno de producción antes de desplegar. Consulta [README_SETUP.md](./docs/README_SETUP.md) para ver la lista completa.