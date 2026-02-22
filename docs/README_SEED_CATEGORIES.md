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