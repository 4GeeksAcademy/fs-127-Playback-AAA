// Resumen del pedido con productos y totales desglosados

import { useTranslation } from "react-i18next";
import { ProductPrice } from "../Common/ProductPrice";

// Misma lógica que el backend — país por defecto España (en el carrito aún no sabemos la dirección)
const calcularEnvio = (subtotal, cart, pais = "españa") => {
    const ENVIO_GRATIS_DESDE = 100;
    if (subtotal >= ENVIO_GRATIS_DESDE) return 0;

    const ESPAÑA = ["españa", "espana", "spain", "es", "esp"];
    if (!ESPAÑA.includes(pais.trim().toLowerCase())) return 15.00;

    const pesoTotal = cart.reduce((acc, item) => acc + (item.weight || 0) * item.quantity, 0);

    const tramos = [
        [1,        3.99],
        [5,        5.99],
        [10,       9.99],
        [Infinity, 14.99],
    ];

    for (const [limite, coste] of tramos) {
        if (pesoTotal <= limite) return coste;
    }
};

const OrderSummary = ({ step, loading, onContinue, cart, disabled, shippingCost, country, coupon }) => {

    const { i18n, t } = useTranslation();

    const subtotal = cart.reduce((acc, item) => {
        const priceWithDiscount = item.price * (1 - (item.discount || 0) / 100);
        return acc + priceWithDiscount * item.quantity;
    }, 0);

    // IVA ya incluido — extraemos cuánto del subtotal es IVA
    const tax = subtotal - (subtotal / 1.21);

    // Si el padre ya conoce el coste real (post-checkout), lo usa; si no, lo estima
    const shipping = shippingCost !== undefined
        ? shippingCost
        : calcularEnvio(subtotal, cart, country);

    // Aplicar cupón
    let discountAmount = 0;
    let shippingFinal = shipping;

    if (coupon) {
        if (coupon.type === "percentage") {
            discountAmount = subtotal * coupon.value / 100;
        } else if (coupon.type === "fixed") {
            discountAmount = Math.min(coupon.value, subtotal);
        } else if (coupon.type === "free_shipping") {
            shippingFinal = 0;
        }
    }

    const total = subtotal + shippingFinal - discountAmount;

    return (
        <div className="bg-main border border-main rounded-xl p-6 h-fit sticky top-6">

            <h2 className="text-lg font-semibold mb-6 text-main">{t("checkout.summary")}</h2>

            {/* PRODUCTOS */}
            {cart.length > 0 && (
                <div className="space-y-4 mb-6">
                    {cart.map(item => {

                        const name = item.name?.[i18n.language] || item.name?.es || item.name?.en;

                        return (
                            <div key={item.id} className="flex items-center gap-3">

                                <img
                                    src={item.image_url}
                                    alt={name}
                                    className="w-14 h-14 object-cover rounded-lg border border-main"
                                />

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-main truncate">{name}</p>
                                    <p className="text-xs text-faint">x{item.quantity}</p>
                                    <ProductPrice price={item.price} discount={item.discount} />
                                </div>

                                <p className="text-sm font-medium text-main whitespace-nowrap">
                                    {(item.price * (1 - (item.discount || 0) / 100) * item.quantity).toFixed(2)} €
                                </p>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* TOTALES */}
            <div className="border-t border-main pt-4 space-y-2 text-sm">

                <div className="flex justify-between text-muted">
                    <span>{t("checkout.subtotal")}</span>
                    <span>{subtotal.toFixed(2)} €</span>
                </div>

                <div className="flex justify-between text-muted">
                    <span>{t("checkout.tax")}</span>
                    <span>{tax.toFixed(2)} €</span>
                </div>

                <div className="flex justify-between text-muted">
                    <span>{t("checkout.shipping")}</span>
                    <span>
                        {shippingFinal === 0
                            ? <span className="text-emerald-600 font-medium">{t("checkout.freeShipping")}</span>
                            : `${shippingFinal.toFixed(2)} €`
                        }
                    </span>
                </div>

                {coupon && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                        <span>{t("checkout.discount")}</span>
                        <span>-{discountAmount.toFixed(2)} €</span>
                    </div>
                )}

                <div className="flex justify-between font-semibold text-main text-base border-t border-main pt-3 mt-2">
                    <span>{t("checkout.total")}</span>
                    <span>{total.toFixed(2)} €</span>
                </div>

            </div>

            {/* BOTÓN / MENSAJE */}
            <div className="mt-6">
                {step === "cart" && (
                    <button
                        onClick={onContinue}
                        disabled={cart.length === 0}
                        className="btn-primary w-full"
                    >
                        {t("checkout.goToPayment")}
                    </button>
                )}

                {step === "addresses" && (
                    <button
                        onClick={onContinue}
                        disabled={loading || cart.length === 0 || disabled}
                        className="btn-primary w-full"
                    >
                        {loading ? t("checkout.processing") : t("checkout.continueToPayment")}
                    </button>
                )}

                {step === "payment" && (
                    <p className="text-sm text-muted text-center">
                        {t("checkout.completePaymentLeft")}
                    </p>
                )}
            </div>

        </div>
    );
};

export default OrderSummary;