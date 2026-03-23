import os
from flask_mail import Message

LOGO_FULL = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png"
LOGO_MINI = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png"


def build_incident_created_seller_email(seller, buyer, incident):
    """Email al vendedor cuando el comprador abre una incidencia sobre su pedido."""

    msg = Message(
        subject=f"▶️ Nueva incidencia en el pedido #{incident.order_id}",
        recipients=[seller.user.email],
        sender=("Playback", os.getenv("MAIL_DEFAULT_SENDER"))
    )

    msg.html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f5f0e8; font-family:'Courier New', Courier, monospace;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8; padding:40px 0;">
        <tr>
            <td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px; width:100%;">

                    <!-- HEADER -->
                    <tr>
                        <td align="center" style="background-color:#1a1a1a; padding:28px 40px; border-radius:8px 8px 0 0;">
                            <img src="{LOGO_FULL}" alt="Playback" width="180" style="display:block; max-width:180px;">
                        </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                        <td style="background-color:#f0c040; height:4px;"></td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                        <td style="background-color:#ffffff; padding:40px 40px 32px;">
                            <p style="margin:0 0 8px; color:#888888; font-size:11px; letter-spacing:2px; text-transform:uppercase;">
                                Nueva incidencia
                            </p>
                            <h2 style="margin:0 0 16px; color:#1a1a1a; font-size:22px; font-weight:700; font-family:'Courier New', Courier, monospace;">
                                Hola, {seller.store_name}
                            </h2>
                            <p style="margin:0 0 28px; color:#444444; font-size:15px; line-height:1.7;">
                                El comprador <strong>{buyer.name} {buyer.last_name}</strong> ha abierto
                                una incidencia relacionada con el pedido <strong>#{incident.order_id}</strong>.
                            </p>

                            <!-- DETALLE INCIDENCIA -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px; border:1px solid #e8e8e8; border-radius:6px; overflow:hidden;">
                                <tr>
                                    <td colspan="2" style="padding:10px 16px; background-color:#1a1a1a;">
                                        <span style="color:#f0c040; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-weight:700;">
                                            Detalle de la incidencia
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px; width:30%; vertical-align:top;">
                                        Asunto
                                    </td>
                                    <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; color:#1a1a1a; font-size:14px; font-weight:700;">
                                        {incident.title}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 16px; background:#fafafa; color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px; vertical-align:top;">
                                        Descripción
                                    </td>
                                    <td style="padding:12px 16px; background:#fafafa; color:#444444; font-size:14px; line-height:1.6;">
                                        {incident.description}
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{os.getenv('FRONTEND_URL')}seller/incidents" style="display:inline-block; background-color:#1a1a1a; color:#f0c040; text-decoration:none; font-size:14px; font-weight:700; padding:14px 40px; border-radius:4px; letter-spacing:2px; text-transform:uppercase; font-family:'Courier New', Courier, monospace;">
                                            Ver incidencia →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                        <td style="background-color:#f0c040; height:4px;"></td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="background-color:#1a1a1a; padding:20px 40px; border-radius:0 0 8px 8px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <img src="{LOGO_MINI}" alt="Playback" height="28" style="display:block;">
                                    </td>
                                    <td align="right">
                                        <p style="margin:0; color:#555555; font-size:11px; font-family:'Courier New', Courier, monospace;">
                                            ©️ 2026 Playback
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

    msg.body = (
        f"Hola {seller.store_name},\n\n"
        f"El comprador {buyer.name} {buyer.last_name} ha abierto una incidencia "
        f"en el pedido #{incident.order_id}.\n\n"
        f"Asunto: {incident.title}\n"
        f"Descripción: {incident.description}\n\n"
        f"Ver incidencia: {os.getenv('FRONTEND_URL')}seller/incidents\n\n"
        "Equipo Playback"
    )

    return msg


