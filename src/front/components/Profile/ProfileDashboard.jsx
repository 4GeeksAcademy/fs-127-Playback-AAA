import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import orderService from "../../services/orderService";

const StatCard = ({ value, label }) => (
  <div className="bg-main rounded-xl text-center border-main border px-2 py-3">
    <p className="text-main font-medium text-lg">{value}</p>
    <p className="text-muted text-xs mt-0.5">{label}</p>
  </div>
);

const OrderRow = ({ order }) => {
  const statusMap = {
    delivered: { label: "Entregado", bg: "#EAF3DE", color: "#3B6D11" },
    shipped: { label: "Enviado", bg: "#EEEDFE", color: "#534AB7" },
    paid: { label: "Pagado", bg: "#E6F1FB", color: "#185FA5" },
    pending: { label: "Pendiente", bg: "#FAEEDA", color: "#633806" },
    cancelled: { label: "Cancelado", bg: "#FCEBEB", color: "#A32D2D" },
  };
  const s = statusMap[order.status] || statusMap["pending"];
  return (
    <div className="flex justify-between items-center py-2 border-b border-main text-sm">
      <div className="truncate">
        <p className="font-medium truncate">{order.order_number || `ORD-${order.id}`}</p>
      </div>
      <span
        style={{
          fontSize: "10px",
          padding: "3px 8px",
          borderRadius: "10px",
          background: s.bg,
          color: s.color,
          flexShrink: 0,
          marginLeft: "10px",
        }}
      >
        {s.label}
      </span>
    </div>
  );
};

const QuickLink = ({ icon, title, desc, href }) => (
  <a href={href} className="block no-underline">
    <div className="bg-main border border-main rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-colors hover:border-violet-600">
      <div className="w-10 h-10 rounded-lg bg-subtle flex items-center justify-center text-main text-xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-main font-medium text-sm mb-0.5">{title}</p>
        <p className="text-muted text-xs">{desc}</p>
      </div>
    </div>
  </a>
);

const ProfileDashboard = ({ setActiveTab }) => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = store.token || localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    orderService.getMyOrders(token).then(([data]) => {
      if (data) setOrders(data);
      setLoading(false);
    });
  }, []);

  const user = store.user || {};
  const profileFields = [
    { label: "Nombre y email", done: !!(user.name && user.email) },
    { label: "Foto de perfil", done: !!user.image_url },
    { label: "Contraseña", done: true },
    { label: "Dirección", done: !!user.address },
    { label: "Teléfono", done: !!user.phone },
    { label: "Preferencias", done: !!user.preferences },
  ];
  const completedCount = profileFields.filter((f) => f.done).length;
  const completionPct = Math.round((completedCount / profileFields.length) * 100);
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Bienvenida ── */}
      <div className="pb-2">
        <p className="text-main text-lg font-semibold">
          Hola, {user.name?.split(" ")[0] || "de nuevo"} 👋
        </p>
        <p className="text-muted text-xs mt-0.5">
          Aquí tienes un resumen de tu actividad
        </p>
      </div>

      {/* ── Pedidos recientes ── */}
      <div className="bg-main border border-main rounded-xl p-4">
        <p className="text-muted text-xs font-medium mb-2 uppercase tracking-wide">
          {t("orders.recent")}
        </p>
        {loading ? (
          <p className="text-muted text-sm text-center py-4">Cargando…</p>
        ) : recentOrders.length === 0 ? (
          <p className="text-muted text-sm text-center py-4">{t("orders.empty")}</p>
        ) : (
          <>
            {recentOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
            <button
              onClick={() => setActiveTab("orders")}
              className="w-full text-center mt-2 text-sm text-main bg-none border-none cursor-pointer hover:underline"
            >
              {t("orders.viewAll")} →
            </button>
          </>
        )}
      </div>

      {/* ── Ayuda y soporte ── */}
      <div>
        <p className="text-muted text-xs font-medium uppercase tracking-wide mb-2">
          Ayuda y soporte
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">

          <QuickLink
            icon="✉️"
            title="Contactar con soporte"
            desc="Te respondemos en 24-48h"
            href="/contact"
            className="center"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;