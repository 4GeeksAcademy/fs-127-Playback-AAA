<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="52">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="52">
</p>

# 📸 Cloudinary — Imágenes de productos

Playback usa **Cloudinary** para almacenar y servir las imágenes de productos y los assets estáticos del catálogo.

---

## Qué se almacena en Cloudinary

| Tipo | Cuándo | Carpeta |
|---|---|---|
| Imágenes de productos | Al crear o editar un producto | `products/` |
| Imágenes adjuntas en incidencias | Al enviar un mensaje con imagen en un ticket | `incidencias/` |
| Foto de perfil de usuario | Al actualizar manualmente el avatar | `profile_images/` |
| Logo de tienda del vendedor | Al actualizar manualmente el logo | `seller_logos/` |
| Imágenes de categorías y subcategorías | Assets estáticos gestionados desde el seed | `categories/` |

> **Avatares e imágenes iniciales:** en el registro, tanto los avatares de usuarios como los logos de tiendas se generan automáticamente con **UI Avatars** (sin subida a Cloudinary). Solo se suben a Cloudinary si el usuario o vendedor los actualiza manualmente después. Ver sección [UI Avatars](#-ui-avatars--avatares-automáticos) más abajo.

---

## 1. Crear cuenta en Cloudinary

1. Regístrate en [cloudinary.com](https://cloudinary.com) (plan gratuito disponible)
2. En el **Dashboard**, copia:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## 2. Variables de entorno

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

La librería se instala automáticamente con `pipenv install`.

---

## 3. Configuración en `app.py`

```python
import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)
```

---

## 4. Subir una imagen desde el backend

```python
import cloudinary.uploader

def upload_image(file, folder="products"):
    result = cloudinary.uploader.upload(
        file,
        folder=folder,
        overwrite=True,
        resource_type="image"
    )
    return result.get("secure_url")
```

El método devuelve la URL HTTPS de la imagen ya alojada en Cloudinary, que se guarda directamente en la base de datos.

---

## 5. Estructura de carpetas en Cloudinary

| Carpeta | Contenido |
|---|---|
| `products/` | Imágenes de productos |
| `incidencias/` | Imágenes adjuntas en mensajes de tickets |
| `profile_images/` | Fotos de perfil actualizadas por usuarios |
| `seller_logos/` | Logos de tienda actualizados por vendedores |
| `categories/` | Assets estáticos del catálogo |

---

## 6. Límites del plan gratuito

| Recurso | Límite gratuito |
|---|---|
| Almacenamiento | 25 GB |
| Transformaciones | 25 créditos/mes |
| Ancho de banda | 25 GB/mes |

Suficiente para desarrollo y fases iniciales del proyecto.

---

## Resolución de problemas

**Error 401 al subir**
- Verifica que `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` son correctos
- Comprueba que `CLOUDINARY_CLOUD_NAME` coincide exactamente con el del dashboard

**Las imágenes no se muestran**
- Confirma que la URL guardada en BD empieza por `https://res.cloudinary.com/`
- Verifica que el recurso no fue eliminado manualmente desde el dashboard de Cloudinary

---

## 🧑‍💼 UI Avatars — Avatares automáticos

Los avatares de usuarios y logos de tiendas se generan automáticamente usando [UI Avatars](https://ui-avatars.com), un servicio gratuito que crea imágenes con iniciales a partir de un nombre.

**No requiere registro ni API key** — es una llamada HTTP directa.

### Cuándo se genera el avatar

| Evento | Qué se genera | Función |
|---|---|---|
| Registro de usuario | Avatar con iniciales del nombre y apellido | `generate_initial_avatar(name, last_name)` |
| Registro de tienda (vendedor) | Logo con el nombre de la tienda | `generate_initial_avatar(store_name)` |

La URL generada se guarda directamente en el campo `image_url` del usuario o `logo_url` de la tienda. No hay subida a Cloudinary.

### Formato de la URL

```
https://ui-avatars.com/api/?size=200&font-size=0.6&background=random&bold=true&name=Alex+Silvan
```

El parámetro `background=random` asigna un color de fondo diferente a cada usuario.

### Dónde está implementado

La lógica de generación está centralizada en `src/api/utils.py` → función `generate_initial_avatar()`, usada desde `auth_controller.py` y `seller_controller.py`.

---

## <a href="../README.md"><img src="https://img.shields.io/badge/←_Volver_al_README_principal-8b5cf6?style=for-the-badge" /></a>