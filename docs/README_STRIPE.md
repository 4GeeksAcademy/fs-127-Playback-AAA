<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="52">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="52">
</p>

# 💳 Stripe — Pagos y comisiones

Playback usa **Stripe Connect** para gestionar pagos entre compradores y vendedores, con una comisión de plataforma configurable.

---

## Arquitectura

El flujo de pago funciona así:
```
Comprador paga → Plataforma recibe el total → Plataforma transfiere al vendedor (total - comisión)
```

- Los compradores pagan a la cuenta de la plataforma
- La plataforma retiene la comisión configurada
- El resto se transfiere automáticamente al vendedor al confirmar el pago (`payment_intent.succeeded`)

Cada vendedor tiene una **Express Account** en Stripe, creada durante el proceso de registro como vendedor.

---

## 1. Variables de entorno
```env
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
PLATFORM_COMMISSION_RATE=0.05
PLATFORM_MINIMUM_COMMISSION=1.00
```

| Variable | Descripción |
|---|---|
| `STRIPE_SECRET_KEY` | Clave secreta de tu cuenta Stripe (test o live) |
| `STRIPE_WEBHOOK_SECRET` | Secreto del endpoint de webhook registrado en Stripe |
| `PLATFORM_COMMISSION_RATE` | Porcentaje de comisión (0.05 = 5%) |
| `PLATFORM_MINIMUM_COMMISSION` | Comisión mínima en euros independientemente del porcentaje |

Y en el frontend:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX
```

---

## 2. Obtener las claves

1. Accede a [dashboard.stripe.com](https://dashboard.stripe.com)
2. Ve a **Developers → API keys**
3. Copia la **Publishable key** → `VITE_STRIPE_PUBLISHABLE_KEY`
4. Copia la **Secret key** → `STRIPE_SECRET_KEY`

> Usa las claves de **test** (`sk_test_...` / `pk_test_...`) durante el desarrollo.

---

## 3. Configurar webhooks

Los webhooks permiten que Stripe notifique al backend cuando un pago se completa. **Es obligatorio configurarlo** para que los pedidos se actualicen correctamente.

### En Codespaces o entornos remotos

El puerto del backend no es accesible desde internet directamente. Debes usar la URL pública que genera Codespaces.

1. En la pestaña **Ports**, localiza el puerto `3001`
2. Copia la URL pública (formato `https://xxxx-3001.app.github.dev`)
3. Ve a [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
4. Haz clic en **Add endpoint**
5. Introduce la URL del webhook:
```
https://tu-url-publica-3001.app.github.dev/api/stripe/webhook
```

6. En **Events to listen**, selecciona:
   - `payment_intent.succeeded`

7. Haz clic en **Add endpoint**
8. Copia el **Signing secret** → `STRIPE_WEBHOOK_SECRET` en tu `.env`

> ⚠️ Cada vez que Codespaces genere una URL nueva para el backend, tendrás que **actualizar el endpoint** en el dashboard de Stripe.

### En local

En local puedes usar la **Stripe CLI** para redirigir los webhooks:
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

La CLI te mostrará un `whsec_...` temporal que debes copiar en `STRIPE_WEBHOOK_SECRET`.

---

## 4. Registro de vendedores (Stripe Connect)

Cuando un usuario se registra como vendedor en Playback, el backend:

1. Crea una **Express Account** en Stripe
2. Genera un **Account Link** para que el vendedor complete el onboarding en Stripe
3. Redirige al vendedor al formulario de Stripe
4. Al completarlo, Stripe redirige de vuelta a la plataforma

El `stripe_account_id` del vendedor se guarda en la base de datos y se usa en todas las transferencias posteriores.

---

## 5. Flujo de pago en checkout

1. El frontend solicita al backend la creación de un `PaymentIntent`
2. El backend crea el `PaymentIntent` con el importe total (en céntimos)
3. El frontend usa `PaymentElement` + `confirmPayment()` de Stripe.js
4. Stripe procesa el pago y envía el evento `payment_intent.succeeded` al webhook
5. El backend:
   - Actualiza el estado del pedido a `paid`
   - Calcula la comisión de plataforma
   - Ejecuta la transferencia al vendedor

---

## 6. Comisión de plataforma

La comisión se calcula así:
```python
commission = max(
    order_total * PLATFORM_COMMISSION_RATE,
    PLATFORM_MINIMUM_COMMISSION
)
transfer_amount = order_total - commission
```

Con la configuración por defecto (`0.05` y `1.00€`):

| Pedido | Comisión | Transferencia al vendedor |
|---|---|---|
| 10€ | 1.00€ (mínimo) | 9.00€ |
| 50€ | 2.50€ (5%) | 47.50€ |
| 200€ | 10.00€ (5%) | 190.00€ |

---

## 7. Tarjetas de prueba

Para probar el flujo de pago en modo test:

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

El paso de `pending` a `paid` lo ejecuta automáticamente el webhook al recibir `payment_intent.succeeded`.