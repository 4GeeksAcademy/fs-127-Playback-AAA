import os
from flask_mail import Message

LOGO_FULL = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png"
LOGO_MINI = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png"


def build_welcome_email(user):
    msg = Message(
        subject="▶ Tu cuenta en Playback está lista",
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
                        <td align="center" style="background-color:#1a1a1a; padding:32px 40px; border-radius:8px 8px 0 0;">
                            <img src="{LOGO_FULL}" alt="Playback" width="200" style="display:block; max-width:200px;">
                            <p style="margin:12px 0 0; color:#888888; font-size:11px; letter-spacing:3px; text-transform:uppercase;">
                                Compra · Vende · Colecciona
                            </p>
                        </td>
                    </tr>

                    <!-- DIVIDER RETRO -->
                    <tr>
                        <td style="background-color:#f0c040; height:4px;"></td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                        <td style="background-color:#ffffff; padding:40px 40px 32px;">
                            <p style="margin:0 0 8px; color:#888888; font-size:11px; letter-spacing:2px; text-transform:uppercase;">
                                Bienvenido a Playback
                            </p>
                            <h2 style="margin:0 0 20px; color:#1a1a1a; font-size:24px; font-weight:700; font-family:'Courier New', Courier, monospace;">
                                Hola, {user.name}
                            </h2>
                            <p style="margin:0 0 28px; color:#444444; font-size:15px; line-height:1.7;">
                                Tu cuenta está lista. Ya puedes explorar el mercado retro más completo: 
                                desde cartuchos de los 90 hasta vinilos, cartas coleccionables, ropa vintage 
                                y mucho más.
                            </p>

                            <!-- CATEGORIAS -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px; border:1px solid #e8e8e8; border-radius:6px; overflow:hidden;">
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0;">
                                        <span style="font-size:14px;">🎮</span>
                                        <span style="color:#333333; font-size:14px; margin-left:10px;">Videojuegos y consolas</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; background:#fafafa;">
                                        <span style="font-size:14px;">🎵</span>
                                        <span style="color:#333333; font-size:14px; margin-left:10px;">Vinilos, casetes y CDs</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0;">
                                        <span style="font-size:14px;">🃏</span>
                                        <span style="color:#333333; font-size:14px; margin-left:10px;">Cartas coleccionables</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; background:#fafafa;">
                                        <span style="font-size:14px;">👕</span>
                                        <span style="color:#333333; font-size:14px; margin-left:10px;">Ropa y accesorios vintage</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 16px;">
                                        <span style="font-size:14px;">💻</span>
                                        <span style="color:#333333; font-size:14px; margin-left:10px;">Ordenadores y tecnología retro</span>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{os.getenv('FRONTEND_URL')}" style="display:inline-block; background-color:#1a1a1a; color:#f0c040; text-decoration:none; font-size:14px; font-weight:700; padding:14px 40px; border-radius:4px; letter-spacing:2px; text-transform:uppercase; font-family:'Courier New', Courier, monospace;">
                                            Entrar a Playback →
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- DIVIDER RETRO -->
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
                                        <p style="margin:0; color:#DDDDDD; font-size:13px; font-family:'Courier New', Courier, monospace;">
                                            © 2026 Playback<br>
                                            <span style="color:#DDDDDD;">Si no creaste esta cuenta, ignora este mensaje.</span>
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
        "Tu cuenta en Playback está lista.\n\n"
        "Ya puedes explorar el mercado retro: videojuegos, música, cartas, ropa vintage y mucho más.\n\n"
        f"Entra aquí: {os.getenv('FRONTEND_URL')}\n\n"
        "Equipo Playback"
    )

    return msg