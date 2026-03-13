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

### 🛠️ Solución a problemas con migraciones

Si al ejecutar `pipenv run upgrade` obtienes errores como **"Multiple head revisions"** o **"constraint does not exist"**, puedes resetear las migraciones desde cero sin perder tus modelos:
```bash
# 1. Elimina todas las migraciones existentes
rm migrations/versions/*.py

# 2. Genera una migración limpia desde tus modelos actuales
pipenv run migrate

# 3. Aplica la migración
pipenv run upgrade
```

