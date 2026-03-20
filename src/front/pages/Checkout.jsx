import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
  const [couponCode, setCouponCode] = useState(null);
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
      orderServices.getCart(token),
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
      setCouponError(t("checkout.couponInvalid"));
      setCoupon(null);
      setCouponCode(null);
      return;
    }
    setCoupon(data);
    setCouponCode(couponInput.trim().toUpperCase());
  };

  const handleCheckout = async () => {
    if (!shippingAddress || !billingAddress) {
      showToast(t("checkout.selectAddress"));
      return;
    }

    const token = store.token || localStorage.getItem("token");
    setLoading(true);

    // ✅ Comprobación de stock antes de crear el pedido
    const [stockData, stockError] = await orderServices.validateStock(token);
    if (stockError || !stockData?.available) {
      const names = stockData?.items?.map((i) => i.title).join(", ");
      showToast(names
        ? t("checkout.stockUnavailable", { items: names })
        : t("checkout.stockError")
      );
      setLoading(false);
      return;
    }

  const [orderData, orderError] = await orderServices.checkout(
    // ... sin cambios
      token,
      shippingAddress,
      billingAddress,
      couponCode,
    );
    if (orderError) {
      showToast(orderError);
      setLoading(false);
      return;
    }

    const [paymentData, paymentError] =
      await paymentService.createPaymentIntent(token, orderData.order_id);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 text-white dark:text-stone-900 text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-600 dark:bg-red-500"
              : "bg-stone-900 dark:bg-stone-100"
          }`}
        >
          <AlertCircle size={15} />
          {toast.msg}
        </div>
      )}

      {/* COLUMNA IZQUIERDA */}
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-semibold mb-8 text-main">Checkout</h1>

        {step === "addresses" && (
          <>
            <AddressSelector
              title={t("checkout.shippingAddress")}
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
              <span className="text-sm text-muted">
                {t("checkout.sameAsBilling")}
              </span>
            </label>

            {!sameAsBilling && (
              <AddressSelector
                title={t("checkout.billingAddress")}
                addresses={addresses}
                selected={billingAddress}
                onSelect={setBillingAddress}
                onAddressCreated={handleAddressCreated}
              />
            )}

            {/* CUPÓN */}
            <div className="mb-6">
              <p className="text-sm font-medium text-main mb-2">
                {t("checkout.couponQuestion")}
              </p>
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
                  placeholder={t("checkout.couponPlaceholder")}
                  className="input flex-1"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="btn-primary px-4 text-sm disabled:opacity-50"
                >
                  {couponLoading ? "..." : t("checkout.couponApply")}
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <X size={11} />
                  {couponError}
                </p>
              )}
              {coupon && (
                <p className="text-xs text-emerald-600 mt-1">
                  {t("checkout.couponApplied")}:{" "}
                  {coupon.type === "percentage"
                    ? `-${coupon.value}%`
                    : coupon.type === "fixed"
                      ? `-${coupon.value} €`
                      : t("checkout.freeShipping")}
                </p>
              )}
            </div>
          </>
        )}

        {step === "payment" && clientSecret && (
          <div>
            <h2 className="text-lg font-medium mb-6 text-main">
              {t("checkout.enterPayment")}
            </h2>
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
        disabled={!shippingAddress || (!sameAsBilling && !billingAddress)}
        coupon={coupon}
      />
    </div>
  );
};
