import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, CreditCard, CheckCircle, Package, Truck, PackageCheck, XCircle, Star } from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import orderService from "../services/orderService";
import { ReviewForm } from "../components/ReviewForm";

export const MyOrders = () => {

  const { store } = useGlobalReducer();
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [reviewing, setReviewing] = useState(null);
  const [reviewed, setReviewed] = useState({});

  useEffect(() => {
    const token = store.token || localStorage.getItem("token");
    if (!token) return;
    orderService.getMyOrders(token).then(([data]) => {
      if (data) setOrders(data);
    });
  }, []);

  const STATUS_CONFIG = {
    pending:    { label: t("dashboard.orders.status.pending"),    color: "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400",         icon: "Clock" },
    paid:       { label: t("dashboard.orders.status.paid"),       color: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",         icon: "CreditCard" },
    confirmed:  { label: t("dashboard.orders.status.confirmed"),  color: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400", icon: "CheckCircle" },
    processing: { label: t("dashboard.orders.status.processing"), color: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400", icon: "Package" },
    shipped:    { label: t("dashboard.orders.status.shipped"),    color: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400", icon: "Truck" },
    delivered:  { label: t("dashboard.orders.status.delivered"),  color: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",     icon: "PackageCheck" },
    cancelled:  { label: t("dashboard.orders.status.cancelled"),  color: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",             icon: "XCircle" },
  };

  const icons = { Clock, CreditCard, CheckCircle, Package, Truck, PackageCheck, XCircle };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-2xl font-semibold mb-8 text-main">
        {t("orders.title")}
      </h1>

      {orders.length === 0 && (
        <p className="text-muted">{t("orders.empty")}</p>
      )}

      <div className="space-y-10">
        {orders.map(order => (
          <div key={order.id} className="border border-main rounded-xl bg-main shadow-sm">

            {/* HEADER */}
            <div className="flex justify-between p-6 border-b border-main bg-subtle">
              <div>
                <p className="text-sm text-muted">{t("orders.order")}</p>
                <p className="font-semibold text-main">#{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted">{t("orders.date")}</p>
                <p className="font-semibold text-main">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">{t("orders.status")}</p>
                {(() => {
                  const cfg = STATUS_CONFIG[order.status] || {
                    label: order.status,
                    color: "bg-gray-100 dark:bg-gray-900 text-gray-600",
                    icon: "Clock",
                  };
                  const Icon = icons[cfg.icon];
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                  );
                })()}
              </div>
              <div>
                <p className="text-sm text-muted">{t("checkout.total")}</p>
                <p className="font-semibold text-main">
                  {parseFloat(order.total_price).toFixed(2)} €
                </p>
              </div>
            </div>

            {/* PRODUCTOS */}
            <div className="p-6 space-y-6">
              {order.products.map(product => (
                <div key={product.id}>

                  {/* Info del producto */}
                  <div className="flex gap-4 items-center">
                    <img
                      src={product.image_url}
                      alt={product.name?.[i18n.language]}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-main">
                        {product.name?.[i18n.language]}
                      </p>
                      <p className="text-sm text-muted">
                        <span className="text-faint">
                          {(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)} € / ud
                        </span>{" "}
                        × {product.quantity} {t("orders.units")}
                      </p>
                    </div>
                    <p className="font-semibold text-main">
                      {(product.price * (1 - (product.discount || 0) / 100) * product.quantity).toFixed(2)} €
                    </p>
                  </div>

                  {/* Botón valorar — solo si entregado y no valorado */}
                  {order.status === "delivered" && !reviewed[`${order.id}-${product.id}`] && reviewing?.productId !== product.id && (
                    <button
                      onClick={() => setReviewing({ productId: product.id, orderId: order.id })}
                      className="mt-2 flex items-center gap-1 text-xs text-violet-600 hover:underline"
                    >
                      <Star size={13} />
                      Valorar producto
                    </button>
                  )}

                  {/* Formulario de reseña inline */}
                  {reviewing?.productId === product.id && reviewing?.orderId === order.id && (
                    <div className="mt-3 border-t border-main pt-3">
                      <ReviewForm
                        productId={product.id}
                        orderId={order.id}
                        onDone={() => {
                          setReviewed(prev => ({ ...prev, [`${order.id}-${product.id}`]: true }));
                          setReviewing(null);
                        }}
                      />
                    </div>
                  )}

                  {/* Confirmación si ya valoró */}
                  {reviewed[`${order.id}-${product.id}`] && (
                    <p className="mt-2 text-xs text-emerald-600">✓ {t("review.successTitle")}</p>
                  )}

                </div>
              ))}
            </div>

            {/* ENVÍO */}
            <div className="px-6 pb-6 space-y-6">
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded flex items-center justify-center text-muted text-4xl">
                  🚚
                </div>
                <div className="flex-1">
                  <p className="font-medium text-main">{t("checkout.shipping")}</p>
                  <p className="text-sm text-muted">
                    {order.shipping_address.address} · {order.shipping_address.city} · {order.shipping_address.country}
                  </p>
                </div>
                <p className="font-semibold text-main">
                  {parseFloat(order.shipping_cost ?? 0).toFixed(2)} €
                </p>
              </div>
            </div>

            {/* DIRECCIONES */}
            <div className="grid md:grid-cols-2 gap-6 p-6 border-t border-main bg-subtle text-sm">
              {order.shipping_address && (
                <div>
                  <p className="font-semibold text-main mb-1">{t("checkout.shippingAddress")}</p>
                  <p className="text-muted">{order.shipping_address.full_name}</p>
                  <p className="text-muted">{order.shipping_address.address}</p>
                  <p className="text-muted">{order.shipping_address.city}</p>
                  <p className="text-muted">{order.shipping_address.country}</p>
                </div>
              )}
              {order.billing_address && (
                <div>
                  <p className="font-semibold text-main mb-1">{t("checkout.billingAddress")}</p>
                  <p className="text-muted">{order.billing_address.full_name}</p>
                  <p className="text-muted">{order.billing_address.address}</p>
                  <p className="text-muted">{order.billing_address.city}</p>
                  <p className="text-muted">{order.billing_address.country}</p>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};