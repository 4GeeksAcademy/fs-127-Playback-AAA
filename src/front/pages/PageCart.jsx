import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import orderServices from "../services/orderService";
import { useTranslation } from "react-i18next";
import { ProductPrice } from "../components/Common/ProductPrice";
import OrderSummary from "../components/Checkout/OrderSummary";
import { X, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export const PageCart = () => {

  const { store, dispatch } = useGlobalReducer();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

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
  }, [store.cart]);

  const showToast = (type) => {
    setToast(type);
    setTimeout(() => setToast(null), 2000);
  };

  const handleRemove = async (productId) => {
    const token = store.token || localStorage.getItem("token");
    await orderServices.removeProductFromCart(token, productId);
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

    if (delta > 0 && item.stock != null && item.quantity >= item.stock) {
      showToast("sin_stock");
      return;
    }

    const token = store.token || localStorage.getItem("token");
    await orderServices.addProductToCart(token, productId, delta);
    setCart(cart.map(p => p.id === productId ? { ...p, quantity: p.quantity + delta } : p));
    dispatch({ type: "cart_add", payload: { id: productId, quantity: delta } });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">

      {toast && (
        <div className={`fixed bottom-6 right-6 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${toast === "sin_stock" ? "bg-red-600" : "bg-stone-900"}`}>
          {toast === "sin_stock" ? <X size={15} /> : <ShoppingCart size={15} />}
          {toast === "sin_stock" ? "No hay más stock disponible" : "Producto añadido a tu cesta"}
        </div>
      )}

      <h1 className="text-3xl font-semibold mb-10">Carrito</h1>

      {cart.length === 0 && (
        <p className="text-stone-400">Tu carrito está vacío</p>
      )}

      {cart.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* PRODUCTOS */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => {
              const name = item.name?.[i18n.language] || item.name?.es || item.name?.en;
              const priceWithDiscount = item.price * (1 - (item.discount || 0) / 100);
              const lineTotal = priceWithDiscount * item.quantity;
              const enLimite = item.stock != null && item.quantity >= item.stock;

              return (
                <div key={item.id} className="flex justify-between items-center border-b pb-6">
                  <div className="flex gap-5 items-center">
                    <img src={item.image_url} alt={name} className="w-24 h-24 object-cover rounded" />
                    <div className="space-y-1">
                      <Link to={`/product/${item.id}`} className="font-medium text-stone-900 hover:underline">
                        {name}
                      </Link>
                      <ProductPrice price={item.price} discount={item.discount} />
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => handleQuantity(item.id, -1)} className="w-7 h-7 border rounded flex items-center justify-center text-stone-600 hover:bg-stone-100">−</button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => handleQuantity(item.id, 1)} disabled={enLimite} className="w-7 h-7 border rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                        <button onClick={() => handleRemove(item.id)} className="text-sm text-red-500 hover:underline ml-2">Eliminar</button>
                      </div>
                      {enLimite && (
                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                          <X size={11} />
                          Stock máximo alcanzado
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-stone-400">Subtotal</p>
                    <p className="font-semibold text-stone-900">{lineTotal.toFixed(2)} €</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RESUMEN */}
          <OrderSummary cart={cart} step="cart" onContinue={() => navigate("/checkout")} />

        </div>
      )}

    </div>
  );
};