# 🌱 Seed de datos de prueba

Este script puebla la base de datos con datos de prueba para poder desarrollar y probar la aplicación sin necesidad de introducir datos manualmente.

> ⚠️ **Úsalo solo en desarrollo. Nunca en producción.**

---

## ¿Qué crea?

| Dato | Cantidad | Detalle |
|---|---|---|
| 👤 Usuarios | 5 | Con contraseña hasheada |
| 📦 Productos | 12 | De distintas categorías |
| 🛒 Pedidos | 10–20 | Con todos los estados posibles |
| 📋 OrderDetails | Variable | 1–3 productos por pedido |
| ⭐ Reviews | Variable | Solo en pedidos entregados |
| ❤️ Favoritos | Variable | 2–5 por usuario |

### Estados de pedido generados
- `pending` — pendiente
- `confirmed` — confirmado
- `processing` — en proceso
- `shipped` — enviado
- `delivered` — entregado
- `cancelled` — cancelado

---

## 📋 Requisitos previos

Antes de ejecutar este seed asegúrate de:

1. Haber ejecutado las migraciones:
```bash
pipenv run upgrade
```

2. Haber ejecutado el seed de categorías **primero** — los productos dependen de los items creados por ese seed:
```bash
pipenv run python src/api/seeds/seed_categories.py
```

---

## ▶️ Ejecución
```bash
pipenv run python src/api/seeds/seed_test_data.py
```

---

## 👤 Credenciales de prueba

| Email | Contraseña |
|---|---|
| carlos@test.com | Test1234! |
| maria@test.com | Test1234! |
| alex@test.com | Test1234! |
| lucia@test.com | Test1234! |
| pablo@test.com | Test1234! |

---

## 🔁 ¿Puedo ejecutarlo varias veces?

Sí, el seed es **idempotente** — comprueba si el dato ya existe antes de crearlo y lo omite si es así, por lo que puedes ejecutarlo varias veces sin duplicar datos.