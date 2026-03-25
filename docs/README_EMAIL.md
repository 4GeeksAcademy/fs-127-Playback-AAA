<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="52">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="52">
</p>

# 📧 Email — Configuración con Brevo API HTTP

Playback envía emails transaccionales usando **Brevo** (antes Sendinblue) como proveedor. Los mensajes se construyen con **Flask-Mail** pero se envían a través de la **API HTTP de Brevo** — no por SMTP — ya que las plataformas cloud bloquean los puertos SMTP salientes (587/465).

---

## 1. Crear cuenta en Brevo

1. Regístrate en [brevo.com](https://www.brevo.com) (plan gratuito disponible)
2. Ve a **Settings → API Keys** y genera una API key
3. En **Settings → Senders & IP → Senders**, añade y verifica el email remitente

---

## 2. Variables de entorno

```env
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxx
MAIL_DEFAULT_SENDER=tu_email@dominio.com
FRONTEND_URL=http://localhost:3000/
```

| Variable | Descripción |
|---|---|
| `BREVO_API_KEY` | API key generada en el panel de Brevo |
| `MAIL_DEFAULT_SENDER` | Email remitente verificado en Brevo |
| `FRONTEND_URL` | URL base del frontend (para los enlaces dentro de los emails) |

> **Nota sobre variables legacy:** `.env.example` contiene `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USE_TLS`, `MAIL_USERNAME` y `MAIL_PASSWORD`. Estas variables son restos de una implementación anterior por SMTP y **no son necesarias** para el envío actual. Puedes ignorarlas o dejarlas vacías.

---

## 3. Arquitectura de envío

```
Controller
    │
    ├── build_*_email()       ← Construye el objeto Message (subject, html, recipients)
    │       welcome_email.py, order_emails.py, etc.
    │
    ├── _send_email_async()   ← Lanza el envío en un hilo separado (no bloquea Gunicorn)
    │
    └── send_email(msg)       ← brevo_service.py — llama a la API HTTP de Brevo
```

Flask-Mail se usa únicamente para construir los objetos `Message`. El envío real lo hace `brevo_service.py` contra el endpoint REST de Brevo. Los fallos de email nunca interrumpen el flujo principal de la aplicación.

---

## 4. Catálogo de emails

### Por evento

```
REGISTRO / AUTENTICACIÓN
├── Registro                  → build_welcome_email()
│                               → Destinatario: nuevo usuario
│                               → Asunto: "▶ Tu cuenta en Playback está lista"
│
└── Recuperar contraseña      → build_reset_password_email()
                                → Destinatario: usuario
                                → Asunto: "▶ Restablece tu contraseña"

VENDEDORES
├── Solicitud de vendedor     → build_seller_registration_email()
│                               → Destinatario: vendedor
│                               → Asunto: confirmación de solicitud recibida
│
└── Onboarding Stripe         → build_new_seller_admin_email()
    completado                  → Destinatario: admin (MAIL_DEFAULT_SENDER)
                                → Asunto: notificación de nuevo vendedor listo

PEDIDOS
├── Pago completado           → build_order_confirmation_buyer_email()
│   (webhook Stripe)            → Destinatario: comprador
│
├── Pago completado           → build_new_order_seller_email()
│   (webhook Stripe)            → Destinatario: cada vendedor implicado
│                               → (un email por vendedor con solo sus productos)
│
├── Pedido enviado            → build_order_shipped_buyer_email()
│   (vendedor marca shipped)    → Destinatario: comprador
│                               → Incluye: código de seguimiento y transportista
│
├── Pedido cancelado          → build_order_cancelled_buyer_email()
│   (por vendedor)              → Destinatario: comprador
│
└── Pedido cancelado          → build_order_cancelled_seller_email()
    (por plataforma/comprador)  → Destinatario: vendedor afectado

INCIDENCIAS
├── Incidencia abierta        → build_incident_created_seller_email()
│   (comprador abre ticket)     → Destinatario: vendedor implicado
│                               → Asunto: "Nueva incidencia en el pedido #X"
│
├── Estado actualizado        → build_incident_status_changed_email()
│   (vendedor o admin cambia    → Destinatario: comprador
│    open/in_progress/          → Informa del nuevo estado de la incidencia
│    resolved/rejected)
│
└── Nuevo mensaje en ticket   → build_incident_new_message_email()
    (cualquier participante)    → Destinatario: el otro participante
                                → Comprador escribe → notifica al vendedor
                                → Vendedor/admin escribe → notifica al comprador
```

### Tabla resumen

| Evento | Destinatario |
|---|---|
| Registro de usuario | Comprador / Vendedor |
| Recuperación de contraseña | Usuario |
| Solicitud de vendedor | Vendedor |
| Onboarding Stripe completado | Admin |
| Pago completado — confirmación | Comprador |
| Pago completado — nueva venta | Vendedor(es) |
| Pedido enviado | Comprador |
| Pedido cancelado (al comprador) | Comprador |
| Pedido cancelado (al vendedor) | Vendedor |
| Incidencia abierta | Vendedor |
| Estado de incidencia actualizado | Comprador |
| Nuevo mensaje en incidencia | Otro participante |

---

## 5. Verificar el remitente en Brevo

Para que los emails no caigan en spam el remitente debe estar verificado:

1. En Brevo → **Settings → Senders & IP → Senders**
2. Añade el email que usas en `MAIL_DEFAULT_SENDER`
3. Sigue el proceso de verificación

---

## 6. Límites del plan gratuito

| Plan | Emails/día | Emails/mes |
|---|---|---|
| Gratuito | 300 | 9.000 |
| Starter | Sin límite diario | Desde 20.000/mes |

Suficiente para desarrollo y pruebas del MVP.

---

## Resolución de problemas

**Los emails no llegan**
- Verifica que `BREVO_API_KEY` está configurada en las variables de entorno
- Comprueba que el email remitente está verificado en Brevo
- Revisa los logs del backend — los errores de Brevo se imprimen con su código HTTP

**Error 400 — `valid sender email required`**
- El email en `MAIL_DEFAULT_SENDER` no está verificado en Brevo
- Añádelo y confírmalo desde **Settings → Senders & IP → Senders**

**Error 401 — `unauthorized`**
- La `BREVO_API_KEY` es incorrecta o ha sido revocada
- Genera una nueva desde **Settings → API Keys**

**Los emails no se envían en producción (Render)**
- Confirma que `BREVO_API_KEY` y `MAIL_DEFAULT_SENDER` están en las variables de entorno del servicio
- Los fallos de email son silenciosos por diseño (no rompen el flujo) — revisa los logs para detectarlos

---

## <a href="../README.md"><img src="https://img.shields.io/badge/←_Volver_al_README_principal-8b5cf6?style=for-the-badge" /></a>