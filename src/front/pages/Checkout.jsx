import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { AlertCircle, X } from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import addressService from "../services/addressService";
import orderServices from "../services/orderService";
import paymentService from "../services/paymentService";
import AddressSelector from "../components/Checkout/AddressSelector";
import OrderSummary from "../components/Checkout/OrderSummary";
import PaymentForm from "../components/Checkout/PaymentForm";
import CheckoutSuccess from "../components/Checkout/CheckoutSuccess";

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

    const [toast, setToast] = useState(null);

    const [couponInput, setCouponInput] = useState("");
    const [coupon, setCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState(null); // el código validado para enviar al backend
    const [couponError, setCouponError] = useState("");
    const [couponLoading, setCouponLoading] = useState(false);

    const showToast = (msg, type = "error") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const token = store.token || localStorage.getItem("token");
        if (!token) return;

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

    const handleApplyCoupon = async () => {
        const token = store.token || localStorage.getItem("token");
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        setCouponError("");
        const [data, error] = await orderServices.applyCoupon(token, couponInput);
        setCouponLoading(false);
        if (error) {
            setCouponError("Código inválido o expirado");
            setCoupon(null);
            setCouponCode(null);
            return;
        }
        setCoupon(data);
        setCouponCode(couponInput.trim().toUpperCase());
    };

    const handleCheckout = async () => {
        if (!shippingAddress || !billingAddress) {
            showToast("Selecciona dirección de envío y facturación");
            return;
        }

        const token = store.token || localStorage.getItem("token");
        setLoading(true);

        const [orderData, orderError] = await orderServices.checkout(token, shippingAddress, billingAddress, couponCode);
        if (orderError) {
            showToast(orderError);
            setLoading(false);
            return;
        }

        const [paymentData, paymentError] = await paymentService.createPaymentIntent(token, orderData.order_id);
        if (paymentError) {
            showToast(paymentError);
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

            {toast && (
                <div className={`fixed bottom-6 right-6 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${toast.type === "error" ? "bg-red-600" : "bg-stone-900"}`}>
                    <AlertCircle size={15} />
                    {toast.msg}
                </div>
            )}

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

                        {/* CUPÓN */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-stone-700 mb-2">¿Tienes un código de descuento?</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponInput}
                                    onChange={(e) => {
                                        setCouponInput(e.target.value);
                                        setCouponError("");
                                        setCoupon(null);
                                        setCouponCode(null);
                                    }}
                                    placeholder="Introduce tu código"
                                    className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                                />
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading}
                                    className="bg-stone-900 text-white text-sm px-4 py-2 rounded hover:bg-stone-700 transition disabled:opacity-50"
                                >
                                    {couponLoading ? "..." : "Aplicar"}
                                </button>
                            </div>
                            {couponError && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <X size={11} />
                                    {couponError}
                                </p>
                            )}
                            {coupon && (
                                <p className="text-xs text-green-600 mt-1">
                                    Cupón aplicado: {coupon.type === "percentage" ? `-${coupon.value}%` : coupon.type === "fixed" ? `-${coupon.value} €` : "Envío gratis"}
                                </p>
                            )}
                        </div>
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
                coupon={coupon}
            />

        </div>
    );
};