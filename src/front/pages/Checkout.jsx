import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState } from "react";

export const Checkout = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [shippingData, setShippingData] = useState({
    name: "",
    address: "",
    city: "",
    postal: "",
  });

  const total = store.cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleChange = (e) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value,
    });
  };

  const handleConfirm = async () => {
    if (!shippingData.name || !shippingData.address) {
      alert("Completa los datos de envío");
      return;
    }

    setLoading(true);

    const orderPayload = {
      products: store.cart,
      total,
      shipping: shippingData,
    };

    console.log("Pedido listo para enviar:", orderPayload);

    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
      dispatch({ type: "cart_clear" });

      setTimeout(() => {
        navigate("/");
      }, 2500);
    }, 1500);
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-violet-600">
          ✅ Pago procesado correctamente
        </h2>
        <p className="text-stone-500">
          Redirigiendo al inicio...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-10">
        Checkout
      </h1>

      <div className="grid md:grid-cols-2 gap-10">

        {/* FORMULARIO ENVÍO */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Datos de envío
          </h2>

          <div className="flex flex-col gap-4">
            <input
              name="name"
              placeholder="Nombre completo"
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              name="address"
              placeholder="Dirección"
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              name="city"
              placeholder="Ciudad"
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              name="postal"
              placeholder="Código postal"
              onChange={handleChange}
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            Pago (Simulado)
          </h2>

          <div className="flex flex-col gap-4">
            <input
              placeholder="Número de tarjeta"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              placeholder="MM/AA"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              placeholder="CVC"
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* RESUMEN */}
        <div className="border rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-6">
            Resumen del pedido
          </h2>

          {store.cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between mb-3 text-sm"
            >
              <span>
                {item.quantity} x {item.name}
              </span>
              <span>
                {(item.quantity * item.price).toFixed(2)}€
              </span>
            </div>
          ))}

          <div className="border-t pt-4 mt-4 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{total.toFixed(2)}€</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl font-medium text-white
            bg-gradient-to-r from-violet-500 to-purple-600
            hover:from-violet-600 hover:to-purple-700
            shadow-md shadow-violet-200 dark:shadow-violet-900/30
            transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : "Pagar ahora"}
          </button>
        </div>

      </div>
    </div>
  );
};