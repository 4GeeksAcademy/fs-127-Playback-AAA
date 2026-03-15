<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="52">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="52">
</p>

# 🚀 Guía de instalación y arranque

Esta guía cubre dos entornos de desarrollo:

- [☁️ GitHub Codespaces](#️-github-codespaces) — entorno estándar del equipo
- [🪟 Local Windows + VS Code](#-local-windows--vs-code) — configuración alternativa

---

## ☁️ GitHub Codespaces

### Requisitos previos

No necesitas instalar nada. Codespaces ya incluye Python, Node.js y PostgreSQL.

---

### 1. Instalar dependencias
```bash
# Backend
pipenv install

# Frontend
npm install
```

---

### 2. Configurar el entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales. Consulta la sección [Variables de entorno](#-variables-de-entorno) más abajo.

En Codespaces, la `DATABASE_URL` por defecto es:
```env
DATABASE_URL=postgres://gitpod:postgres@localhost:5432/example
```

---

### 3. Migraciones y seeds
```bash
# Aplicar migraciones
pipenv run upgrade

# Poblar categorías (obligatorio antes que el resto)
pipenv run python src/api/seeds/seed_categories.py

# Poblar datos de prueba (opcional)
pipenv run python src/api/seeds/seed_data.py
```

---

### 4. Arrancar el proyecto
```bash
# Terminal 1 — backend (puerto 3001)
pipenv run start

# Terminal 2 — frontend (puerto 3000)
npm run start
```

---

### 5. Abrir los puertos

En Codespaces los puertos deben ser públicos para que el frontend se comunique con el backend:

1. Abre la pestaña **Ports**
2. Localiza los puertos `3000` y `3001`
3. Clic derecho → **Make Public**

---

## 🪟 Local Windows + VS Code

### Requisitos previos

| Herramienta | Cómo instalar |
|---|---|
| [pyenv-win](https://github.com/pyenv-win/pyenv-win) | `winget install pyenv-win` o sigue la guía oficial |
| Python 3.13 | `pyenv install 3.13.0` → `pyenv global 3.13.0` |
| pipenv | `pip install pipenv` |
| Node.js 20+ | [nodejs.org](https://nodejs.org) |
| PostgreSQL | [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) |

---

### 1. Configurar Python con pyenv-win
```powershell
# Instalar Python 3.13
pyenv install 3.13.0
pyenv global 3.13.0

# Verificar
python --version
```

---

### 2. Instalar dependencias
```powershell
# Backend
pipenv install

# Frontend
npm install
```

---

### 3. Crear la base de datos en PostgreSQL

Abre **psql** (o pgAdmin) y ejecuta:
```sql
CREATE USER gitpod WITH PASSWORD 'postgres';
CREATE DATABASE example OWNER gitpod;
GRANT ALL PRIVILEGES ON DATABASE example TO gitpod;
```

> Esto replica las credenciales del entorno Codespaces para mantener consistencia entre entornos.

---

### 4. Configurar el entorno
```powershell
copy .env.example .env
```

Edita `.env`. La `DATABASE_URL` para local es la misma:
```env
DATABASE_URL=postgres://gitpod:postgres@localhost:5432/example
```

---

### 5. Migraciones y seeds
```powershell
pipenv run upgrade
pipenv run python src/api/seeds/seed_categories.py
pipenv run python src/api/seeds/seed_data.py
```

---

### 6. Arrancar el proyecto
```powershell
# Terminal 1 — backend
pipenv run start

# Terminal 2 — frontend
npm run start
```

El frontend estará en `http://localhost:3000` y el backend en `http://localhost:3001`.

---

## 🔧 Variables de entorno

Referencia completa del archivo `.env`:

### General
```env
FLASK_APP=src/app.py
FLASK_APP_KEY="any key works"
FLASK_DEBUG=1
DEBUG=TRUE
```

### Base de datos
```env
DATABASE_URL=postgres://gitpod:postgres@localhost:5432/example
```

### Cloudinary
```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

→ [Guía de configuración de Cloudinary](./README_CLOUDINARY.md)

### Email (Brevo SMTP)
```env
MAIL_SERVER=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu_usuario_smtp
MAIL_DEFAULT_SENDER="tu_email_remitente"
MAIL_PASSWORD=tu_smtp_key
```

→ [Guía de configuración de Email](./README_EMAIL.md)

### Stripe
```env
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
PLATFORM_COMMISSION_RATE=0.05
PLATFORM_MINIMUM_COMMISSION=1.00
```

→ [Guía de configuración de Stripe](./README_STRIPE.md)

### Frontend
```env
VITE_BASENAME=/
VITE_BACKEND_URL=""
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX
```

> `VITE_BACKEND_URL` se deja vacío en desarrollo local. En Codespaces debe apuntar a la URL pública del backend.

---

## 🗄️ Comandos útiles

### Migraciones
```bash
pipenv run migrate      # Crear nueva migración
pipenv run upgrade      # Aplicar migraciones
```

### Seeds
```bash
pipenv run python src/api/seeds/seed_categories.py   # Categorías (ejecutar primero)
pipenv run python src/api/seeds/seed_data.py         # Datos iniciales
```

---

## 🛠️ Solución de problemas

### Problemas con migraciones

Si las migraciones están en un estado inconsistente:
```bash
# 1. Eliminar migraciones
rm -rf migrations

# 2. Entrar a PostgreSQL y resetear el schema
psql -h localhost -U gitpod -d example
# password: postgres
```
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q
```
```bash
# 3. Recrear migraciones desde cero
pipenv run flask db init
pipenv run flask db migrate -m "initial"
pipenv run flask db upgrade

# 4. Ejecutar seeds
pipenv run python src/api/seeds/seed_categories.py
pipenv run python src/api/seeds/seed_data.py
```

---

### El frontend no conecta con el backend

- Verifica que `VITE_BACKEND_URL` apunte a la URL correcta del backend
- Confirma que el backend está corriendo (`pipenv run start`)
- En Codespaces, verifica que el puerto `3001` sea público
- Reinicia el frontend tras cualquier cambio en variables `VITE_*`:
```bash
npm run start
```

---

### Los pagos no funcionan o los pedidos no se actualizan

El webhook de Stripe no está configurado o tiene la URL incorrecta. Consulta la [guía de Stripe](./README_STRIPE.md#-webhooks).

---

## ⚠️ Notas de seguridad

- **Nunca subas `.env` al repositorio**
- Usa `.env.example` para compartir la estructura (sin valores reales)
- Reinicia siempre el frontend tras modificar variables `VITE_*`