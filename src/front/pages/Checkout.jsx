import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import useGlobalReducer from "../hooks/useGlobalReducer";
import addressService from "../services/addressService";
import orderServices from "../services/orderService";
import paymentService from "../services/paymentService";
import AddressSelector from "../components/Checkout/AddressSelector";
import OrderSummary from "../components/Checkout/OrderSummary";
import PaymentForm from "../components/Checkout/PaymentForm";
import CheckoutSuccess from "../components/Checkout/CheckoutSuccess";

// Inicializa Stripe fuera del componente para evitar recrearlo en cada render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const Checkout = () => {

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [cart, setCart] = useState([]);
    const [shippingAddress, setShippingAddress] = useState(null);
    const [billingAddress, setBillingAddress] = useState(null);
    const [sameAsBilling, setSameAsBilling] = useState(true);
    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [step, setStep] = useState("addresses"); // "addresses" | "payment" | "success"

    useEffect(() => {
        const token = store.token || localStorage.getItem("token");
        if (!token) return;

        // Carga direcciones y carrito en paralelo
        Promise.all([
            addressService.getAddresses(token),
            orderServices.getCart(token)
        ]).then(([[addressData], [cartData]]) => {

            if (addressData && addressData.length > 0) {
                setAddresses(addressData);
                setShippingAddress(addressData[0].id);
                setBillingAddress(addressData[0].id);
            }

            if (cartData) setCart(cartData.products || []);
        });
    }, []);

    const handleShippingSelect = (id) => {
        setShippingAddress(id);
        if (sameAsBilling) setBillingAddress(id);
    };

    const handleSameAsBilling = (e) => {
        setSameAsBilling(e.target.checked);
        if (e.target.checked) setBillingAddress(shippingAddress);
    };

    const handleAddressCreated = (newAddress) => {
        const updated = [...addresses, newAddress];
        setAddresses(updated);
        if (!shippingAddress) {
            setShippingAddress(newAddress.id);
            setBillingAddress(newAddress.id);
        }
    };

    // Paso 1 — guardar direcciones, calcular totales y crear PaymentIntent
    const handleCheckout = async () => {

        if (!shippingAddress || !billingAddress) {
            alert("Selecciona dirección de envío y facturación");
            return;
        }

        const token = store.token || localStorage.getItem("token");
        setLoading(true);

        // Guarda direcciones y calcula totales
        const [orderData, orderError] = await orderServices.checkout(token, shippingAddress, billingAddress);
        if (orderError) {
            alert(orderError);
            setLoading(false);
            return;
        }

        // Crea el PaymentIntent y obtiene el clientSecret
        const [paymentData, paymentError] = await paymentService.createPaymentIntent(token, orderData.order_id);
        if (paymentError) {
            alert(paymentError);
            setLoading(false);
            return;
        }

        setClientSecret(paymentData.client_secret);
        setStep("payment");
        setLoading(false);
    };

    const handleSuccess = () => {
        dispatch({ type: "set_cart", payload: [] });
        setStep("success");
        setTimeout(() => navigate("/orders"), 3000);
    };

    if (step === "success") return <CheckoutSuccess />;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">

            {/* COLUMNA IZQUIERDA */}
            <div>
                <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

                {step === "addresses" && (
                    <>
                        <AddressSelector
                            title="Dirección de envío"
                            addresses={addresses}
                            selected={shippingAddress}
                            onSelect={handleShippingSelect}
                            onAddressCreated={handleAddressCreated}
                        />

                        <label className="flex items-center gap-2 mb-6 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sameAsBilling}
                                onChange={handleSameAsBilling}
                                className="accent-violet-600 w-4 h-4"
                            />
                            <span className="text-sm text-stone-600">
                                Usar la misma dirección para facturación
                            </span>
                        </label>

                        {!sameAsBilling && (
                            <AddressSelector
                                title="Dirección de facturación"
                                addresses={addresses}
                                selected={billingAddress}
                                onSelect={setBillingAddress}
                                onAddressCreated={handleAddressCreated}
                            />
                        )}
                    </>
                )}

                {step === "payment" && clientSecret && (
                    <div>
                        <h2 className="text-lg font-medium mb-6">Introduce tu método de pago</h2>
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <PaymentForm onSuccess={handleSuccess} />
                        </Elements>
                    </div>
                )}
            </div>

            {/* COLUMNA DERECHA */}
            <OrderSummary
                step={step}
                loading={loading}
                onContinue={handleCheckout}
                cart={cart}
            />

        </div>
    );
};