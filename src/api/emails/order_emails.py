import os
from flask_mail import Message

LOGO_FULL = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png"
LOGO_MINI = "https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png"


def build_new_order_seller_email(seller, order, details):

    address = order.shipping_address
    address_html = (
        f"{address.full_name}<br>{address.address}<br>{address.city}, {address.country}"
        if address else "—"
    )

    products_rows = "".join([
        f"""
        <tr>
            <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0;">
                <span style="font-size:14px;">📦</span>
                <span style="color:#333333; font-size:14px; margin-left:10px;">{d.product.name.get('es')}</span>
            </td>
            <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; text-align:center; color:#333; font-size:14px;">
                x{d.quantity}
            </td>
            <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; text-align:right; color:#333; font-size:14px;">
                {(d.product.price * (1 - (d.product.discount or 0) / 100) * d.quantity):.2f} €
            </td>
        </tr>
        """
        for d in details 
    ])

    msg = Message(
        subject=f"▶ Nuevo pedido #{order.id} — prepara el envío",
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
                                Nuevo pedido recibido
                            </p>
                            <h2 style="margin:0 0 16px; color:#1a1a1a; font-size:22px; font-weight:700; font-family:'Courier New', Courier, monospace;">
                                Hola, {seller.store_name}
                            </h2>
                            <p style="margin:0 0 28px; color:#444444; font-size:15px; line-height:1.7;">
                                El pedido <strong>#{order.id}</strong> ha sido pagado. Prepara el envío lo antes posible
                                y márcalo como <em>en preparación</em> desde tu panel de vendedor.
                            </p>

                            <!-- PRODUCTOS -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px; border:1px solid #e8e8e8; border-radius:6px; overflow:hidden;">
                                <tr style="background:#f5f5f5;">
                                    <td style="padding:8px 16px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#888;">Producto</td>
                                    <td style="padding:8px 16px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#888; text-align:center;">Ud.</td>
                                    <td style="padding:8px 16px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#888; text-align:right;">Total</td>
                                </tr>
                                {products_rows}
                            </table>

                            <!-- DIRECCIÓN -->
                            <p style="margin:0 0 8px; color:#888888; font-size:11px; letter-spacing:2px; text-transform:uppercase;">
                                Dirección de envío
                            </p>
                            <p style="margin:0 0 28px; color:#444444; font-size:14px; line-height:1.8; padding:16px; background:#fafafa; border-radius:6px; border:1px solid #e8e8e8;">
                                {address_html}
                            </p>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{os.getenv('FRONTEND_URL')}seller/orders" style="display:inline-block; background-color:#1a1a1a; color:#f0c040; text-decoration:none; font-size:14px; font-weight:700; padding:14px 40px; border-radius:4px; letter-spacing:2px; text-transform:uppercase; font-family:'Courier New', Courier, monospace;">
                                            Ver pedido →
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
        f"Hola {seller.store_name},\n\n"
        f"El pedido #{order.id} ha sido pagado. Prepara el envío lo antes posible.\n\n"
        f"Dirección de envío:\n{address.full_name}\n{address.address}\n{address.city}, {address.country}\n\n"
        f"Panel de vendedor: {os.getenv('FRONTEND_URL')}seller/orders\n\n"
        "Equipo Playback"
    )

    return msg

  
