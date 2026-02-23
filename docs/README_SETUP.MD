# 🚀 Guía de instalación y arranque

## 📋 Requisitos previos
- Python 3.13+
- Node.js y npm
- pipenv (`pip install pipenv`)
- PostgreSQL

---

## ⚙️ Instalación

**1. Instala las dependencias de Python:**
```bash
pipenv install
```

**2. Instala las dependencias de Node:**
```bash
npm install
```

---

## 🔧 Configuración del entorno

**3. Copia el archivo de variables de entorno:**
```bash
cp .env.example .env
```

**4. Configura la URL del backend en el `.env`:**

Abre el archivo `.env`, localiza la línea 14 y descoméntala pegando la URL pública de tu backend:
```dotenv
VITE_BACKEND_URL="https://tu-url-del-backend"
```

> ⚠️ Asegúrate de exponer como **públicos** los puertos del frontend y del backend en tu entorno de desarrollo (por ejemplo en Codespaces, haz clic derecho sobre el puerto → "Make Public").

---

## 🗄️ Base de datos y migraciones

**5. Genera las migraciones** *(omite este paso si no has hecho cambios en los modelos en `../src/api/models/`)*:
```bash
pipenv run migrate
```

**6. Ejecuta las migraciones:**
```bash
pipenv run upgrade
```

**7. Pobla la base de datos con datos iniciales:**
```bash
pipenv run python src/api/seeds/seed_categories.py
```
> 📖 Consulta la [documentación completa del seed](../docs/README_SEED_CATEGORIES.md) para más detalles sobre qué datos se insertan y cómo evitar duplicados.

**7. Opcional: Poblar la base de datos con datos de prueba para desarrollo
```bash
pipenv run python src/api/seeds/seed_test_data.py
```
> 📖 Consulta la [documentación completa del seed](../docs/README_SEED_TEST_DATA.md) para más detalles sobre qué datos se insertan y cómo evitar duplicados.

---

## ▶️ Arrancar el proyecto

**8. Arranca el backend:**
```bash
pipenv run start
```

**9. Arranca el frontend:**
```bash
npm run start
```

---

## 📚 Documentación adicional

| Doc | Descripción |
|---|---|
| [🌱 Seed de categorías](../docs/README_SEED_CATEGORIES.md) | Cómo poblar la base de datos con categorías, subcategorías e ítems iniciales. Incluye solución a errores comunes de migración. |
| [🌗 Sistema de temas (Dark Mode)](../docs/README_DARK_MODE.md) | Sistema de colores semánticos para modo claro/oscuro. Explica cómo usar las clases `theme-*` en lugar de duplicar clases `dark:` en cada componente. |
| [📸 Cloudinary](../docs/README_CLOUDINARY.md) | Configuración de Cloudinary para subida de imágenes. Variables de entorno necesarias e integración con Flask. |

---

## 🛠️ Solución de problemas

### Errores con las migraciones
Si obtienes errores como **"Multiple head revisions"** o **"constraint does not exist"**, resetea las migraciones desde cero:
```bash
# 1. Elimina todas las migraciones existentes
rm migrations/versions/*.py

# 2. Genera una migración limpia desde tus modelos actuales
pipenv run migrate

# 3. Aplica la migración
pipenv run upgrade
```

> ⚠️ Esto borra el historial de migraciones pero **no afecta a tus modelos**. Si la base de datos tiene datos, se perderán. Úsalo solo en desarrollo.

### El frontend no conecta con el backend
- Verifica que ambos puertos están en **público** en Codespaces.
- Comprueba que `VITE_BACKEND_URL` en el `.env` tiene la URL correcta y está descomentada.
- Reinicia el frontend tras cualquier cambio en el `.env`.