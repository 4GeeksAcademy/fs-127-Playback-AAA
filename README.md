# 🎮 Playback

Playback es un **marketplace de productos retro** donde los usuarios pueden comprar y vender videojuegos, consolas y accesorios clásicos. La plataforma cuenta con tres roles: **cliente**, **vendedor** y **administrador**, cada uno con su propio panel de control y funcionalidades específicas.

---

## ✨ Funcionalidades principales

**Para clientes**
- Explorar el catálogo organizado por categorías y subcategorías
- Búsqueda y filtrado de productos por precio y categoría
- Carrito de compra persistente y gestión de pedidos
- Seguimiento del estado de envíos
- Lista de favoritos y reseñas de productos comprados
- Panel personal con historial de pedidos y perfil

**Para vendedores**
- Publicación y gestión de productos con imágenes
- Control de stock y precios
- Panel de ventas con estadísticas y productos más vendidos
- Gestión de pedidos propios y alertas de stock bajo

**Para administradores**
- Aprobación y moderación de productos
- Gestión global de usuarios, pedidos y productos

**General**
- Registro y login con email/contraseña y Google (OAuth 2.0)
- Sistema de atención al cliente mediante tickets
- Modo claro y oscuro
- Diseño responsive
- Notificaciones por email
- Internacionalización (ES / EN)

> El proyecto se encuentra en desarrollo activo. Este README se irá actualizando conforme se añadan nuevas funcionalidades.

---

## 🚀 Instalación y puesta en marcha

Consulta la guía completa en:

👉 [README de instalación y arranque](./docs/README_SETUP.md)

---

## 🛠️ Tecnologías utilizadas

**Frontend**
- React 18
- React Router DOM 6
- Tailwind CSS 3
- Vite 4
- Lucide React (iconos)

**Backend**
- Python 3.13
- Flask
- Flask-SQLAlchemy
- Flask-Migrate (via `pipenv run migrate` / `pipenv run upgrade`)
- Flask-JWT-Extended
- Flask-CORS
- Flask-Admin
- Flask-Swagger
- bcrypt
- Gunicorn

**Base de datos**
- PostgreSQL (psycopg2-binary)
- SQLAlchemy

**Servicios externos**
- Cloudinary (gestión de imágenes)

---

## 📚 Documentación

| Doc | Descripción |
|---|---|
| [🚀 Instalación y arranque](./docs/README_SETUP.md) | Guía paso a paso para instalar, configurar y arrancar el proyecto. |
| [🌱 Seed de categorías](./docs/README_SEED_CATEGORIES.md) | Cómo poblar la base de datos con categorías, subcategorías e ítems iniciales. |
| [🌗 Sistema de temas (Dark Mode)](./docs/README_DARK_MODE.md) | Sistema de colores semánticos para modo claro/oscuro con clases `theme-*`. |
| [📸 Cloudinary](./docs/README_CLOUDINARY.md) | Configuración de Cloudinary para la subida de imágenes. |

---

## 🌍 Despliegue

Compatible con despliegue en **Render.com**. Consulta la [documentación oficial](https://4geeks.com/es/docs/start/despliega-con-render-com) para más detalles.