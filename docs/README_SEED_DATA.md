# 🧪 Seed de datos de prueba

Puebla la base de datos con usuarios, productos y pedidos de prueba para desarrollar sin introducir datos manualmente.

> ⚠️ Usarlo solo en desarrollo. Nunca en producción.

---

## Requisitos previos

```bash
pipenv run upgrade           # migraciones aplicadas
pipenv run seed_categories   # categorías creadas (obligatorio primero)
```

---

## Ejecución

```bash
pipenv run seed_data
```

El seed es **idempotente** — comprueba si cada dato ya existe antes de crearlo, por lo que puedes ejecutarlo varias veces sin duplicar registros.

---

## ¿Qué crea?

| Dato | Cantidad | Detalle |
|---|---|---|
| 👤 Usuarios | 10 | Con contraseña hasheada |
| 📦 Productos | 176 | De distintas categorías |
| 🛒 Pedidos | 36 | Con todos los estados posibles |
| 📋 OrderDetails | Variable | 1–3 productos por pedido |
| ⭐ Reviews | Variable | Solo en pedidos entregados |
| ❤️ Favoritos | Variable | 2–5 por usuario |

Estados de pedido generados: `paid` · `confirmed` · `processing` · `shipped` · `delivered` · `cancelled`

---

## Credenciales de prueba

### Administración
| Email | Contraseña | Rol |
|---|---|---|
| admin@playback.com | Admin! | Admin |
| seller@playback.com | Seller! | Vendedor |

### Vendedores
| Email | Contraseña |
|---|---|
| carlos@test.com | Test1234! |
| maria@test.com | Test1234! |
| alex@test.com | Test1234! |

### Compradores
| Email | Contraseña |
|---|---|
| lucia@test.com | Test1234! |
| pablo@test.com | Test1234! |
| elena@test.com | Test1234! |
| javier@test.com | Test1234! |
| ana@test.com | Test1234! |

---

## <a href="../README.md"><img src="https://img.shields.io/badge/←_Volver_al_README_principal-8b5cf6?style=for-the-badge" /></a>