import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Clock,
  CreditCard,
  CheckCircle,
  Package,
  Truck,
  PackageCheck,
  XCircle,
  MapPin,
  Receipt,
  X,
  Star,
  AlertTriangle,
} from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import orderService from "../services/orderService";
import { ReviewForm } from "../components/Common/ReviewForm";
import IncidentForm from "../components/Profile/IncidentForm";

export const MyOrders = () => {
  const { store } = useGlobalReducer();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [incidentOpen, setIncidentOpen] = useState(false);

  const [reviewed, setReviewed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("reviewed_products") || "{}");
    } catch {
      return {};
    }
  });

  const markReviewed = (key) => {
    setReviewed((prev) => {
      const next = { ...prev, [key]: true };
      localStorage.setItem("reviewed_products", JSON.stringify(next));
      return next;
    });
  };

  // Nombre del producto — el backend devuelve {"es": "...", "en": "..."}
  const getProductName = (name) => {
    if (!name) return "";
    if (typeof name === "string") return name;
    return (
      name[i18n.language] ||
      name[i18n.language?.split("-")[0]] ||
      name.es ||
      name.en ||
      ""
    );
  };

  useEffect(() => {
    const token = store.token || localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    orderService.getMyOrders(token).then(([data]) => {
      if (data && data.length > 0) setOrder(data[0]);
      setLoading(false);
    });
  }, []);

  const STATUS_CONFIG = {
    pending: {
      label: "Pendiente",
      color: "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400",
      icon: Clock,
    },
    paid: {
      label: "Pagado",
      color: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
      icon: CreditCard,
    },
    confirmed: {
      label: "Confirmado",
      color:
        "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400",
      icon: CheckCircle,
    },
    processing: {
      label: "En preparación",
      color:
        "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
      icon: Package,
    },
    shipped: {
      label: "Enviado",
      color:
        "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
      icon: Truck,
    },
    delivered: {
      label: "Entregado",
      color:
        "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
      icon: PackageCheck,
    },
    cancelled: {
      label: "Cancelado",
      color: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",
      icon: XCircle,
    },
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted text-sm">Cargando tu pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted mb-4">No encontramos ningún pedido.</p>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-violet-600 hover:text-violet-500 transition-colors"
        >
          Explorar productos
        </button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-600",
    icon: Clock,
  };
  const StatusIcon = cfg.icon;

  const subtotal = order.products.reduce((acc, p) => {
    const price = p.price * (1 - (p.discount || 0) / 100);
    return acc + price * p.quantity;
  }, 0);
  const shipping = parseFloat(order.shipping_cost ?? 0);
  const total = parseFloat(order.total_price);

  const userName = store.user?.name || store.user?.username || "";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* ── HERO ── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 mb-4">
          <CheckCircle
            size={34}
            className="text-emerald-600 dark:text-emerald-400"
          />
        </div>
        <h1 className="text-2xl font-semibold text-main mb-1">
          {userName
            ? `¡Gracias por tu compra, ${userName}!`
            : "¡Gracias por tu compra!"}
        </h1>
        <p className="text-muted text-sm">
          Tu pedido ha sido recibido. Te avisaremos cuando esté en camino.
        </p>
      </div>

      {/* ── TARJETA DEL PEDIDO ── */}
      <div className="border border-violet-200 dark:border-violet-800 rounded-2xl overflow-hidden shadow-sm bg-main">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 bg-violet-50 dark:bg-violet-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center shrink-0">
              <Receipt
                size={16}
                className="text-violet-600 dark:text-violet-400"
              />
            </div>
            <div>
              <p className="font-semibold text-main text-sm">
                Pedido #{order.id}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {new Date(order.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}
          >
            <StatusIcon size={11} />
            {cfg.label}
          </span>
        </div>

        {/* Productos */}
        <div className="px-5 py-5 space-y-5">
          {order.products.map((product) => {
            const reviewKey = `${order.id}-${product.id}`;
            const alreadyReviewed = reviewed[reviewKey];
            const unitPrice = (
              product.price *
              (1 - (product.discount || 0) / 100)
            ).toFixed(2);
            const lineTotal = (
              product.price *
              (1 - (product.discount || 0) / 100) *
              product.quantity
            ).toFixed(2);

            return (
              <div key={product.id} className="flex gap-4 items-start">
                <img
                  src={product.image_url}
                  alt={getProductName(product.name)}
                  className="w-16 h-16 object-cover rounded-xl shrink-0 border border-main"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-main text-sm truncate">
                    {getProductName(product.name)}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {unitPrice} € × {product.quantity} ud.
                  </p>

                  {order.status === "delivered" && (
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {alreadyReviewed ? (
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={11} />
                          Valorado
                        </p>
                      ) : (
                        <button
                          onClick={() =>
                            setReviewing({
                              productId: product.id,
                              orderId: order.id,
                            })
                          }
                          className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-500 transition-colors"
                        >
                          <Star size={11} />
                          Valorar producto
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <p className="font-semibold text-main text-sm shrink-0">
                  {lineTotal} €
                </p>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-main mx-5" />

        {/* Totales + dirección */}
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Resumen de costes */}
          <div className="space-y-1.5 text-sm">
            <p className="font-semibold text-main mb-2 flex items-center gap-1.5">
              <Receipt size={13} className="text-muted" />
              Resumen
            </p>
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Envío</span>
              <span>
                {shipping === 0 ? "Gratis" : `${shipping.toFixed(2)} €`}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-main pt-1.5 border-t border-main">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Dirección de envío */}
          {order.shipping_address && (
            <div className="text-sm">
              <p className="font-semibold text-main mb-2 flex items-center gap-1.5">
                <MapPin size={13} className="text-muted" />
                Dirección de envío
              </p>
              <p className="text-muted">{order.shipping_address.full_name}</p>
              <p className="text-muted">{order.shipping_address.address}</p>
              <p className="text-muted">
                {order.shipping_address.city}
                {order.shipping_address.postal_code
                  ? `, ${order.shipping_address.postal_code}`
                  : ""}
              </p>
              <p className="text-muted">{order.shipping_address.country}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── CTAs ── */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => navigate("/profile?tab=orders")}
          className="text-sm text-violet-600 hover:text-violet-500 transition-colors"
        >
          Ver todos mis pedidos
        </button>
        <span className="text-muted hidden sm:block">·</span>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-muted hover:text-main transition-colors"
        >
          Seguir comprando
        </button>
      </div>

      {/* Modal incidencia */}
      {incidentOpen && (
        <IncidentForm
          orderId={order.id}
          onClose={() => setIncidentOpen(false)}
        />
      )}

      {/* Modal valoración */}
      {reviewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-main rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-main">
                Valorar producto
              </h2>
              <button
                onClick={() => setReviewing(null)}
                className="text-faint hover:text-main transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <ReviewForm
              productId={reviewing.productId}
              orderId={reviewing.orderId}
              onDone={() => {
                markReviewed(`${reviewing.orderId}-${reviewing.productId}`);
                setReviewing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
