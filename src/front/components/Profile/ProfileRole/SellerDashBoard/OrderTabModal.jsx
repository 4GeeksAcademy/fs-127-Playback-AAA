import { useState } from "react";
import { useTranslation } from "react-i18next";
import orderService from "../../../../services/orderService";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";

const STATUS_STYLE = {
  pending:    "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  paid:       "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400",
  confirmed:  "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  processing: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  shipped:    "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400",
  delivered:  "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
  cancelled:  "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const ALL_STATUSES = ["pending", "paid", "confirmed", "processing", "shipped", "delivered", "cancelled"];

// ── Dirección ─────────────────────────────────────────────────────────────────
const AddressBlock = ({ label, address }) => {
  const { t } = useTranslation();
  if (!address) {
    return (
      <div>
        <p className="text-xs text-faint mb-1">{label}</p>
        <p className="text-sm text-faint italic">{t("dashboard.orders.noAddress")}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs text-faint mb-1">{label}</p>
      <p className="text-sm font-medium text-main">{address.full_name}</p>
      <p className="text-sm text-sub">{address.address}</p>
      <p className="text-sm text-sub">
        {address.postal_code} {address.city}
        {address.province ? `, ${address.province}` : ""}
      </p>
      <p className="text-sm text-sub">{address.country}</p>
      {address.phone && <p className="text-sm text-muted mt-1">📞 {address.phone}</p>}
    </div>
  );
};

// ── MODAL ─────────────────────────────────────────────────────────────────────
const OrderTabModal = ({ order, onClose, onUpdated }) => {
  const { t } = useTranslation();
  const { store } = useGlobalReducer();
  const [newStatus, setNewStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isLocked = order.status === "delivered" || order.status === "cancelled";

  const handleSaveStatus = async () => {
    if (newStatus === order.status) { onClose(); return; }
    setSaving(true);
    setError(null);
    const token = store.token || localStorage.getItem("token");
    const [, err] = await orderService.updateOrderStatus(token, order.id, newStatus);
    setSaving(false);
    if (err) { setError(err); return; }
    onUpdated();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-main rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-main">
          <div>
            <p className="font-semibold text-main">
              {t("dashboard.orders.table.order")} <span className="font-mono">#{order.id}</span>
            </p>
            <p className="text-xs text-faint">
              {new Date(order.created_at).toLocaleDateString("es-ES", {
                day: "2-digit", month: "long", year: "numeric",
              })}
              {order.payment_method && ` · ${t(`dashboard.orders.payment.${order.payment_method}`, { defaultValue: order.payment_method })}`}
            </p>
          </div>
          <button onClick={onClose} className="text-faint hover:text-main text-xl font-bold">✕</button>
        </div>

        {/* ── Cliente ── */}
        <div className="px-6 py-4 border-b border-main">
          <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
            {t("dashboard.orders.modal.customer")}
          </p>
          <p className="font-semibold text-main">{order.customer || "—"}</p>
          {order.customer_email && <p className="text-sm text-muted">{order.customer_email}</p>}
        </div>

        {/* ── Direcciones ── */}
        <div className="px-6 py-4 border-b border-main">
          <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
            {t("dashboard.orders.modal.addresses")}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <AddressBlock label={t("dashboard.orders.modal.shipping")} address={order.shipping_address} />
            <AddressBlock label={t("dashboard.orders.modal.billing")}  address={order.billing_address} />
          </div>
        </div>

        {/* ── Productos ── */}
        <div className="px-6 py-4 border-b border-main">
          <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
            {t("dashboard.orders.modal.productsSection")} ({order.products.length})
          </p>
          <div className="space-y-3">
            {order.products.map((producto) => (
              <div key={producto.id} className="flex items-center gap-3">
                {producto.image_url && (
                  <img src={producto.image_url}
                    className="w-12 h-12 rounded-lg object-cover border border-main flex-shrink-0"
                    alt="img"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-main truncate">{producto.name}</p>
                  <p className="text-xs text-faint">x{producto.quantity} · €{producto.price} c/u</p>
                </div>
                <p className="text-sm font-semibold text-sub flex-shrink-0">
                  €{(producto.price * producto.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Resumen ── */}
        <div className="px-6 py-4 border-b border-main">
          <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
            {t("dashboard.orders.modal.summary")}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted">
              <span>{t("checkout.subtotal")}</span>
              <span>€{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>{t("checkout.tax")}</span>
              <span>€{Number(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>{t("checkout.shipping")}</span>
              <span>€{Number(order.shipping_cost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-main pt-2 border-t border-main mt-2">
              <span>{t("checkout.total")}</span>
              <span>€{Number(order.total_price).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Estado ── */}
        <div className="px-6 py-4">
          <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
            {t("dashboard.orders.modal.statusSection")}
          </p>

          {isLocked ? (
            <div className="flex items-center gap-2">
              <span className={`inline-block text-sm px-3 py-1.5 rounded-full font-medium ${STATUS_STYLE[order.status]}`}>
                {t(`dashboard.orders.status.${order.status}`, { defaultValue: order.status })}
              </span>
              <span className="text-xs text-faint">
                {order.status === "delivered" ? " Pedido finalizado" : " Pedido cancelado"}
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input">
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`dashboard.orders.status.${s}`, { defaultValue: s })}
                    {s === order.status ? ` — ${t("dashboard.orders.modal.current")}` : ""}
                  </option>
                ))}
              </select>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={handleSaveStatus}
                disabled={saving || newStatus === order.status}
                className="btn-primary w-full"
              >
                {saving ? t("dashboard.orders.modal.saving") : t("dashboard.orders.modal.saveStatus")}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OrderTabModal;