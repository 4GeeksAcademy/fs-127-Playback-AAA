// Formulario de pago con Stripe PaymentElement

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const PaymentForm = ({ onSuccess }) => {

    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePay = async () => {

        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            redirect: "if_required", // evita redirección si no es necesaria
        });

        if (stripeError) {
            setError(stripeError.message);
            setLoading(false);
            return;
        }

        // Pago completado — el webhook actualizará el pedido
        onSuccess();
    };

    return (
        <div className="space-y-6">

            <PaymentElement />

            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
                onClick={handlePay}
                disabled={loading || !stripe}
                className="bg-violet-600 hover:bg-violet-700 text-white w-full py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
                {loading ? "Procesando pago..." : "Pagar ahora"}
            </button>

            <p className="text-xs text-center text-stone-400">
                Pago seguro gestionado por Stripe
            </p>

        </div>
    );
};

export default PaymentForm;