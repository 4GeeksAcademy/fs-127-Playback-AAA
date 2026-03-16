<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="52">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="52">
</p>

# 📸 Cloudinary — Imágenes

Playback usa **Cloudinary** para almacenar y servir todas las imágenes de la plataforma.

---

## Qué se almacena en Cloudinary

| Tipo | Descripción |
|---|---|
| Imágenes de productos | Subidas por vendedores al publicar o editar un producto |
| Avatares de usuarios | Generados automáticamente en el registro desde ui-avatars.com y almacenados en Cloudinary |
| Imágenes de categorías y subcategorías | Assets estáticos del catálogo (gestionados desde el seed) |

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
| `avatars/` | Avatares de usuarios |
| `categories/` | Imágenes de categorías (assets estáticos) |

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