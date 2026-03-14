import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useTranslation } from "react-i18next";

export const MyOrders = () => {

  const { store } = useGlobalReducer();
  const [orders, setOrders] = useState([]);
  const { i18n } = useTranslation();

  useEffect(() => {

    const token = store.token || localStorage.getItem("token");

    if (!token) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/my-orders`, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => setOrders(data));

  }, []);

  return (

    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-2xl font-semibold mb-8">
        Historial de pedidos
      </h1>

      {orders.length === 0 && (
        <p className="text-gray-500">
          No tienes pedidos todavía
        </p>
      )}

      <div className="space-y-10">

        {orders.map(order => (

          <div
            key={order.id}
            className="border rounded-xl bg-white shadow-sm"
          >

            {/* HEADER */}

            <div className="flex justify-between p-6 border-b bg-gray-50">

              <div>
                <p className="text-sm text-gray-500">
                  Pedido
                </p>
                <p className="font-semibold">
                  #{order.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Fecha
                </p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Estado
                </p>
                <p className="font-semibold capitalize">
                  {order.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Total
                </p>
                <p className="font-semibold">
                  {parseFloat(order.total_price).toFixed(2)} €
                </p>
              </div>

            </div>

            {/* PRODUCTOS */}

            <div className="p-6 space-y-6">

              {order.products.map(product => (

                <div
                  key={product.id}
                  className="flex gap-4 items-center"
                >

                  <img
                    src={product.image_url}
                    alt={product.name?.[i18n.language]}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div className="flex-1">

                    <p className="font-medium">
                      {product.name?.[i18n.language]}
                    </p>

                    <p className="text-sm text-gray-500">
                      <span className="text-sm text-gray-400"> {(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)} € / ud </span> X {product.quantity} Unidades
                    </p>

                  </div>

                  <p className="font-semibold">
                    {(product.price * (1 - (product.discount || 0) / 100) * product.quantity).toFixed(2)} €
                  </p>

                </div>

              ))}

            </div>

            <div className="px-6 pb-6 space-y-6">
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded flex items-center justify-center text-gray-400 text-4xl">
                  🚚
                </div>

                <div className="flex-1">
                  <p className="font-medium">Gastos de envío</p>
                  <p className="text-sm text-gray-500">
                    <span>{order.shipping_address.address} - {order.shipping_address.city} - {order.shipping_address.country}</span>
                    </p>
                </div>

                <p className="font-semibold">
                  {parseFloat(order.shipping_cost ?? 0).toFixed(2)} €
                </p>
              </div>
            </div>

            {/* DIRECCIONES */}

            <div className="grid md:grid-cols-2 gap-6 p-6 border-t bg-gray-50 text-sm">

              {order.shipping_address && (

                <div>

                  <p className="font-semibold mb-1">
                    Dirección de envío
                  </p>

                  <p>{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.address}</p>
                  <p>{order.shipping_address.city}</p>
                  <p>{order.shipping_address.country}</p>

                </div>

              )}

              {order.billing_address && (

                <div>

                  <p className="font-semibold mb-1">
                    Dirección de facturación
                  </p>

                  <p>{order.billing_address.full_name}</p>
                  <p>{order.billing_address.address}</p>
                  <p>{order.billing_address.city}</p>
                  <p>{order.billing_address.country}</p>

                </div>

              )}

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};