import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import orderServices from "../services/orderService";
import { useTranslation } from "react-i18next";
import { ProductPrice } from "../components/Common/ProductPrice";
import OrderSummary from "../components/Checkout/OrderSummary";

export const PageCart = () => {

  const { store, dispatch } = useGlobalReducer();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  useEffect(() => {

    const token = store.token || localStorage.getItem("token");
    if (!token) return;

    orderServices.getCart(token).then(([data, error]) => {
      if (error) {
        console.error(error);
        return;
      }
      setCart(data.products || []);
    });

  }, []);

  const handleRemove = async (productId) => {
    const token = store.token || localStorage.getItem("token");

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/product/${productId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    setCart(cart.filter(p => p.id !== productId));
    dispatch({ type: "cart_remove", payload: { id: productId } });
  };

  const handleQuantity = async (productId, delta) => {
    const item = cart.find(p => p.id === productId);
    if (!item) return;

    if (item.quantity + delta <= 0) {
      handleRemove(productId);
      return;
    }

    const token = store.token || localStorage.getItem("token");

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/add-product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ product_id: productId, quantity: delta })
    });

    setCart(cart.map(p => p.id === productId ? { ...p, quantity: p.quantity + delta } : p));
    dispatch({ type: "cart_add", payload: { id: productId, quantity: delta } });
  };

  return (

    <div className="max-w-7xl mx-auto px-6 py-12">

      <h1 className="text-3xl font-semibold mb-10 text-main">
        {t("cart.title")}
      </h1>

      {cart.length === 0 && (
        <p className="text-faint">
          {t("cart.empty")}
        </p>
      )}

      {cart.length > 0 && (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* PRODUCTOS */}
          <div className="lg:col-span-2 space-y-6">

            {cart.map((item) => {

              const name =
                item.name?.[i18n.language] ||
                item.name?.es ||
                item.name?.en;

              const priceWithDiscount = item.price * (1 - (item.discount || 0) / 100);
              const lineTotal = priceWithDiscount * item.quantity;

              return (

                <div
                  key={item.id}
                  className="flex justify-between items-center border-b border-main pb-6"
                >

                  <div className="flex gap-5 items-center">

                    <img
                      src={item.image_url}
                      alt={name}
                      className="w-24 h-24 object-cover rounded"
                    />

                    <div className="space-y-1">

                      <h2 className="font-medium text-main">
                        {name}
                      </h2>

                      <ProductPrice price={item.price} discount={item.discount} />

                      {/* CANTIDAD */}
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleQuantity(item.id, -1)}
                          className="w-7 h-7 border border-main rounded flex items-center justify-center text-muted hover:bg-muted"
                        >
                          −
                        </button>
                        <span className="text-sm w-4 text-center text-main">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantity(item.id, 1)}
                          className="w-7 h-7 border border-main rounded flex items-center justify-center text-muted hover:bg-muted"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-sm text-red-500 hover:underline ml-2"
                        >
                          {t("cart.remove")}
                        </button>
                      </div>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-sm text-faint">
                      {t("checkout.subtotal")}
                    </p>

                    <p className="font-semibold text-main">
                      {lineTotal.toFixed(2)} €
                    </p>

                  </div>

                </div>

              );
            })}

          </div>

          {/* RESUMEN */}
          <OrderSummary
            cart={cart}
            step="cart"
            onContinue={() => navigate("/checkout")}
          />

        </div>

      )}

    </div>
  );
};