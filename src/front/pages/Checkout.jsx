import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import addressService from "../services/addressService";

export const Checkout = () => {

  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const token = store.token || localStorage.getItem("token");

    if (!token) return;

    addressService.getAddresses(token).then(([data]) => {

      if (data) {
        setAddresses(data);
      }

    });

  }, []);

  const handleCheckout = async () => {

    if (!shippingAddress || !billingAddress) {
      alert("Selecciona dirección de envío y facturación");
      return;
    }

    const token = store.token || localStorage.getItem("token");

    setLoading(true);

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        shipping_address_id: shippingAddress,
        billing_address_id: billingAddress,
        payment_method: paymentMethod
      })
    });

    if (res.ok) {

      // vaciar carrito
      dispatch({
        type: "set_cart",
        payload: []
      });

      setTimeout(() => {

        navigate("/orders");

      }, 1500);

    } else {

      setLoading(false);
      alert("Error al realizar el pedido");

    }

  };

  return (

    <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">

      {/* COLUMNA IZQUIERDA */}

      <div>

        <h1 className="text-2xl font-semibold mb-8">
          Checkout
        </h1>

        {/* DIRECCIÓN ENVÍO */}

        <div className="mb-8">

          <h2 className="text-lg font-medium mb-4">
            Dirección de envío
          </h2>

          {addresses.map(address => (

            <div
              key={address.id}
              onClick={() => setShippingAddress(address.id)}
              className={`border rounded-lg p-4 mb-3 cursor-pointer transition
              ${shippingAddress === address.id ? "border-violet-600 bg-violet-50" : "border-gray-200"}
              `}
            >

              <p className="font-medium">{address.full_name}</p>
              <p>{address.address}</p>
              <p>{address.city}</p>
              <p>{address.country}</p>

            </div>

          ))}

        </div>

        {/* DIRECCIÓN FACTURACIÓN */}

        <div className="mb-8">

          <h2 className="text-lg font-medium mb-4">
            Dirección de facturación
          </h2>

          {addresses.map(address => (

            <div
              key={address.id}
              onClick={() => setBillingAddress(address.id)}
              className={`border rounded-lg p-4 mb-3 cursor-pointer transition
              ${billingAddress === address.id ? "border-violet-600 bg-violet-50" : "border-gray-200"}
              `}
            >

              <p className="font-medium">{address.full_name}</p>
              <p>{address.address}</p>
              <p>{address.city}</p>
              <p>{address.country}</p>

            </div>

          ))}

        </div>

        {/* MÉTODO DE PAGO */}

        <div className="mb-8">

          <h2 className="text-lg font-medium mb-4">
            Método de pago
          </h2>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="border rounded-lg p-3 w-full"
          >

            <option value="credit_card">
              Tarjeta de crédito
            </option>

            <option value="bizum">
              Bizum
            </option>

          </select>

        </div>

      </div>

      {/* RESUMEN PEDIDO */}

      <div className="bg-white border rounded-xl p-6 h-fit">

        <h2 className="text-lg font-semibold mb-6">
          Resumen del pedido
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          Los productos de tu carrito se procesarán al confirmar el pedido.
        </p>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-white w-full py-3 rounded-lg font-medium transition"
        >

          {loading ? "Procesando pedido..." : "Confirmar pedido"}

        </button>

      </div>

    </div>

  );

};