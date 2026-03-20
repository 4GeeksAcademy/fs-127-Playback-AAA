import { useState, useEffect } from "react";
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

// El vendedor NO puede marcar como delivered — eso lo hace el comprador o la transportista.
// Por eso "shipped" no tiene siguiente estado aquí.
const NEXT_STATUS = {
  pending:    "confirmed",
  paid:       "confirmed",
  confirmed:  "processing",
  processing: "shipped",
};

// Estados desde los que el vendedor SÍ puede cancelar
const CANCELLABLE = new Set(["paid", "confirmed", "processing"]);

// Transportistas más habituales en España para el selector
const CARRIERS = ["Correos", "SEUR", "MRW", "DHL", "GLS", "Nacex", "UPS", "Otro"];

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

  // currentStatus refleja el estado real del SellerOrder en esta sesión del modal.
  // Si el pedido entra como "confirmed" lo inicializamos directamente en "processing"
  // (optimistic update) — el PATCH se lanza en background y el usuario nunca ve
  // el estado intermedio. Para cualquier otro estado arranca con el valor recibido.
  const [currentStatus,  setCurrentStatus]  = useState(
    order.status === "confirmed" ? "processing" : order.status
  );
  const [saving,         setSaving]         = useState(false);
  const [confirming,     setConfirming]     = useState(false); // auto-advance en curso
  const [error,          setError]          = useState(null);
  const [confirmCancel,  setConfirmCancel]  = useState(false);
  const [cancelReason,   setCancelReason]   = useState("");

  // Estado para el formulario de envío (solo se usa cuando nextStatus === "shipped")
  const [trackingCode, setTrackingCode] = useState("");
  const [carrierName,  setCarrierName]  = useState("Correos");

  const token = store.token || localStorage.getItem("token");

  // ── Auto-advance al abrir el modal ────────────────────────────────────────
  // El tab ya habrá auto-confirmado los "paid" → "confirmed" al cargar.
  // Al abrir el modal avanzamos automáticamente "confirmed" → "processing" para
  // que el vendedor vea directamente el formulario de envío listo.
  useEffect(() => {
    if (order.status !== "confirmed") return;

    const autoAdvance = async () => {
      setConfirming(true);
      const [, err] = await orderService.updateOrderStatus(
        token,
        order.seller_order_id,
        "processing",
      );
      setConfirming(false);
      if (!err) {
        setCurrentStatus("processing");
        onUpdated(); // refresca la lista detrás del modal
      }
      // Si falla ignoramos silenciosamente — el vendedor puede avanzar manualmente
    };

    autoAdvance();
  }, []); // solo al montar

  const isLocked    = currentStatus === "delivered" || currentStatus === "cancelled";
  const nextStatus  = NEXT_STATUS[currentStatus];
  const canCancel   = CANCELLABLE.has(currentStatus); // solo antes de enviado

  // Actualiza el estado usando seller_order_id, no order.id.
  // NOTA para el equipo: orderService.updateOrderStatus debe aceptar un 4º parámetro
  // opcional extraData = {} que se mezcle en el body del PATCH:
  //   updateOrderStatus(token, id, status, extraData = {}) {
  //     return this.patch(`/order/seller-orders/${id}/status`, token, { status, ...extraData });
  //   }
  const handleUpdateStatus = async (targetStatus) => {
    setSaving(true);
    setError(null);

    // Si estamos marcando como enviado, incluimos código y transportista
    const extraData = targetStatus === "shipped"
      ? { tracking_code: trackingCode.trim(), carrier_name: carrierName }
      : targetStatus === "cancelled"
        ? { cancellation_reason: cancelReason.trim() }
        : {};

    const [, err] = await orderService.updateOrderStatus(
      token,
      order.seller_order_id,   // ← seller_order_id, no order.id
      targetStatus,
      extraData,
    );
    setSaving(false);
    if (err) { setError(err); return; }
    onUpdated();
    onClose();
  };

  // El botón de avanzar a "shipped" solo se activa si hay código de tracking
  const canAdvance = nextStatus !== "shipped" || trackingCode.trim().length > 0;

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
                  <p className="text-xs text-faint">x{producto.quantity} · {producto.price} c/u€</p>
                </div>
                <p className="text-sm font-semibold text-sub flex-shrink-0">
                  {(producto.price * producto.quantity).toFixed(2)}€
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
              <span>{Number(order.subtotal).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>{t("checkout.tax")}</span>
              <span>{Number(order.tax).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>{t("checkout.shipping")}</span>
              <span>{Number(order.shipping_cost).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between font-bold text-main pt-2 border-t border-main mt-2">
              <span>{t("checkout.total")}</span>
              <span>{Number(order.total_price).toFixed(2)}€</span>
            </div>
          </div>
        </div>

        {/* ── Estado ── */}
        <div className="px-6 py-4">
          <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
            {t("dashboard.orders.modal.statusSection")}
          </p>

          {/* Estado actual — si el auto-advance está en curso mostramos feedback sutil */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-block text-sm px-3 py-1.5 rounded-full font-medium ${STATUS_STYLE[currentStatus]}`}>
              {t(`dashboard.orders.status.${currentStatus}`, { defaultValue: currentStatus })}
            </span>
            {confirming && (
              <span className="text-xs text-faint animate-pulse">
                {t("dashboard.orders.modal.autoConfirming") || "Preparando…"}
              </span>
            )}
          </div>

          {/* Aviso informativo cuando el pedido ya está enviado */}
          {currentStatus === "shipped" && (
            <p className="text-xs text-faint mb-4 p-3 rounded-lg bg-subtle border border-main">
              📬 {t("dashboard.orders.modal.shippedNote") || "El pedido está en camino. La entrega la confirmará el comprador o la transportista."}
              {order.tracking_code && (
                <span className="block mt-1 font-mono font-medium text-sub">
                  {order.carrier_name} · {order.tracking_code}
                </span>
              )}
            </p>
          )}

          {isLocked ? (
            /* Pedido finalizado o cancelado: sin acciones */
            <p className="text-xs text-faint">
              {currentStatus === "delivered" ? "Pedido finalizado" : "Pedido cancelado"}
            </p>
          ) : (
            !confirming && (
              <div className="space-y-3">

                {/* ── Formulario de envío (solo cuando el siguiente paso es "shipped") ── */}
                {nextStatus === "shipped" && (
                  <div className="space-y-2 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40">
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
                      📦 {t("dashboard.orders.modal.shippingData") || "Datos de envío"}
                    </p>

                    {/* Transportista */}
                    <div>
                      <label className="block text-xs text-faint mb-1">
                        {t("dashboard.orders.modal.carrier") || "Transportista"}
                      </label>
                      <select
                        value={carrierName}
                        onChange={(e) => setCarrierName(e.target.value)}
                        className="input w-full"
                      >
                        {CARRIERS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Código de seguimiento */}
                    <div>
                      <label className="block text-xs text-faint mb-1">
                        {t("dashboard.orders.modal.trackingCode") || "Código de seguimiento"}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        placeholder="Ej. EA123456789ES"
                        className="input w-full font-mono"
                      />
                      <p className="text-[10px] text-faint mt-1">
                        {t("dashboard.orders.modal.trackingHint") || "El comprador recibirá este código por email para hacer el seguimiento."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Botón avanzar al siguiente estado (no aparece si ya está en shipped) */}
                {nextStatus && (
                  <button
                    onClick={() => handleUpdateStatus(nextStatus)}
                    disabled={saving || !canAdvance}
                    className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving
                      ? t("dashboard.orders.modal.saving")
                      : `${t("dashboard.orders.modal.advanceTo") || "Avanzar a"} ${t(`dashboard.orders.status.${nextStatus}`, { defaultValue: nextStatus })} →`}
                  </button>
                )}

                {/* Cancelar — solo disponible antes de enviado, botón pequeño y discreto */}
                {canCancel && (
                  !confirmCancel ? (
                    <button
                      onClick={() => setConfirmCancel(true)}
                      disabled={saving}
                      className="w-full text-xs py-1.5 px-3 rounded-lg text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition text-center"
                    >
                      {t("dashboard.orders.modal.cancelOrder") || "Cancelar pedido"}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-faint">
                        {t("dashboard.orders.modal.cancelReasonLabel") || "Indica el motivo de la cancelación"}
                        <span className="text-red-500 ml-0.5">*</span>
                      </p>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder={t("dashboard.orders.modal.cancelReasonPlaceholder") || "Ej. Producto sin stock, error en el pedido…"}
                        rows={3}
                        className="input w-full resize-none text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus("cancelled")}
                          disabled={saving || cancelReason.trim().length === 0}
                          className="flex-1 text-sm py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {t("dashboard.orders.modal.confirmCancel") || "Sí, cancelar"}
                        </button>
                        <button
                          onClick={() => { setConfirmCancel(false); setCancelReason(""); }}
                          disabled={saving}
                          className="flex-1 text-sm py-2 px-4 rounded-xl border border-main text-sub hover:bg-subtle transition"
                        >
                          {t("dashboard.orders.modal.goBack") || "Volver"}
                        </button>
                      </div>
                    </div>
                  )
                )}

                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
            )
          )}
        </div>

        {/* ── Botón cerrar al pie ── */}
        <div className="px-6 pb-5 pt-1">
          <button
            onClick={onClose}
            className="w-full text-sm py-2 px-4 rounded-xl border border-main text-faint hover:text-main hover:bg-subtle transition"
          >
            {t("dashboard.orders.modal.close") || "Cerrar"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderTabModal;