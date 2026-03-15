// Resumen del pedido con productos y totales desglosados

import { useTranslation } from "react-i18next";
import { ProductPrice } from "../Common/ProductPrice";

const OrderSummary = ({ step, loading, onContinue, cart, disabled }) => {

    const { i18n, t } = useTranslation();

    // Precio con descuento aplicado por producto — el price ya incluye IVA
    const subtotal = cart.reduce((acc, item) => {
        const priceWithDiscount = item.price * (1 - (item.discount || 0) / 100);
        return acc + priceWithDiscount * item.quantity;
    }, 0);

    // IVA ya incluido — extraemos cuánto del subtotal es IVA
    const tax = subtotal - (subtotal / 1.21);
    const shipping = 5;
    const total = subtotal + shipping;

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
                    <span>{shipping.toFixed(2)} €</span>
                </div>

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