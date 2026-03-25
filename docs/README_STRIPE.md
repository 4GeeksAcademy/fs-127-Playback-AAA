<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="52">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="52">
</p>

# 💳 Stripe — Pagos y comisiones

Playback usa **Stripe Connect** para gestionar pagos entre compradores y vendedores, con una comisión de plataforma configurable.

---

## Arquitectura

```
Comprador paga → Plataforma recibe el total → Plataforma transfiere al vendedor (total - comisión)
```

- Los compradores pagan a la cuenta de la plataforma
- La plataforma retiene la comisión configurada
- El resto se transfiere automáticamente al vendedor cuando el webhook confirma el pago

Cada vendedor tiene una **Express Account** en Stripe, creada durante su proceso de onboarding.

---

## 1. Variables de entorno

```env
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
PLATFORM_COMMISSION_RATE=0.05
PLATFORM_MINIMUM_COMMISSION=1.00
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX
```

| Variable | Descripción |
|---|---|
| `STRIPE_SECRET_KEY` | Clave secreta de tu cuenta Stripe (test o live) |
| `STRIPE_WEBHOOK_SECRET` | Secreto del endpoint de webhook registrado en Stripe |
| `PLATFORM_COMMISSION_RATE` | Porcentaje de comisión (0.05 = 5%) |
| `PLATFORM_MINIMUM_COMMISSION` | Comisión mínima en euros independientemente del porcentaje |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clave pública usada en el frontend |

---

## 2. Obtener las claves

1. Accede a [dashboard.stripe.com](https://dashboard.stripe.com)
2. Ve a **Developers → API keys**
3. Copia la **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
4. Copia la **Secret key** → `STRIPE_SECRET_KEY`

> Usa las claves de **test** (`sk_test_...` / `pk_test_...`) durante el desarrollo.

---

## 3. Configurar webhooks

Los webhooks son **obligatorios** — sin ellos los pedidos no se actualizan tras el pago.

### En local (Stripe CLI)

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

La CLI muestra un `whsec_...` temporal → cópialo en `STRIPE_WEBHOOK_SECRET`.

### En Codespaces

1. En la pestaña **Ports**, localiza el puerto `3001` y copia la URL pública (`https://xxxx-3001.app.github.dev`)
2. En [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) → **Add endpoint**
3. URL: `https://xxxx-3001.app.github.dev/api/stripe/webhook`
4. Evento: `payment_intent.succeeded`
5. Copia el **Signing secret** → `STRIPE_WEBHOOK_SECRET`

> ⚠️ Cada vez que Codespaces genere una nueva URL deberás actualizar el endpoint en Stripe.

### En producción (Render)

1. En [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) → **Add endpoint**
2. URL: `https://tu-servicio.onrender.com/api/stripe/webhook`
3. Evento: `payment_intent.succeeded`
4. Copia el **Signing secret** → variable `STRIPE_WEBHOOK_SECRET` en Render

---

## 4. Registro de vendedores (Stripe Connect)

Cuando un usuario solicita ser vendedor, el backend:

1. Crea una **Express Account** en Stripe
2. Genera un **Account Link** para el onboarding
3. Redirige al vendedor al formulario de Stripe
4. Al completarlo, Stripe redirige de vuelta a la plataforma

El `stripe_account_id` se guarda en la base de datos y se usa en todas las transferencias posteriores.

---

## 5. Flujo de pago en checkout

1. El frontend solicita al backend la creación de un `PaymentIntent`
2. El backend crea el `PaymentIntent` con el importe total (en céntimos)
3. El frontend usa `PaymentElement` + `confirmPayment()` de Stripe.js
4. Stripe procesa el pago y envía el evento `payment_intent.succeeded` al webhook
5. El backend actualiza el pedido a `paid`, calcula la comisión y ejecuta la transferencia al vendedor

---

## 6. Comisión de plataforma

```python
commission = max(
    order_total * PLATFORM_COMMISSION_RATE,
    PLATFORM_MINIMUM_COMMISSION
)
transfer_amount = order_total - commission
```

Con la configuración por defecto (5% y mínimo 1,00 €):

| Pedido | Comisión | Transferencia al vendedor |
|---|---|---|
| 10 € | 1,00 € (mínimo) | 9,00 € |
| 50 € | 2,50 € (5%) | 47,50 € |
| 200 € | 10,00 € (5%) | 190,00 € |

---

## 7. Tarjetas de prueba

| Número | Resultado |
|---|---|
| `4242 4242 4242 4242` | Pago aprobado |
| `4000 0000 0000 0002` | Pago denegado |
| `4000 0025 0000 3155` | Requiere autenticación 3D Secure |

- Fecha de caducidad: cualquier fecha futura (ej. `12/29`)
- CVC: cualquier 3 dígitos (ej. `123`)
- ZIP: cualquier código (ej. `12345`)

---

## Estados del pedido

```
pending → paid → confirmed → processing → shipped → delivered
```

El paso de `pending` a `paid` lo ejecuta el webhook al recibir `payment_intent.succeeded`.

---

## Resolución de problemas

**Los pedidos no pasan a `paid` después del pago**
- El webhook no está configurado o tiene la URL incorrecta
- Comprueba en el dashboard de Stripe → **Webhooks** que el endpoint recibe eventos (columna *Last delivery*)
- Verifica que `STRIPE_WEBHOOK_SECRET` coincide con el Signing secret del endpoint registrado

**Error al crear el PaymentIntent**
- Comprueba que `STRIPE_SECRET_KEY` es correcta y corresponde al modo test/live que estás usando
- Verifica que el vendedor tiene el onboarding de Stripe completado (`stripe_account_id` en BD)

**Transferencias al vendedor fallidas**
- El vendedor no ha completado el onboarding de Stripe Connect
- En modo test, usa una [cuenta de prueba de Connect](https://stripe.com/docs/connect/testing) para simular el onboarding

---

## <a href="../README.md"><img src="https://img.shields.io/badge/←_Volver_al_README_principal-8b5cf6?style=for-the-badge" /></a>