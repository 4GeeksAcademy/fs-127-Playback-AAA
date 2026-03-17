import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import IncidentForm from "./IncidentForm";
import useGlobalReducer from "../hooks/useGlobalReducer";

const ProfileOrders = () => {

  const { store } = useGlobalReducer();
  const { t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {

    const token = store.token || localStorage.getItem("token");

    if (!token) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/my-orders`, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error("Error cargando pedidos:", err));

  }, []);

  return (

    <div className="bg-main p-6 rounded-xl shadow border border-main">

      <h2 className="text-xl font-bold mb-6 text-main">
        {t("orders.title")}
      </h2>

      <table className="w-full text-left text-sm">

        <thead>

          <tr className="border-b border-main">

            <th className="py-2 text-muted">ID</th>
            <th className="py-2 text-muted">{t("orders.date")}</th>
            <th className="py-2 text-muted">{t("checkout.total")}</th>
            <th className="py-2 text-muted">{t("orders.status")}</th>
            <th className="py-2 text-muted">Acciones</th>

          </tr>

        </thead>

        <tbody>

          {orders.map(order => (

            <tr key={order.id} className="border-b border-main">

              <td className="py-2 text-main">
                {order.id}
              </td>

              <td className="py-2 text-main">
                {new Date(order.created_at).toLocaleDateString()}
              </td>

              <td className="py-2 text-main">
                {order.total_price} €
              </td>

              <td className="py-2 text-main capitalize">
                {order.status}
              </td>

              <td className="py-2">

                {order.status === "delivered" && (

                  <button
                    onClick={() => setSelectedOrder(order.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Abrir incidencia
                  </button>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {selectedOrder && (

        <IncidentForm
          orderId={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />

      )}

    </div>

  );

};

export default ProfileOrders;