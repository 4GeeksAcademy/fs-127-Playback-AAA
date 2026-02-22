# 📸 Cloudinary — Configuración e Integración

## 1. Variables de entorno

Añade las siguientes variables a tu archivo `.env`:
```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

> 💡 Puedes encontrar estos valores en el dashboard de tu cuenta de Cloudinary. La librería se instala automáticamente al ejecutar `pipenv install`.

---

## 2. Configuración en `app.py`
```python
import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)
```

---

## 3. Uso en `routes.py`

> 🚧 Pendiente de documentar.