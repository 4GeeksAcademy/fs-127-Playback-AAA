import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, AlertCircle, ChevronDown, ChevronUp, CheckCircle, X, ChevronLeft, ChevronRight, PackageCheck, Truck, Package, } from "lucide-react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import orderService from "../../services/orderService";
import { ReviewForm } from "../Common/ReviewForm";
import IncidentForm from "./IncidentForm";

const STATUS_CONFIG = {
  pending:    { label: "Pendiente",      bg: "#F1EFE8", color: "#5F5E5A" },
  paid:       { label: "Pagado",         bg: "#E6F1FB", color: "#185FA5" },
  confirmed:  { label: "Confirmado",     bg: "#E6F1FB", color: "#185FA5" },
  processing: { label: "En preparación", bg: "#FAEEDA", color: "#633806" },
  shipped:    { label: "Enviado",        bg: "#EEEDFE", color: "#534AB7" },
  delivered:  { label: "Entregado",      bg: "#EAF3DE", color: "#3B6D11" },
  cancelled:  { label: "Cancelado",      bg: "#FCEBEB", color: "#A32D2D" },
};

// Color del borde lateral izquierdo según el estado del SellerOrder
const STATUS_BORDER_COLOR = {
  paid:       "#93C5FD",
  confirmed:  "#93C5FD",
  processing: "#FCD34D",
  shipped:    "#A5B4FC",
  delivered:  "#86EFAC",
  cancelled:  "#FCA5A5",
};

// ── URLs de seguimiento por transportista ─────────────────────────────────────
const trackingUrl = (carrier, code) => {
  if (!code) return null;
  const urls = {
    "Correos": `https://www.correos.es/ss/Satellite/site/pagina-inicio/sidioma=es_ES#tracking=${code}`,
    "SEUR":    `https://www.seur.com/livetracking/?segOnlineIdentificador=${code}`,
    "MRW":     `https://www.mrw.es/seguimiento_envios/MRW_resultados_consultas.asp?Numero=${code}`,
    "DHL":     `https://www.dhl.com/es-es/home/tracking.html?tracking-id=${code}`,
    "GLS":     `https://gls-group.eu/ES/es/seguimiento-de-envios?match=${code}`,
    "Nacex":   `https://www.nacex.es/irSeguimiento.do?agencia_origen=&numero_albaran=${code}`,
    "UPS":     `https://www.ups.com/track?loc=es_ES&tracknum=${code}`,
  };
  return urls[carrier] || `https://www.google.com/search?q=${carrier}+seguimiento+${code}`;
};

