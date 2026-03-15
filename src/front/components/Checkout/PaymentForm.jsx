// Formulario de pago con Stripe PaymentElement
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const PaymentForm = ({ onSuccess }) => {

    const { t } = useTranslation();
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
                className="btn-primary w-full"
            >
                {loading ? t("checkout.processing") : t("checkout.payNow")}
            </button>

            <p className="text-xs text-center text-muted">
                {t("checkout.securePayment")}
            </p>

        </div>
    );
};

export default PaymentForm;