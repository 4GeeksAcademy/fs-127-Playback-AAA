import React from "react";

const ProfileOrders = () => {
  const orders = [
    { id: 1, date: "2026-02-01", total: "$120", status: "Enviado" },
    { id: 2, date: "2026-01-15", total: "$80", status: "Entregado" }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-6">Mis Pedidos</h2>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">ID</th>
            <th className="py-2">Fecha</th>
            <th className="py-2">Total</th>
            <th className="py-2">Estado</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b">
              <td className="py-2">{order.id}</td>
              <td className="py-2">{order.date}</td>
              <td className="py-2">{order.total}</td>
              <td className="py-2">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfileOrders;