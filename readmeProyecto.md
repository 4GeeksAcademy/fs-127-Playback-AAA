# 📸 Cloudinary — Configuración e Integración

## 1. Instalación
```bash
pip install cloudinary
```

---

## 2. Variables de entorno

Añade las siguientes variables a tu archivo `.env`:
```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

> 💡 Puedes encontrar estos valores en el dashboard de tu cuenta de Cloudinary.

---

## 3. Configuración en `app.py`
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

## 4. Uso en `routes.py`

> 🚧 Pendiente de documentar.

---

&nbsp;

# 🌱 Seed — Poblar la base de datos

Para cargar automáticamente las categorías, subcategorías e ítems en la base de datos, ejecuta desde la raíz del proyecto:
```bash
pipenv run python src/api/seeds/seed_categories.py
```

### ¿Qué hace este comando?

- Crea las categorías principales
- Crea sus subcategorías asociadas
- Inserta los ítems correspondientes
- Evita duplicados si ya existen en la base de datos
- Muestra por consola qué registros se crean o se omiten

### 📌 Requisitos previos

Antes de ejecutarlo asegúrate de:

- Tener `pipenv` instalado
- Tener la base de datos creada
- Haber ejecutado las migraciones