def build_order_confirmation_buyer_email(user, order):

    address = order.shipping_address
    address_html = (
        f"{address.full_name}<br>{address.address}<br>{address.city}, {address.country}"
        if address else "—"
    )

    products_rows = "".join([
        f"""
        <tr>
            <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0;">
                <span style="color:#333333; font-size:14px;">{d.product.name.get('es')}</span>
            </td>
            <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; text-align:center; color:#333; font-size:14px;">
                x{d.quantity}
            </td>
            <td style="padding:10px 16px; border-bottom:1px solid #f0f0f0; text-align:right; color:#333; font-size:14px;">
                {(d.product.price * (1 - (d.product.discount or 0) / 100) * d.quantity):.2f} €
            </td>
        </tr>
        """
        for d in order.order_details
    ])

    msg = Message(
        subject=f"▶ Pedido #{order.id} confirmado — gracias por tu compra",
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
                                Confirmación de pedido
                            </p>
                            <h2 style="margin:0 0 16px; color:#1a1a1a; font-size:22px; font-weight:700; font-family:'Courier New', Courier, monospace;">
                                Hola, {user.name}
                            </h2>
                            <p style="margin:0 0 28px; color:#444444; font-size:15px; line-height:1.7;">
                                Tu pago ha sido confirmado. El pedido <strong>#{order.id}</strong> ya está
                                en manos del vendedor y pronto estará en camino.
                            </p>

                            <!-- PRODUCTOS -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px; border:1px solid #e8e8e8; border-radius:6px; overflow:hidden;">
                                <tr style="background:#f5f5f5;">
                                    <td style="padding:8px 16px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#888;">Producto</td>
                                    <td style="padding:8px 16px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#888; text-align:center;">Ud.</td>
                                    <td style="padding:8px 16px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#888; text-align:right;">Total</td>
                                </tr>
                                {products_rows}
                            </table>

                            <!-- DESGLOSE -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                <tr>
                                    <td style="padding:4px 0; color:#888888; font-size:13px;">Subtotal</td>
                                    <td style="padding:4px 0; color:#888888; font-size:13px; text-align:right;">{order.subtotal:.2f} €</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 0; color:#888888; font-size:13px;">Gastos de envío</td>
                                    <td style="padding:4px 0; color:#888888; font-size:13px; text-align:right;">{order.shipping_cost:.2f} €</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0 4px; color:#1a1a1a; font-size:15px; font-weight:700; border-top:1px solid #e8e8e8;">Total pagado</td>
                                    <td style="padding:12px 0 4px; color:#1a1a1a; font-size:15px; font-weight:700; text-align:right; border-top:1px solid #e8e8e8;">{order.total_price:.2f} €</td>
                                </tr>
                            </table>

                            <!-- DIRECCIÓN -->
                            <p style="margin:0 0 8px; color:#888888; font-size:11px; letter-spacing:2px; text-transform:uppercase;">
                                Dirección de envío
                            </p>
                            <p style="margin:0 0 28px; color:#444444; font-size:14px; line-height:1.8; padding:16px; background:#fafafa; border-radius:6px; border:1px solid #e8e8e8;">
                                {address_html}
                            </p>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{os.getenv('FRONTEND_URL')}orders" style="display:inline-block; background-color:#1a1a1a; color:#f0c040; text-decoration:none; font-size:14px; font-weight:700; padding:14px 40px; border-radius:4px; letter-spacing:2px; text-transform:uppercase; font-family:'Courier New', Courier, monospace;">
                                            Ver mis pedidos →
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
        f"Tu pedido #{order.id} ha sido confirmado y pagado.\n\n"
        f"Total: {order.total_price:.2f} €\n\n"
        f"Dirección de envío:\n{address.full_name}\n{address.address}\n{address.city}, {address.country}\n\n"
        f"Historial de pedidos: {os.getenv('FRONTEND_URL')}orders\n\n"
        "Equipo Playback"
    )

    return msg


