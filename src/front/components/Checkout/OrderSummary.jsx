// Resumen del pedido con productos y totales desglosados

import { useTranslation } from "react-i18next";
import { ProductPrice } from "../Common/ProductPrice";

const OrderSummary = ({ step, loading, onContinue, cart }) => {

    const { i18n } = useTranslation();

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
        <div className="bg-white border rounded-xl p-6 h-fit sticky top-6">

            <h2 className="text-lg font-semibold mb-6">Resumen del pedido</h2>

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
                                    className="w-14 h-14 object-cover rounded-lg border"
                                />

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-stone-800 truncate">{name}</p>
                                    <p className="text-xs text-stone-400">x{item.quantity}</p>
                                    <ProductPrice price={item.price} discount={item.discount} />
                                </div>

                                <p className="text-sm font-medium text-stone-800 whitespace-nowrap">
                                    {(item.price * (1 - (item.discount || 0) / 100) * item.quantity).toFixed(2)} €
                                </p>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* TOTALES */}
            <div className="border-t pt-4 space-y-2 text-sm">

                <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} €</span>
                </div>

                <div className="flex justify-between text-stone-500">
                    <span>IVA incluido (21%)</span>
                    <span>{tax.toFixed(2)} €</span>
                </div>

                <div className="flex justify-between text-stone-500">
                    <span>Envío</span>
                    <span>{shipping.toFixed(2)} €</span>
                </div>

                <div className="flex justify-between font-semibold text-stone-900 text-base border-t pt-3 mt-2">
                    <span>Total</span>
                    <span>{total.toFixed(2)} €</span>
                </div>

            </div>

			{/* BOTÓN / MENSAJE */}
			<div className="mt-6">
				{step === "cart" && (
					<button
						onClick={onContinue}
						disabled={cart.length === 0}
						className="bg-stone-900 hover:bg-stone-700 text-white w-full py-3 text-sm uppercase tracking-widest transition disabled:opacity-50"
					>
						Ir al pago
					</button>
				)}

				{step === "addresses" && (
					<button
						onClick={onContinue}
						disabled={loading || cart.length === 0}
						className="bg-violet-600 hover:bg-violet-700 text-white w-full py-3 rounded-lg font-medium transition disabled:opacity-50"
					>
						{loading ? "Procesando..." : "Continuar al pago"}
					</button>
				)}

				{step === "payment" && (
					<p className="text-sm text-stone-500 text-center">
						Completa el pago en el formulario de la izquierda.
					</p>
				)}
			</div>

        </div>
    );
};

export default OrderSummary;