// ── Sub-sección de un envío dentro del desplegable ────────────────────────────
const ShipmentSection = ({ so, orderId, i18n, reviewed, onReview, onConfirm, confirming }) => {
  const cfg         = STATUS_CONFIG[so.status] || STATUS_CONFIG.pending;
  const isShipped   = so.status === "shipped";
  const isDelivered = so.status === "delivered";
  const isCancelled = so.status === "cancelled";
  const borderColor = STATUS_BORDER_COLOR[so.status] || "#E5E7EB";
  const url         = trackingUrl(so.carrier_name, so.tracking_code);

  return (
    <div
      style={{
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "12px",
        border: "1px solid var(--color-border)",
        borderLeft: `4px solid ${borderColor}`,
        background: "var(--color-background-main)",
      }}
    >
      {/* ── Cabecera del envío ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: cfg.bg,
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          {so.seller_logo ? (
            <img
              src={so.seller_logo}
              alt={so.seller_name}
              style={{ width: "20px", height: "20px", borderRadius: "4px", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: cfg.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Package size={11} style={{ color: cfg.color }} />
            </div>
          )}
          <span style={{ fontSize: "12px", fontWeight: "700", color: cfg.color }}>
            {so.seller_name}
          </span>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: "600",
            color: cfg.color,
            background: "white",
            border: `1px solid ${borderColor}`,
            padding: "2px 8px",
            borderRadius: "20px",
            flexShrink: 0,
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* ── Tracking — solo si enviado y hay código ── */}
      {isShipped && so.tracking_code && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            padding: "8px 12px",
            background: "#F5F3FF",
            borderBottom: "1px solid #DDD6FE",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
            <Truck size={12} style={{ color: "#7C3AED", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              {so.carrier_name && (
                <span style={{ fontSize: "10px", color: "#7C3AED", fontWeight: "600", marginRight: "6px" }}>
                  {so.carrier_name}
                </span>
              )}
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#1a1a1a", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                {so.tracking_code}
              </span>
            </div>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "10px", color: "#7C3AED", textDecoration: "none", fontWeight: "600", flexShrink: 0, whiteSpace: "nowrap", padding: "3px 8px", background: "white", border: "1px solid #DDD6FE", borderRadius: "6px" }}
            >
              Seguir →
            </a>
          )}
        </div>
      )}

      {/* ── Productos de este envío ── */}
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {so.products.map((p, i) => {
          const reviewKey       = `${orderId}-${p.id}`;
          const alreadyReviewed = reviewed[reviewKey];
          const finalPrice      = (p.price * (1 - (p.discount || 0) / 100)).toFixed(2);
          const lineTotal       = (p.price * (1 - (p.discount || 0) / 100) * p.quantity).toFixed(2);

          return (
            <div
              key={`${p.id}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 10px",
                background: "var(--color-background-secondary)",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
              }}
            >
              <img
                src={p.image_url}
                alt=""
                style={{ width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name?.[i18n.language] || p.name?.es || p.name}
                </p>
                <p style={{ fontSize: "11px", color: "var(--color-muted)", marginTop: "1px" }}>
                  {finalPrice} € × {p.quantity}
                </p>
                {/* Valorar — solo disponible si ESTE envío está delivered */}
                {isDelivered && (
                  alreadyReviewed ? (
                    <p style={{ fontSize: "10px", color: "#3B6D11", display: "flex", alignItems: "center", gap: "3px", marginTop: "3px" }}>
                      <CheckCircle size={9} /> Valorado
                    </p>
                  ) : (
                    <button
                      onClick={() => onReview(p.id)}
                      style={{ fontSize: "10px", color: "#534AB7", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", marginTop: "3px", padding: 0 }}
                    >
                      <Star size={9} /> Valorar
                    </button>
                  )
                )}
              </div>
              <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-primary)", flexShrink: 0 }}>
                {lineTotal} €
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Botón confirmar entrega — solo si shipped ── */}
      {isShipped && (
        <div style={{ padding: "0 12px 12px" }}>
          <button
            onClick={() => onConfirm(so.seller_order_id)}
            disabled={confirming === so.seller_order_id}
            style={{
              width: "100%",
              background: "#EAF3DE",
              color: "#3B6D11",
              border: "1px solid #86EFAC",
              borderRadius: "8px",
              padding: "7px 12px",
              cursor: confirming === so.seller_order_id ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              fontSize: "12px",
              fontWeight: "600",
              opacity: confirming === so.seller_order_id ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            <PackageCheck size={13} />
            {confirming === so.seller_order_id ? "Confirmando…" : "He recibido este envío"}
          </button>
        </div>
      )}

      {/* ── Nota estado cancelado ── */}
      {isCancelled && (
        <div style={{ padding: "6px 12px 10px", fontSize: "11px", color: "#A32D2D" }}>
          Este envío fue cancelado.
        </div>
      )}
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const ProfileOrders = () => {
  const { store } = useGlobalReducer();
  const { t, i18n } = useTranslation();

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState({});
  const [reviewing, setReviewing] = useState(null);
  const [incident,  setIncident]  = useState(null);

  // seller_order_id del envío cuya confirmación está en curso
  const [confirmingDelivery, setConfirmingDelivery] = useState(null);
  // Cancelación de pedido por el comprador
  const [cancellingOrder, setCancellingOrder] = useState(null); // null | order.id
  const [cancelError,     setCancelError]     = useState(null);
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

  const loadOrders = () => {
    const token = store.token || localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    orderService.getMyOrders(token).then(([data]) => {
      if (data) setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => { loadOrders(); }, []);

  // Confirma la entrega de un envío concreto (por seller_order_id)
  const handleConfirmShipment = async (orderId, sellerOrderId) => {
    const token = store.token || localStorage.getItem("token");
    setConfirmingDelivery(sellerOrderId);
    const [, err] = await orderService.buyerConfirmShipmentDelivery(token, orderId, sellerOrderId);
    setConfirmingDelivery(null);
    if (!err) loadOrders();
  };

  // Cancela el pedido completo (solo en paid o confirmed)
  const handleCancelOrder = async (orderId) => {
    const token = store.token || localStorage.getItem("token");
    const [, err] = await orderService.cancelOrder(token, orderId);
    if (err) { setCancelError(err); return; }
    setCancellingOrder(null);
    setCancelError(null);
    loadOrders();
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Abre el stepper de valoración filtrando solo productos de envíos delivered
  const openReview = (order, specificProductId = null, soProducts = null) => {
    let pool;

    if (soProducts) {
      // Llamada desde ShipmentSection — ya viene filtrado al envío delivered concreto
      pool = soProducts;
    } else if (order.seller_orders && order.seller_orders.length > 0) {
      // Llamada desde el botón general — solo productos de envíos ya confirmed como delivered
      const deliveredIds = new Set(
        order.seller_orders
          .filter((so) => so.status === "delivered")
          .flatMap((so) => so.products.map((p) => p.id))
      );
      pool = order.products.filter((p) => deliveredIds.has(p.id));
    } else {
      // Pedido legacy sin seller_orders — el pedido entero debe estar delivered
      pool = order.products;
    }

    const pendingProducts = pool.filter((p) => !reviewed[`${order.id}-${p.id}`]);
    if (pendingProducts.length === 0) return;
    const startIdx = specificProductId
      ? Math.max(0, pendingProducts.findIndex((p) => p.id === specificProductId))
      : 0;
    setReviewing({ order, products: pendingProducts, step: startIdx });
  };

  // Devuelve los IDs de productos entregados (solo de envíos delivered) para un pedido
  const deliveredProductIds = (order) => {
    if (order.seller_orders && order.seller_orders.length > 0) {
      return order.seller_orders
        .filter((so) => so.status === "delivered")
        .flatMap((so) => so.products.map((p) => p.id));
    }
    // Legacy: si el pedido completo está delivered, todos sus productos cuentan
    if (order.status === "delivered") return order.products.map((p) => p.id);
    return [];
  };

  if (loading)
    return (
      <p className="text-center text-sm text-muted mt-10 animate-pulse">
        Cargando pedidos…
      </p>
    );

  if (orders.length === 0)
    return (
      <div className="bg-main rounded-xl border border-main p-10 text-center">
        <p className="text-muted text-sm">{t("orders.empty")}</p>
      </div>
    );

  const currentProduct = reviewing ? reviewing.products[reviewing.step] : null;

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const cfg         = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
        const isOpen      = expanded[order.id];
        const isDelivered = order.status === "delivered";
        const hasSellerOrders = order.seller_orders && order.seller_orders.length > 0;
        const hasAnyDelivered = hasSellerOrders
          && order.seller_orders.some((so) => so.status === "delivered");

        // IDs de productos que el comprador ya ha recibido
        const receivedIds = deliveredProductIds(order);

        // ¿Quedan productos recibidos sin valorar?
        const pendingReviewCount = receivedIds.filter(
          (id) => !reviewed[`${order.id}-${id}`]
        ).length;

        // Mostrar el botón solo si hay productos recibidos; cambiar label si todos valorados
        const canReview      = (isDelivered || hasAnyDelivered) && receivedIds.length > 0;
        const allReviewed    = canReview && pendingReviewCount === 0;

        const date = new Date(order.created_at).toLocaleDateString("es-ES", {
          day: "numeric", month: "short", year: "numeric",
        });

        return (
          <div key={order.id} className="bg-main rounded-xl border border-main overflow-hidden">
            <div className="px-4 py-3">
              {/* Fila superior */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0" style={{ minWidth: "44px" }}>
                  <p style={{ fontSize: "9px", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Nº
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-primary)", fontFamily: "monospace", lineHeight: 1.2 }}>
                    #{order.id}
                  </p>
                </div>

                <div className="flex -space-x-2 flex-shrink-0">
                  {order.products.slice(0, 3).map((p, i) => (
                    <img
                      key={`${p.id}-${i}`}
                      src={p.image_url}
                      alt=""
                      style={{ width: "30px", height: "30px", borderRadius: "6px", objectFit: "cover", border: "2px solid white" }}
                    />
                  ))}
                  {order.products.length > 3 && (
                    <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "#EEEDFE", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#534AB7", fontWeight: "700" }}>
                      +{order.products.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span style={{ background: cfg.bg, color: cfg.color, fontSize: "11px", padding: "2px 7px", borderRadius: "20px", fontWeight: "500", display: "inline-block" }}>
                    {cfg.label}
                  </span>
                  <p style={{ fontSize: "10px", color: "var(--color-muted)", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {date} · {order.products.length} prod.
                    {hasSellerOrders && order.seller_orders.length > 1 && (
                      <span style={{ marginLeft: "4px", color: "#534AB7" }}>
                        · {order.seller_orders.length} envíos
                      </span>
                    )}
                  </p>
                </div>

                <span style={{ fontSize: "14px", fontWeight: "600", flexShrink: 0, color: "var(--color-text-primary)" }}>
                  {parseFloat(order.total_price).toFixed(2)} €
                </span>

                <button
                  onClick={() => toggleExpand(order.id)}
                  style={{ background: "var(--color-background-secondary)", border: "none", borderRadius: "8px", padding: "5px 7px", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", flexShrink: 0 }}
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Fila inferior: botones */}
              <div className="flex gap-2 mt-2 justify-end flex-wrap">

                {/* Botón valorar — tres estados:
                    · no visible si no hay nada recibido
                    · activo con contador si quedan pendientes
                    · "Todo valorado" desactivado si ya no quedan */}
                {canReview && (
                  allReviewed ? (
                    <span
                      style={{ background: "#EAF3DE", color: "#3B6D11", borderRadius: "8px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "500" }}
                    >
                      <CheckCircle size={11} /> Todo valorado
                    </span>
                  ) : (
                    <button
                      onClick={() => openReview(order)}
                      style={{ background: "#EEEDFE", color: "#534AB7", border: "none", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "500" }}
                    >
                      <Star size={11} />
                      {t("review.rate")}
                      {/* Contador de pendientes si hay más de uno */}
                      {pendingReviewCount > 1 && (
                        <span style={{ background: "#534AB7", color: "white", borderRadius: "10px", padding: "0px 5px", fontSize: "10px", fontWeight: "700" }}>
                          {pendingReviewCount}
                        </span>
                      )}
                    </button>
                  )
                )}

                {/* Botón incidencia — amarillo, texto actualizado */}
                <button
                  onClick={() => setIncident(order.id)}
                  style={{ background: "#FEF9C3", color: "#854D0E", border: "none", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "500" }}
                >
                  <AlertCircle size={11} /> {t("orders.openIncident")}
                </button>

                {/* Cancelar pedido — solo en paid o confirmed */}
                {["paid", "confirmed"].includes(order.status) && (
                  cancellingOrder === order.id ? (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      {cancelError && (
                        <span style={{ fontSize: "10px", color: "#A32D2D" }}>{cancelError}</span>
                      )}
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        style={{ background: "#FEE2E2", color: "#A32D2D", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}
                      >
                        {t("orders.confirmCancel")}
                      </button>
                      <button
                        onClick={() => { setCancellingOrder(null); setCancelError(null); }}
                        style={{ background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "11px" }}
                      >
                        {t("orders.goBack")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setCancellingOrder(order.id); setCancelError(null); }}
                      style={{ background: "transparent", color: "#A32D2D", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "4px 10px", cursor: "pointer", fontSize: "11px", fontWeight: "500", display: "flex", alignItems: "center", gap: "3px" }}
                    >
                      <X size={11} />
                      {t("orders.cancelOrder")}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* ── Detalle expandible ── */}
            {isOpen && (
              <div className="border-t border-main px-4 py-4 bg-subtle">

                {hasSellerOrders ? (
                  /* Vista subdividida por envío (modelo nuevo) */
                  <>
                    {order.seller_orders.map((so) => (
                      <ShipmentSection
                        key={so.seller_order_id}
                        so={so}
                        orderId={order.id}
                        i18n={i18n}
                        reviewed={reviewed}
                        onReview={(productId) => openReview(order, productId, so.products)}
                        onConfirm={(soId) => handleConfirmShipment(order.id, soId)}
                        confirming={confirmingDelivery}
                      />
                    ))}
                  </>
                ) : (
                  /* Vista plana (pedidos anteriores al modelo SellerOrder) */
                  <div className="space-y-2 mb-3">
                    {order.products.map((p, i) => {
                      const reviewKey     = `${order.id}-${p.id}`;
                      const alreadyReviewed = reviewed[reviewKey];
                      const finalPrice    = (p.price * (1 - (p.discount || 0) / 100)).toFixed(2);
                      const lineTotal     = (p.price * (1 - (p.discount || 0) / 100) * p.quantity).toFixed(2);

                      return (
                        <div key={`${p.id}-${i}`} className="flex items-center gap-3 bg-main rounded-lg p-3 border border-main">
                          <img src={p.image_url} alt="" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: "12px", fontWeight: "500", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.name?.[i18n.language] || p.name}
                            </p>
                            <p style={{ fontSize: "11px", color: "var(--color-muted)", marginTop: "1px" }}>
                              {finalPrice} € × {p.quantity}
                            </p>
                            {/* Vista legacy: solo valorar si el pedido entero está delivered */}
                            {isDelivered && (
                              alreadyReviewed ? (
                                <p style={{ fontSize: "10px", color: "#3B6D11", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                                  <CheckCircle size={9} /> Valorado
                                </p>
                              ) : (
                                <button onClick={() => openReview(order, p.id)} style={{ fontSize: "10px", color: "#534AB7", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px", padding: 0 }}>
                                  <Star size={9} /> Valorar
                                </button>
                              )
                            )}
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-primary)", flexShrink: 0 }}>
                            {lineTotal} €
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dirección de envío */}
                {order.shipping_address && (
                  <div style={{ fontSize: "11px", color: "var(--color-muted)", borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: "10px", marginTop: "4px" }}>
                    <span style={{ fontWeight: "500", color: "var(--color-text-primary)" }}>
                      {t("checkout.shippingAddress")}:{" "}
                    </span>
                    {order.shipping_address.full_name} · {order.shipping_address.address},{" "}
                    {order.shipping_address.city}, {order.shipping_address.country}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Modal stepper valoración ── */}
      {reviewing && currentProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-main rounded-2xl w-full max-w-md shadow-xl border border-main overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-main">
              <div>
                <p style={{ fontSize: "11px", color: "var(--color-muted)", marginBottom: "2px" }}>
                  {t("review.title")} · {reviewing.step + 1} de {reviewing.products.length}
                </p>
                <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-text-primary)" }}>
                  {currentProduct.name?.[i18n.language] || currentProduct.name}
                </p>
              </div>
              <button onClick={() => setReviewing(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", display: "flex" }}>
                <X size={18} />
              </button>
            </div>

            {reviewing.products.length > 1 && (
              <div className="flex items-center justify-between px-5 py-3 bg-subtle border-b border-main">
                <button
                  onClick={() => setReviewing((prev) => ({ ...prev, step: prev.step - 1 }))}
                  disabled={reviewing.step === 0}
                  style={{ background: "none", border: "none", cursor: reviewing.step === 0 ? "not-allowed" : "pointer", opacity: reviewing.step === 0 ? 0.3 : 1, display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#534AB7" }}
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <div className="flex gap-1.5">
                  {reviewing.products.map((_, i) => (
                    <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: i === reviewing.step ? "#534AB7" : "#D1D5DB", transition: "background 0.2s" }} />
                  ))}
                </div>
                <button
                  onClick={() => setReviewing((prev) => ({ ...prev, step: prev.step + 1 }))}
                  disabled={reviewing.step === reviewing.products.length - 1}
                  style={{ background: "none", border: "none", cursor: reviewing.step === reviewing.products.length - 1 ? "not-allowed" : "pointer", opacity: reviewing.step === reviewing.products.length - 1 ? 0.3 : 1, display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#534AB7" }}
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 px-5 py-3 border-b border-main">
              <img src={currentProduct.image_url} alt="" style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--color-text-primary)" }}>
                  {currentProduct.name?.[i18n.language] || currentProduct.name}
                </p>
                <p style={{ fontSize: "11px", color: "var(--color-muted)" }}>
                  {(currentProduct.price * (1 - (currentProduct.discount || 0) / 100)).toFixed(2)} €
                </p>
              </div>
            </div>

            <div className="px-5 py-4">
              <ReviewForm
                key={currentProduct.id}
                productId={currentProduct.id}
                orderId={reviewing.order.id}
                onDone={() => {
                  markReviewed(`${reviewing.order.id}-${currentProduct.id}`);
                  const nextStep = reviewing.step + 1;
                  if (nextStep < reviewing.products.length) {
                    setReviewing((prev) => ({ ...prev, step: nextStep }));
                  } else {
                    setReviewing(null);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Modal incidencia (componente de tu compañero) ── */}
      {incident && (
        <IncidentForm orderId={incident} onClose={() => setIncident(null)} />
      )}
    </div>
  );
};

export default ProfileOrders;