def build_order_shipped_buyer_email(user, order, tracking_code, carrier_name):
    """Email al comprador cuando el vendedor marca el pedido como enviado."""

    address = order.shipping_address
    address_html = (
        f"{address.full_name}<br>{address.address}<br>{address.city}, {address.country}"
        if address else "—"
    )

    # URLs de seguimiento para las transportistas más comunes en España
    TRACKING_URLS = {
        "Correos": f"https://www.correos.es/ss/Satellite/site/pagina-inicio/sidioma=es_ES#tracking={tracking_code}",
        "SEUR":    f"https://www.seur.com/livetracking/?segOnlineIdentificador={tracking_code}",
        "MRW":     f"https://www.mrw.es/seguimiento_envios/MRW_resultados_consultas.asp?Numero={tracking_code}",
        "DHL":     f"https://www.dhl.com/es-es/home/tracking.html?tracking-id={tracking_code}",
        "GLS":     f"https://gls-group.eu/ES/es/seguimiento-de-envios?match={tracking_code}",
        "Nacex":   f"https://www.nacex.es/irSeguimiento.do?agencia_origen=&numero_albaran={tracking_code}",
        "UPS":     f"https://www.ups.com/track?loc=es_ES&tracknum={tracking_code}",
    }

    # Enlace directo al transportista o búsqueda en Google como fallback
    tracking_url = TRACKING_URLS.get(
        carrier_name,
        f"https://www.google.com/search?q={carrier_name}+seguimiento+{tracking_code}"
    )

    msg = Message(
        subject=f"▶ Tu pedido #{order.id} está en camino 🚚",
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
                                Pedido en camino
                            </p>
                            <h2 style="margin:0 0 16px; color:#1a1a1a; font-size:22px; font-weight:700; font-family:'Courier New', Courier, monospace;">
                                Hola, {user.name}
                            </h2>
                            <p style="margin:0 0 28px; color:#444444; font-size:15px; line-height:1.7;">
                                ¡Buenas noticias! El vendedor acaba de enviar tu pedido
                                <strong>#{order.id}</strong>. Puedes hacer seguimiento con los datos de abajo.
                            </p>

                            <!-- CÓDIGO DE SEGUIMIENTO -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px; border:1px solid #e8e8e8; border-radius:6px; overflow:hidden;">
                                <tr>
                                    <td colspan="2" style="padding:10px 16px; background-color:#1a1a1a;">
                                        <span style="color:#f0c040; font-size:11px; letter-spacing:2px; text-transform:uppercase; font-weight:700;">
                                            🚚 Información de seguimiento
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px; width:40%;">
                                        Transportista
                                    </td>
                                    <td style="padding:12px 16px; border-bottom:1px solid #f0f0f0; color:#1a1a1a; font-size:14px; font-weight:700;">
                                        {carrier_name}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 16px; background:#fafafa; color:#888888; font-size:12px; text-transform:uppercase; letter-spacing:1px;">
                                        Código de envío
                                    </td>
                                    <td style="padding:12px 16px; background:#fafafa; color:#1a1a1a; font-size:18px; font-weight:700; letter-spacing:3px; font-family:'Courier New', Courier, monospace;">
                                        {tracking_code}
                                    </td>
                                </tr>
                            </table>

                            <!-- DIRECCIÓN -->
                            <p style="margin:0 0 8px; color:#888888; font-size:11px; letter-spacing:2px; text-transform:uppercase;">
                                Dirección de entrega
                            </p>
                            <p style="margin:0 0 28px; color:#444444; font-size:14px; line-height:1.8; padding:16px; background:#fafafa; border-radius:6px; border:1px solid #e8e8e8;">
                                {address_html}
                            </p>

                            <!-- CTA SEGUIMIENTO -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                                <tr>
                                    <td align="center">
                                        <a href="{tracking_url}" style="display:inline-block; background-color:#1a1a1a; color:#f0c040; text-decoration:none; font-size:14px; font-weight:700; padding:14px 40px; border-radius:4px; letter-spacing:2px; text-transform:uppercase; font-family:'Courier New', Courier, monospace;">
                                            Seguir mi envío →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0; color:#aaaaaa; font-size:12px; line-height:1.6; text-align:center;">
                                También puedes consultar el estado de tu pedido desde tu cuenta en Playback.
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
        f"Tu pedido #{order.id} está en camino.\n\n"
        f"Transportista: {carrier_name}\n"
        f"Código de seguimiento: {tracking_code}\n\n"
        f"Seguimiento: {tracking_url}\n\n"
        f"Dirección de entrega:\n{address.full_name}\n{address.address}\n{address.city}, {address.country}\n\n"
        "Equipo Playback"
    )

    return msg