# 🌱 Seed — Categorías, Subcategorías e Ítems

Este script permite **poblar automáticamente la base de datos** con todas las:

* Categorías
* Subcategorías
* Ítems

de la plataforma.

Los datos están definidos dentro del archivo mediante la constante `CATEGORIES_DATA`.

---

# Ejecutar el seed

Desde la **raíz del proyecto**, ejecuta:

```bash
pipenv run python src/api/seeds/seed_categories.py
```

---

# ¿Qué hace este script?

El seed realiza las siguientes acciones automáticamente:

### 1️⃣ Categorías

Para cada categoría en `CATEGORIES_DATA`:

* Comprueba si ya existe mediante su **slug**
* Si existe:

  * Actualiza su información
  * Mantiene el registro existente
* Si no existe:

  * Crea la categoría nueva

Campos gestionados:

* `name` (multidioma)
* `slug`
* `description`
* `image_url`
* `position`

La imagen se genera automáticamente con:

```
https://res.cloudinary.com/playback-assets/image/upload/{slug}.png
```

Ejemplo:

```
consolas → consoles.png
videojuegos → videojuegos.png
```

---

### 2️⃣ Subcategorías

Para cada subcategoría:

* Busca si ya existe por `slug`
* Si existe:

  * Actualiza nombre, descripción e imagen
* Si no existe:

  * La crea y la asocia a su categoría

Campos gestionados:

* `name`
* `slug`
* `description`
* `image_url`
* `category`
* `position`

---

### 3️⃣ Ítems

Los ítems representan **las divisiones finales dentro de cada subcategoría**.

Por ejemplo:

```
Categoría
 └ Subcategoría
     └ Item
```

Ejemplo real:

```
Consolas
 └ Nintendo Clásica
     ├ NES
     ├ SNES
     ├ Nintendo 64
     └ GameCube
```

Para cada ítem:

* Busca si existe por `slug`
* Si existe:

  * Actualiza nombre, posición e imagen
* Si no existe:

  * Lo crea y lo asocia a la subcategoría

Campos:

* `name`
* `slug`
* `image_url`
* `subcategory`
* `position`

---

# Sistema de orden

Cada nivel tiene un campo:

```
position
```

Se genera automáticamente con el índice del array:

```
cat_idx
sub_idx
item_idx
```

Esto permite ordenar correctamente en el frontend.

---

# Sistema de imágenes

Las imágenes se generan automáticamente usando el `slug`.

Ejemplo:

```
https://res.cloudinary.com/playback-assets/image/upload/{slug}.png
```

Ejemplos reales:

```
consolas.png
nes.png
dreamcast.png
vinilos.png
```

Esto permite que **no haya que definir manualmente cada URL**.

---

# Prevención de duplicados

El script **no crea duplicados**.

Para cada entidad se hace una búsqueda previa:

```python
Category.query.filter_by(slug=cat_data["slug"]).first()
```

Si existe:

```
[UPDATE]
```

Si no existe:

```
[OK]
```

Ejemplo de salida en consola:

```
[OK] Categoría creada: Consolas
        [OK] Subcategoría creada: Nintendo Clásica
                [OK] Item creado: NES
                [OK] Item creado: SNES

[UPDATE] Categoría ya existe: Videojuegos
        [UPDATE] Subcategoría ya existe: Cartucho
                [UPDATE] Item ya existe: NES
```

---

# Estructura de los datos

Los datos siguen esta jerarquía:

```
CATEGORIES_DATA
 └ categories
      └ subcategories
           └ items
```

Ejemplo simplificado:

```python
{
  "name": {"es": "Consolas"},
  "slug": "consolas",
  "subcategories": [
      {
          "name": {"es": "Nintendo Clásica"},
          "slug": "nintendo-clasica",
          "items": [
              {"name": {"es": "NES"}, "slug": "nes"},
              {"name": {"es": "SNES"}, "slug": "snes"}
          ]
      }
  ]
}
```

---

# Soporte multidioma

Los nombres y descripciones soportan múltiples idiomas:

```python
"name": {
  "es": "Consolas",
  "en": "Consoles",
  "ca": "Consoles",
  "gl": "Consolas"
}
```

Esto permite que el frontend muestre el texto según el idioma del usuario.

Idiomas actuales:

* 🇪🇸 Español
* 🇬🇧 Inglés
* 🇨🇦 Catalán
* 🇬🇱 Gallego

---

# Ejecución del script

El archivo puede ejecutarse directamente:

```python
if __name__ == "__main__":
```

Este bloque:

1. Añade la raíz del proyecto al `PYTHONPATH`
2. Importa la app Flask
3. Crea el `app_context`
4. Ejecuta el seed

```python
with app.app_context():
    seed_categories(db, Category, Subcategory, Item)
```

---

# Salida final

Si todo funciona correctamente:

```
🌱 Iniciando seed de categorías...

[OK] Categoría creada: Consolas
[OK] Categoría creada: Videojuegos
[OK] Categoría creada: Música
...

✅ Seed completado con éxito.
```

---

# Cuándo usar este seed

Este script se utiliza cuando:

* Se crea la base de datos por primera vez
* Se reinician migraciones
* Se añaden nuevas categorías al sistema
* Se sincroniza la base de datos entre entornos

---

# Requisitos previos

Antes de ejecutarlo asegúrate de:

* Tener `pipenv` instalado
* Tener la base de datos creada
* Haber ejecutado las migraciones

```bash
pipenv run migrate
pipenv run upgrade
```

---

# Consejo para desarrollo

Si estás desarrollando nuevas categorías:

1️⃣ Añádelas en `CATEGORIES_DATA`
2️⃣ Ejecuta el seed
3️⃣ El sistema actualizará o creará los registros automáticamente
