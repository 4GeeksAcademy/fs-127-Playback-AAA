import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import orderService from "../services/orderService";

const StatCard = ({ value, label }) => (
  <div
    className="bg-main rounded-xl text-center"
    style={{
      border: "0.5px solid var(--border-main, #e5e7eb)",
      padding: "14px 8px",
    }}
  >
    <p style={{ fontSize: "22px", fontWeight: "500", color: "#534AB7" }}>
      {value}
    </p>
    <p
      style={{
        fontSize: "11px",
        color: "var(--color-muted, #6b7280)",
        marginTop: "2px",
      }}
    >
      {label}
    </p>
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "9px 0",
        borderBottom: "0.5px solid var(--border-main, #e5e7eb)",
        fontSize: "13px",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontWeight: "500",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {order.order_number || `ORD-${order.id}`}
        </p>
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
  <a href={href} style={{ textDecoration: "none", display: "block" }}>
    <div
      className="bg-main rounded-xl border border-main p-4 flex items-center gap-4 cursor-pointer"
      style={{ transition: "border-color 0.15s" }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "#EEEDFE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: "13px",
            fontWeight: "500",
            color: "var(--color-text-primary)",
            marginBottom: "2px",
          }}
        >
          {title}
        </p>
        <p style={{ fontSize: "11px", color: "var(--color-muted)" }}>{desc}</p>
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
  const completionPct = Math.round(
    (completedCount / profileFields.length) * 100,
  );
  const recentOrders = orders.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* ── Bienvenida ── */}
      <div style={{ padding: "4px 0 8px" }}>
        <p
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "var(--color-text-primary)",
          }}
        >
          Hola, {user.name?.split(" ")[0] || "de nuevo"} 👋
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "var(--color-muted)",
            marginTop: "2px",
          }}
        >
          Aquí tienes un resumen de tu actividad
        </p>
      </div>

      {/* ── Pedidos recientes ── */}
      <div
        className="bg-main rounded-xl"
        style={{
          border: "0.5px solid var(--border-main, #e5e7eb)",
          padding: "16px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: "500",
            color: "var(--color-muted)",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}
        >
          {t("orders.recent")}
        </p>
        {loading ? (
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-muted)",
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            Cargando…
          </p>
        ) : recentOrders.length === 0 ? (
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-muted)",
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            {t("orders.empty")}
          </p>
        ) : (
          <>
            {recentOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
            <button
              onClick={() => setActiveTab("orders")}
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                marginTop: "10px",
                fontSize: "12px",
                color: "#534AB7",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {t("orders.viewAll")} →
            </button>
          </>
        )}
      </div>

      {/* ── Ayuda y soporte ── */}
      <div>
        <p
          style={{
            fontSize: "12px",
            fontWeight: "500",
            color: "var(--color-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            marginBottom: "10px",
          }}
        >
          Ayuda y soporte
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickLink
            icon="❓"
            title="Preguntas frecuentes"
            desc="Envíos, devoluciones, pagos..."
            href="/faq"
          />
          <QuickLink
            icon="✉️"
            title="Contactar con soporte"
            desc="Te respondemos en 24-48h"
            href="/contact"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