def build_incident_status_changed_email(buyer, incident):
    """Email al comprador cuando el admin o vendedor cambia el estado de la incidencia."""

    STATUS_LABELS = {
        "open":        "Abierta",
        "in_progress": "En progreso",
        "resolved":    "Resuelta",
        "rejected":    "Rechazada",
    }
    STATUS_COLORS = {
        "open":        "#633806",
        "in_progress": "#185FA5",
        "resolved":    "#3B6D11",
        "rejected":    "#A32D2D",
    }
    STATUS_BG = {
        "open":        "#FAEEDA",
        "in_progress": "#E6F1FB",
        "resolved":    "#EAF3DE",
        "rejected":    "#FCEBEB",
    }

    status = incident.status if isinstance(incident.status, str) else incident.status.value
    label  = STATUS_LABELS.get(status, status)
    color  = STATUS_COLORS.get(status, "#555555")
    bg     = STATUS_BG.get(status, "#f7f7f7")

    msg = Message(
        subject=f"▶️ Actualización de tu incidencia — pedido #{incident.order_id}",
        recipients=[buyer.email],
        sender=("Playback", os.getenv("MAIL_DEFAULT_SENDER"))
    )

    msg.html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f5f0e8; font-family:'Courier New', Courier, monospace;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8; padding:40px 0;">
        <tr>
            <td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px; width:100%;">

                    <!-- HEADER -->
                    <tr>
                        <td align="center" style="background-color:#1a1a1a; padding:28px 40px; border-radius:8px 8px 0 0;">
                            <img src="{LOGO_FULL}" alt="Playback" width="180" style="display:block; max-width:180px;">
                        </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                        <td style="background-color:#f0c040; height:4px;"></td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                        <td style="background-color:#ffffff; padding:40px 40px 32px;">
                            <p style="margin:0 0 8px; color:#888888; font-size:11px; letter-spacing:2px; text-transform:uppercase;">
                                Actualización de incidencia
                            </p>
                            <h2 style="margin:0 0 16px; color:#1a1a1a; font-size:22px; font-weight:700; font-family:'Courier New', Courier, monospace;">
                                Hola, {buyer.name}
                            </h2>
                            <p style="margin:0 0 28px; color:#444444; font-size:15px; line-height:1.7;">
                                El estado de tu incidencia <strong>"{incident.title}"</strong>
                                del pedido <strong>#{incident.order_id}</strong> ha sido actualizado.
                            </p>

                            <!-- NUEVO ESTADO -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                <tr>
                                    <td align="center" style="padding:20px;">
                                        <span style="display:inline-block; background-color:{bg}; color:{color}; font-size:15px; font-weight:700; padding:10px 28px; border-radius:20px; letter-spacing:1px;">
                                            {label}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{os.getenv('FRONTEND_URL')}profile?tab=incidents" style="display:inline-block; background-color:#1a1a1a; color:#f0c040; text-decoration:none; font-size:14px; font-weight:700; padding:14px 40px; border-radius:4px; letter-spacing:2px; text-transform:uppercase; font-family:'Courier New', Courier, monospace;">
                                            Ver incidencia →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                        <td style="background-color:#f0c040; height:4px;"></td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="background-color:#1a1a1a; padding:20px 40px; border-radius:0 0 8px 8px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <img src="{LOGO_MINI}" alt="Playback" height="28" style="display:block;">
                                    </td>
                                    <td align="right">
                                        <p style="margin:0; color:#555555; font-size:11px; font-family:'Courier New', Courier, monospace;">
                                            ©️ 2026 Playback
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

    msg.body = (
        f"Hola {buyer.name},\n\n"
        f"El estado de tu incidencia \"{incident.title}\" del pedido #{incident.order_id} "
        f"ha sido actualizado a: {label}\n\n"
        f"Ver incidencia: {os.getenv('FRONTEND_URL')}profile?tab=incidents\n\n"
        "Equipo Playback"
    )

    return msg


def build_incident_new_message_email(recipient, sender, incident):
    """Email al destinatario cuando alguien envía un mensaje en la incidencia."""

    msg = Message(
        subject=f"▶️ Nuevo mensaje en tu incidencia — pedido #{incident.order_id}",
        recipients=[recipient.email],
        sender=("Playback", os.getenv("MAIL_DEFAULT_SENDER"))
    )

    msg.html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f5f0e8; font-family:'Courier New', Courier, monospace;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8; padding:40px 0;">
        <tr>
            <td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px; width:100%;">

                    <!-- HEADER -->
                    <tr>
                        <td align="center" style="background-color:#1a1a1a; padding:28px 40px; border-radius:8px 8px 0 0;">
                            <img src="{LOGO_FULL}" alt="Playback" width="180" style="display:block; max-width:180px;">
                        </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                        <td style="background-color:#f0c040; height:4px;"></td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                        <td style="background-color:#ffffff; padding:40px 40px 32px;">
                            <p style="margin:0 0 8px; color:#888888; font-size:11px; letter-spacing:2px; text-transform:uppercase;">
                                Nuevo mensaje
                            </p>
                            <h2 style="margin:0 0 16px; color:#1a1a1a; font-size:22px; font-weight:700; font-family:'Courier New', Courier, monospace;">
                                Hola, {recipient.name}
                            </h2>
                            <p style="margin:0 0 28px; color:#444444; font-size:15px; line-height:1.7;">
                                <strong>{sender.name} {sender.last_name}</strong> ha enviado un mensaje
                                en la incidencia <strong>"{incident.title}"</strong>
                                del pedido <strong>#{incident.order_id}</strong>.
                            </p>
                            <p style="margin:0 0 28px; color:#888888; font-size:13px; line-height:1.6;">
                                Accede a tu perfil para ver el mensaje completo y responder.
                            </p>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{os.getenv('FRONTEND_URL')}profile?tab=incidents" style="display:inline-block; background-color:#1a1a1a; color:#f0c040; text-decoration:none; font-size:14px; font-weight:700; padding:14px 40px; border-radius:4px; letter-spacing:2px; text-transform:uppercase; font-family:'Courier New', Courier, monospace;">
                                            Ver mensaje →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- DIVIDER -->
                    <tr>
                        <td style="background-color:#f0c040; height:4px;"></td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style="background-color:#1a1a1a; padding:20px 40px; border-radius:0 0 8px 8px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <img src="{LOGO_MINI}" alt="Playback" height="28" style="display:block;">
                                    </td>
                                    <td align="right">
                                        <p style="margin:0; color:#555555; font-size:11px; font-family:'Courier New', Courier, monospace;">
                                            ©️ 2026 Playback
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

    msg.body = (
        f"Hola {recipient.name},\n\n"
        f"{sender.name} {sender.last_name} ha enviado un mensaje en la incidencia "
        f"\"{incident.title}\" del pedido #{incident.order_id}.\n\n"
        f"Ver mensaje: {os.getenv('FRONTEND_URL')}profile?tab=incidents\n\n"
        "Equipo Playback"
    )

    return msg