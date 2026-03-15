import { useTranslation } from "react-i18next";

const ProfileOrders = () => {
  const { t } = useTranslation();

  const orders = [
    { id: 1, date: "2026-02-01", total: "$120", status: "Enviado" },
    { id: 2, date: "2026-01-15", total: "$80",  status: "Entregado" }
  ];

  return (
    <div className="bg-main p-6 rounded-xl shadow border border-main">
      <h2 className="text-xl font-bold mb-6 text-main">{t("orders.title")}</h2>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-main">
            <th className="py-2 text-muted">ID</th>
            <th className="py-2 text-muted">{t("orders.date")}</th>
            <th className="py-2 text-muted">{t("checkout.total")}</th>
            <th className="py-2 text-muted">{t("orders.status")}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b border-main">
              <td className="py-2 text-main">{order.id}</td>
              <td className="py-2 text-main">{order.date}</td>
              <td className="py-2 text-main">{order.total}</td>
              <td className="py-2 text-main">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfileOrders;