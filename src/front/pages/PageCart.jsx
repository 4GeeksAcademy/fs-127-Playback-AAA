import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import orderServices from "../services/orderService";
import { useTranslation } from "react-i18next";

export const PageCart = () => {

  const { store } = useGlobalReducer();
  const { i18n } = useTranslation();
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
      headers: {
        Authorization: "Bearer " + token
      }
    });

    setCart(cart.filter(p => p.id !== productId));
  };

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (

    <div className="max-w-7xl mx-auto px-6 py-12">

      <h1 className="text-3xl font-semibold mb-10">
        Carrito
      </h1>

      {cart.length === 0 && (
        <p className="text-stone-400">
          Tu carrito está vacío
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

              const subtotal = item.price * item.quantity;

              return (

                <div
                  key={item.id}
                  className="flex justify-between items-center border-b pb-6"
                >

                  <div className="flex gap-5 items-center">

                    <img
                      src={item.image_url}
                      alt={name}
                      className="w-24 h-24 object-cover rounded"
                    />

                    <div className="space-y-1">

                      <h2 className="font-medium text-stone-900">
                        {name}
                      </h2>

                      <p className="text-sm text-stone-500">
                        {item.price} €
                      </p>

                      <p className="text-sm text-stone-400">
                        Cantidad: {item.quantity}
                      </p>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-sm text-stone-400">
                      Subtotal
                    </p>

                    <p className="font-semibold text-stone-900">
                      {subtotal.toFixed(2)} €
                    </p>

                  </div>

                </div>

              );
            })}

          </div>

          {/* RESUMEN */}
          <div className="border rounded-lg p-6 h-fit">

            <h2 className="text-lg font-semibold mb-6">
              Resumen del pedido
            </h2>

            <div className="flex justify-between text-sm mb-3">
              <span>Subtotal</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            <div className="flex justify-between text-sm mb-6">
              <span>Envío</span>
              <span>Gratis</span>
            </div>

            <div className="flex justify-between font-semibold text-lg border-t pt-4 mb-6">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-stone-900 text-white py-3 text-sm uppercase tracking-widest hover:bg-stone-700 transition"
            >
              Ir al pago
            </button>

          </div>

        </div>

      )}

    </div>
  );
};