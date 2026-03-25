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
pipenv run upgrade
pipenv run seed_categories   # obligatorio antes que seed_data
pipenv run seed_data         # opcional, datos de prueba
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
| [pyenv-win](https://github.com/pyenv-win/pyenv-win) | `winget install pyenv-win` |
| Python 3.13 | `pyenv install 3.13.0` → `pyenv global 3.13.0` |
| pipenv | `pip install pipenv` |
| Node.js 20+ | [nodejs.org](https://nodejs.org) |
| PostgreSQL | [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) |

---

### 1. Configurar Python con pyenv-win
```powershell
pyenv install 3.13.0
pyenv global 3.13.0
python --version   # debe mostrar 3.13.x
```

---

### 2. Instalar dependencias
```powershell
pipenv install
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

La `DATABASE_URL` para local es la misma que en Codespaces:
```env
DATABASE_URL=postgres://gitpod:postgres@localhost:5432/example
```

---

### 5. Migraciones y seeds
```powershell
pipenv run upgrade
pipenv run seed_categories
pipenv run seed_data
```

---

### 6. Arrancar el proyecto
```powershell
# Terminal 1 — backend
pipenv run start

# Terminal 2 — frontend
npm run start
```

Frontend: `http://localhost:3000` · Backend: `http://localhost:3001`

---

## 🔧 Variables de entorno

Referencia completa del archivo `.env`. Copia `.env.example` como base y completa los valores.

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
→ [Guía de Cloudinary](./README_CLOUDINARY.md)

### Email (Brevo)
```env
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxx
MAIL_DEFAULT_SENDER=tu_email@dominio.com
FRONTEND_URL=http://localhost:3000/
```
→ [Guía de Email](./README_EMAIL.md)

> Las variables `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USE_TLS`, `MAIL_USERNAME` y `MAIL_PASSWORD` están en `.env.example` por compatibilidad histórica pero **no son necesarias** — el envío usa la API HTTP de Brevo, no SMTP.

### Stripe
```env
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
PLATFORM_COMMISSION_RATE=0.05
PLATFORM_MINIMUM_COMMISSION=1.00
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX
```
→ [Guía de Stripe](./README_STRIPE.md)

### IA (Groq)
```env
VITE_GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXX
```
→ [Guía de Groq](./README_AI.md)

### Frontend
```env
VITE_BASENAME=/
VITE_BACKEND_URL=""
```

> `VITE_BACKEND_URL` se deja vacío en desarrollo local. En Codespaces y Render debe apuntar a la URL pública del backend **sin barra final**.

---

## 🗄️ Comandos útiles

Todos los comandos se ejecutan con `pipenv run <alias>` desde la raíz del proyecto.

### Servidor
```bash
pipenv run start            # Arranca el backend en :3001
```

### Migraciones
```bash
pipenv run init             # Inicializar carpeta migrations (solo la primera vez)
pipenv run migrate          # Crear nueva migración tras cambios en modelos
pipenv run upgrade          # Aplicar migraciones pendientes
pipenv run downgrade        # Revertir la última migración
```

### Seeds
```bash
pipenv run seed_categories  # Poblar categorías (siempre primero)
pipenv run seed_data        # Poblar datos de prueba
```

### Reset completo de la BD
```bash
pipenv run reset_db         # Elimina migrations, resetea schema y aplica upgrade
```

> ⚠️ `reset_db` borra todas las migraciones. Solo para desarrollo cuando el estado es inconsistente.

---

## 🛠️ Solución de problemas

### Migraciones en estado inconsistente

Si `reset_db` no es suficiente, puedes hacerlo manualmente:

```bash
rm -rf migrations

psql -h localhost -U gitpod -d example
# contraseña: postgres
```
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q
```
```bash
pipenv run init
pipenv run migrate
pipenv run upgrade
pipenv run seed_categories
pipenv run seed_data
```

---

### El frontend no conecta con el backend

- Verifica que `VITE_BACKEND_URL` apunte a la URL correcta del backend (sin barra final)
- Confirma que el backend está corriendo (`pipenv run start`)
- En Codespaces, verifica que el puerto `3001` sea público
- Reinicia el frontend tras cualquier cambio en variables `VITE_*`

---

### Los pagos no funcionan o los pedidos no se actualizan

El webhook de Stripe no está configurado o tiene la URL incorrecta. Consulta la [guía de Stripe](./README_STRIPE.md).

---

## ⚠️ Notas de seguridad

- **Nunca subas `.env` al repositorio**
- Usa `.env.example` para compartir la estructura (sin valores reales)
- Reinicia siempre el frontend tras modificar variables `VITE_*`

---

## <a href="../README.md"><img src="https://img.shields.io/badge/←_Volver_al_README_principal-8b5cf6?style=for-the-badge" /></a>