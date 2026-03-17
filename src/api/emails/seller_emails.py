import os
from flask_mail import Message

LOGO_FULL = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png"
LOGO_MINI = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png"


def build_seller_registration_email(seller):
    """Email al vendedor confirmando que su solicitud está en revisión."""
    msg = Message(
        subject="▶ Solicitud de vendedor recibida",
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
                                Solicitud de vendedor
                            </p>
                            <h2 style="margin:0 0 16px; color:#1a1a1a; font-size:22px; font-weight:700; font-family:'Courier New', Courier, monospace;">
                                Hola, {seller.user.name}
                            </h2>
                            <p style="margin:0 0 28px; color:#444444; font-size:15px; line-height:1.7;">
                                Hemos recibido tu solicitud para abrir la tienda
                                <strong>{seller.store_name}</strong> en Playback.
                                Nuestro equipo la revisará en cuanto tu verificación de pagos con Stripe
                                esté completada.
                            </p>

                            <!-- RESUMEN SOLICITUD -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px; border:1px solid #e8e8e8; border-radius:6px; overflow:hidden;">
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; background:#fafafa;">
                                        <span style="color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Tienda</span>
                                    </td>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; background:#fafafa; text-align:right;">
                                        <span style="color:#1a1a1a; font-size:14px; font-weight:700;">{seller.store_name}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0;">
                                        <span style="color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px;">NIF / CIF</span>
                                    </td>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; text-align:right;">
                                        <span style="color:#444444; font-size:14px;">{seller.nif_cif}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px;">
                                        <span style="color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Estado</span>
                                    </td>
                                    <td style="padding:10px 16px; text-align:right;">
                                        <span style="display:inline-block; background-color:#fff8dc; color:#b8860b; font-size:12px; font-weight:700; padding:3px 10px; border-radius:3px; letter-spacing:1px; text-transform:uppercase;">
                                            En revisión
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA STRIPE (recordatorio opcional) -->
                            <p style="margin:0 0 12px; color:#444444; font-size:13px; line-height:1.6; text-align:center;">
                                Si aún no has completado la verificación de pagos con Stripe,
                                puedes hacerlo desde aquí:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                <tr>
                                    <td align="center">
                                        <a href="{os.getenv('FRONTEND_URL')}seller/stripe/onboarding" style="display:inline-block; background-color:#1a1a1a; color:#f0c040; text-decoration:none; font-size:14px; font-weight:700; padding:14px 40px; border-radius:4px; letter-spacing:2px; text-transform:uppercase; font-family:'Courier New', Courier, monospace;">
                                            Completar verificación →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0; color:#aaaaaa; font-size:12px; line-height:1.6; text-align:center;">
                                Te avisaremos por email cuando tu tienda sea aprobada.<br>
                                Si tienes dudas, contacta con nosotros en <a href="mailto:{os.getenv('MAIL_DEFAULT_SENDER')}" style="color:#888888;">{os.getenv('MAIL_DEFAULT_SENDER')}</a>.
                            </p>
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
                                            © 2026 Playback
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
        f"Hola {seller.user.name},\n\n"
        f"Hemos recibido tu solicitud para abrir '{seller.store_name}' en Playback.\n"
        "Nuestro equipo la revisará en cuanto tu verificación de pagos con Stripe esté completada.\n\n"
        f"Tienda: {seller.store_name}\n"
        f"NIF/CIF: {seller.nif_cif}\n"
        "Estado: En revisión\n\n"
        "Si aún no has completado la verificación de pagos con Stripe, puedes hacerlo aquí:\n"
        f"{os.getenv('FRONTEND_URL')}seller/stripe/onboarding\n\n"
        "Te avisaremos por email cuando tu tienda sea aprobada.\n\n"
        "Equipo Playback"
    )

    return msg


def build_new_seller_admin_email(seller):
    """Email al admin notificando un nuevo vendedor pendiente de aprobación."""
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_url = f"{os.getenv('FRONTEND_URL')}admin/sellers/{seller.id}"

    msg = Message(
        subject=f"▶ Nuevo vendedor pendiente — {seller.store_name}",
        recipients=[admin_email],
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
                            <p style="margin:10px 0 0; color:#f0c040; font-size:11px; letter-spacing:3px; text-transform:uppercase;">
                                Panel de administración
                            </p>
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
                                Acción requerida
                            </p>
                            <h2 style="margin:0 0 16px; color:#1a1a1a; font-size:22px; font-weight:700; font-family:'Courier New', Courier, monospace;">
                                Nuevo vendedor pendiente
                            </h2>
                            <p style="margin:0 0 28px; color:#444444; font-size:15px; line-height:1.7;">
                                Se ha registrado un nuevo vendedor y ha completado la verificación de Stripe.
                                Está esperando tu aprobación.
                            </p>

                            <!-- DATOS DEL VENDEDOR -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px; border:1px solid #e8e8e8; border-radius:6px; overflow:hidden;">
                                <tr>
                                    <td colspan="2" style="padding:10px 16px; background-color:#1a1a1a;">
                                        <span style="color:#f0c040; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-weight:700;">Datos del vendedor</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px; width:40%;">Tienda</td>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; color:#1a1a1a; font-size:14px; font-weight:700;">{seller.store_name}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; background:#fafafa; color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Nombre</td>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; background:#fafafa; color:#444444; font-size:14px;">{seller.user.name} {seller.user.last_name}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Email</td>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; color:#444444; font-size:14px;">{seller.user.email}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; background:#fafafa; color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px;">NIF / CIF</td>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; background:#fafafa; color:#444444; font-size:14px;">{seller.nif_cif}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Ubicación</td>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; color:#444444; font-size:14px;">{seller.origin_city}, {seller.origin_country}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px;">ID interno</td>
                                    <td style="padding:10px 16px; color:#aaaaaa; font-size:13px;">#{seller.id}</td>
                                </tr>
                            </table>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                                <tr>
                                    <td align="center">
                                        <a href="{admin_url}" style="display:inline-block; background-color:#1a1a1a; color:#f0c040; text-decoration:none; font-size:14px; font-weight:700; padding:14px 40px; border-radius:4px; letter-spacing:2px; text-transform:uppercase; font-family:'Courier New', Courier, monospace;">
                                            Revisar solicitud →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0; color:#aaaaaa; font-size:12px; line-height:1.6; text-align:center;">
                                Este email fue generado automáticamente. No es necesario responder.
                            </p>
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
                                            © 2026 Playback
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
        f"Nuevo vendedor pendiente de aprobación:\n\n"
        f"Tienda:    {seller.store_name}\n"
        f"Nombre:    {seller.user.name} {seller.user.last_name}\n"
        f"Email:     {seller.user.email}\n"
        f"NIF/CIF:   {seller.nif_cif}\n"
        f"Ciudad:    {seller.origin_city}, {seller.origin_country}\n"
        f"ID:        #{seller.id}\n\n"
        f"Revisar: {admin_url}\n\n"
        "Playback — Notificación automática"
    )

    return msg