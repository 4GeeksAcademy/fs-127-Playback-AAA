# 🌱 Seed — Categorías, Subcategorías e Ítems

Puebla la base de datos con la jerarquía completa del catálogo.

> ⚠️ Ejecutar **siempre antes** que `seed_data` — los productos dependen de los ítems creados aquí.

---

## Ejecución

```bash
pipenv run seed_categories
```

---

## ¿Qué crea?

Tres niveles jerárquicos:

```
Categoría        (ej. Consolas)
 └ Subcategoría  (ej. Nintendo Clásica)
      └ Ítem     (ej. NES, SNES, Nintendo 64...)
```

Cada nivel tiene: `name` (multidioma), `slug`, `description`, `image_url` y `position`.

Las URLs de imagen se generan automáticamente a partir del slug:
```
https://res.cloudinary.com/playback-assets/image/upload/{slug}.png
```

---

## Estructura de los datos

```python
{
  "name": { "es": "Consolas", "en": "Consoles", "ca": "Consoles", "gl": "Consolas" },
  "slug": "consolas",
  "subcategories": [
    {
      "name": { "es": "Nintendo Clásica", "en": "Classic Nintendo", ... },
      "slug": "nintendo-clasica",
      "items": [
        { "name": { "es": "NES", ... }, "slug": "nes" },
        { "name": { "es": "SNES", ... }, "slug": "snes" }
      ]
    }
  ]
}
```

Idiomas soportados: `es` · `en` · `ca` · `gl`

---

## Idempotencia

El script es **seguro para ejecutar varias veces** — busca cada registro por `slug` antes de crearlo. Si ya existe lo actualiza; si no, lo crea.

---

## Cuándo ejecutarlo

- Al crear la base de datos por primera vez
- Tras un reset de migraciones (`pipenv run reset_db`)
- Al añadir nuevas categorías al sistema

---

## <a href="../README.md"><img src="https://img.shields.io/badge/←_Volver_al_README_principal-8b5cf6?style=for-the-badge" /></a>