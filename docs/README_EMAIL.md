<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="52">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="52">
</p>

# 📧 Email — Configuración con Brevo SMTP

Playback envía emails transaccionales usando **Brevo** (antes Sendinblue) como proveedor SMTP, a través de **Flask-Mail**.

---

## 1. Crear cuenta en Brevo

1. Regístrate en [brevo.com](https://www.brevo.com) (plan gratuito disponible)
2. Ve a **Settings → Senders & IP → SMTP & API**
3. En la pestaña **SMTP**, anota:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: tu email SMTP (formato `xxxxxxx@smtp-brevo.com`)
   - **Password**: genera una clave SMTP desde esa misma pantalla

---

## 2. Variables de entorno

Añade esto a tu `.env`:
```env
MAIL_SERVER=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=tu_login_smtp@smtp-brevo.com
MAIL_DEFAULT_SENDER="Nombre del remitente <tu_email@dominio.com>"
MAIL_PASSWORD=tu_clave_smtp_de_brevo
```

| Variable | Descripción |
|---|---|
| `MAIL_SERVER` | Servidor SMTP de Brevo (no cambiar) |
| `MAIL_PORT` | Puerto SMTP con TLS (no cambiar) |
| `MAIL_USE_TLS` | Cifrado TLS (no cambiar) |
| `MAIL_USERNAME` | Login SMTP que aparece en tu cuenta Brevo |
| `MAIL_DEFAULT_SENDER` | Nombre y email que verá el destinatario |
| `MAIL_PASSWORD` | Clave SMTP generada en Brevo (no es tu contraseña de acceso) |

---

## 3. Configuración en `app.py`

Flask-Mail se configura automáticamente leyendo las variables de entorno con el prefijo `MAIL_`:
```python
from flask_mail import Mail

mail = Mail()

def create_app():
    app = Flask(__name__)

    app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
    app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
    app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "True") == "True"
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")

    mail.init_app(app)
```

---

## 4. Enviar un email
```python
from flask_mail import Message
from src.app import mail

def send_order_confirmation(user_email, order_id):
    msg = Message(
        subject="Tu pedido ha sido confirmado",
        recipients=[user_email]
    )
    msg.body = f"Tu pedido #{order_id} ha sido recibido correctamente."
    msg.html = f"<p>Tu pedido <strong>#{order_id}</strong> ha sido recibido.</p>"

    mail.send(msg)
```

---

## 5. Envío asíncrono en producción (Render)

El plan gratuito de Render **bloquea las conexiones SMTP salientes**. Para evitar que un timeout de red mate el worker de gunicorn, todos los `mail.send()` se ejecutan en un hilo separado mediante un helper compartido:

```python
from threading import Thread
from flask import current_app

def _send_email_async(app, message):
    with app.app_context():
        try:
            mail.send(message)
        except Exception as e:
            print(f"[Mail] Error al enviar email: {str(e)}")

# Uso
Thread(
    target=_send_email_async,
    args=(current_app._get_current_object(), mensaje)
).start()
```

**¿Por qué `current_app._get_current_object()`?**
Flask usa proxies de contexto — `current_app` dentro de un hilo nuevo no tiene contexto activo. `_get_current_object()` extrae la instancia real de la app para pasarla al hilo, que luego abre su propio contexto con `app.app_context()`.

> ⚠️ En local el comportamiento es idéntico: el hilo envía el email por SMTP normalmente. No hay diferencia funcional entre entornos.

---

## 6. Emails enviados por la plataforma

| Evento | Destinatario | Descripción |
|---|---|---|
| Registro de usuario | Cliente | Bienvenida a la plataforma |
| Cambio de contraseña | Cliente | Servicio de recuperación |
| Pedido realizado | Cliente | Confirmación del pedido |
| Pago completado | Vendedor | Notificación de nueva venta |
| Cambio de estado del pedido | Cliente | Actualización del envío |
| Solicitud de vendedor aprobada | Vendedor | Acceso activado |
| Solicitud de vendedor rechazada | Vendedor | Motivo del rechazo |
| Ticket de soporte | Usuario | Confirmación de recepción |

---

## 7. Límites del plan gratuito de Brevo

| Plan | Emails/día | Emails/mes |
|---|---|---|
| Gratuito | 300 | 9.000 |
| Starter | Sin límite diario | Desde 20.000/mes |

El plan gratuito es suficiente para desarrollo y pruebas.

---

## 8. Verificar el remitente en Brevo

Para que los emails no caigan en spam, debes **verificar el dominio o el email remitente**:

1. En Brevo → **Settings → Senders & IP → Senders**
2. Añade el email que usas en `MAIL_DEFAULT_SENDER`
3. Sigue el proceso de verificación (recibirás un email de confirmación)

---

## Resolución de problemas

**Los emails no llegan**
- Verifica que `MAIL_USERNAME` y `MAIL_PASSWORD` son los del SMTP (no los de tu cuenta de Brevo)
- Comprueba la carpeta de spam del destinatario
- Revisa los logs del backend para ver si Flask-Mail lanza algún error

**Error de autenticación SMTP**
- Regenera la clave SMTP en el panel de Brevo
- Actualiza `MAIL_PASSWORD` en `.env` y reinicia el backend

**El remitente no aparece verificado**
- Sin verificar, Brevo puede limitar el envío o redirigir los mensajes
- Completa la verificación del remitente en el panel de Brevo

**Los emails no se envían en producción (Render free)**
- Render bloquea los puertos SMTP en el plan gratuito
- Todos los `mail.send()` deben ejecutarse en un hilo separado (ver sección 5)
- Los errores de envío se registran en los logs del servidor pero no interrumpen el flujo principal