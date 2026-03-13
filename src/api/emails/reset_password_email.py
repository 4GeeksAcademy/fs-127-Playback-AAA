import os
from flask_mail import Message

LOGO_FULL = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png"
LOGO_MINI = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png"


def build_reset_password_email(user, reset_url):
    msg = Message(
        subject="▶ Restablece tu contraseña",
        recipients=[user.email],
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
                                Seguridad de cuenta
                            </p>
                            <h2 style="margin:0 0 16px; color:#1a1a1a; font-size:22px; font-weight:700; font-family:'Courier New', Courier, monospace;">
                                Hola, {user.name}
                            </h2>
                            <p style="margin:0 0 28px; color:#444444; font-size:15px; line-height:1.7;">
                                Recibimos una solicitud para restablecer tu contraseña. 
                                Haz clic en el botón — el enlace expira en <strong>15 minutos</strong>.
                            </p>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                <tr>
                                    <td align="center">
                                        <a href="{reset_url}" style="display:inline-block; background-color:#1a1a1a; color:#f0c040; text-decoration:none; font-size:14px; font-weight:700; padding:14px 40px; border-radius:4px; letter-spacing:2px; text-transform:uppercase; font-family:'Courier New', Courier, monospace;">
                                            Restablecer contraseña →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0; color:#aaaaaa; font-size:12px; line-height:1.6; text-align:center;">
                                Si no solicitaste este cambio, ignora este mensaje.<br>Tu contraseña no cambiará.
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
        f"Hola {user.name},\n\n"
        "Recibimos una solicitud para restablecer tu contraseña.\n\n"
        f"Enlace (expira en 15 minutos):\n{reset_url}\n\n"
        "Si no solicitaste este cambio, ignora este mensaje.\n\n"
        "Equipo Playback"
    )

    return msg