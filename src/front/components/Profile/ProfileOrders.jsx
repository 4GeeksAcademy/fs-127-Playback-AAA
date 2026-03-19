import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Star,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import orderService from "../../services/orderService";
import { ReviewForm } from "../Common/ReviewForm";
import IncidentForm from "./IncidentForm";

const STATUS_CONFIG = {
  pending: { label: "Pendiente", bg: "#F1EFE8", color: "#5F5E5A" },
  paid: { label: "Pagado", bg: "#E6F1FB", color: "#185FA5" },
  confirmed: { label: "Confirmado", bg: "#E6F1FB", color: "#185FA5" },
  processing: { label: "En preparación", bg: "#FAEEDA", color: "#633806" },
  shipped: { label: "Enviado", bg: "#EEEDFE", color: "#534AB7" },
  delivered: { label: "Entregado", bg: "#EAF3DE", color: "#3B6D11" },
  cancelled: { label: "Cancelado", bg: "#FCEBEB", color: "#A32D2D" },
};

const ProfileOrders = () => {
  const { store } = useGlobalReducer();
  const { t, i18n } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [reviewing, setReviewing] = useState(null);
  const [incident, setIncident] = useState(null); // ← IncidentForm de tu compañero

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

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const openReview = (order, specificProductId = null) => {
    const pendingProducts = order.products.filter(
      (p) => !reviewed[`${order.id}-${p.id}`],
    );
    if (pendingProducts.length === 0) return;
    const startIdx = specificProductId
      ? Math.max(
          0,
          pendingProducts.findIndex((p) => p.id === specificProductId),
        )
      : 0;
    setReviewing({ order, products: pendingProducts, step: startIdx });
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
        const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
        const isOpen = expanded[order.id];
        const isDelivered = order.status === "delivered";
        const date = new Date(order.created_at).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return (
          <div
            key={order.id}
            className="bg-main rounded-xl border border-main overflow-hidden"
          >
            <div className="px-4 py-3">
              {/* Fila superior */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0" style={{ minWidth: "44px" }}>
                  <p
                    style={{
                      fontSize: "9px",
                      color: "var(--color-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Nº
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--color-text-primary)",
                      fontFamily: "monospace",
                      lineHeight: 1.2,
                    }}
                  >
                    #{order.id}
                  </p>
                </div>

                <div className="flex -space-x-2 flex-shrink-0">
                  {order.products.slice(0, 3).map((p, i) => (
                    <img
                      key={`${p.id}-${i}`}
                      src={p.image_url}
                      alt=""
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        objectFit: "cover",
                        border: "2px solid white",
                      }}
                    />
                  ))}
                  {order.products.length > 3 && (
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        background: "#EEEDFE",
                        border: "2px solid white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "9px",
                        color: "#534AB7",
                        fontWeight: "700",
                      }}
                    >
                      +{order.products.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span
                    style={{
                      background: cfg.bg,
                      color: cfg.color,
                      fontSize: "11px",
                      padding: "2px 7px",
                      borderRadius: "20px",
                      fontWeight: "500",
                      display: "inline-block",
                    }}
                  >
                    {cfg.label}
                  </span>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--color-muted)",
                      marginTop: "2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {date} · {order.products.length} prod.
                  </p>
                </div>

                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    flexShrink: 0,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {parseFloat(order.total_price).toFixed(2)} €
                </span>

                <button
                  onClick={() => toggleExpand(order.id)}
                  style={{
                    background: "var(--color-background-secondary)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "5px 7px",
                    cursor: "pointer",
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Fila inferior: botones */}
              <div className="flex gap-2 mt-2 justify-end">
                {isDelivered && (
                  <button
                    onClick={() => openReview(order)}
                    style={{
                      background: "#EEEDFE",
                      color: "#534AB7",
                      border: "none",
                      borderRadius: "8px",
                      padding: "4px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      fontWeight: "500",
                    }}
                  >
                    <Star size={11} /> {t("review.rate")}
                  </button>
                )}
                <button
                  onClick={() => setIncident(order.id)}
                  style={{
                    background: "#db8bed",
                    color: "#592c90",
                    border: "none",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    fontWeight: "500",
                  }}
                >
                  <AlertCircle size={11} /> {t("orders.openIncident")}
                </button>
              </div>
            </div>

            {/* Detalle expandible */}
            {isOpen && (
              <div className="border-t border-main px-4 py-4 bg-subtle">
                <div className="space-y-2 mb-3">
                  {order.products.map((p, i) => {
                    const reviewKey = `${order.id}-${p.id}`;
                    const alreadyReviewed = reviewed[reviewKey];
                    const finalPrice = (
                      p.price *
                      (1 - (p.discount || 0) / 100)
                    ).toFixed(2);
                    const lineTotal = (
                      p.price *
                      (1 - (p.discount || 0) / 100) *
                      p.quantity
                    ).toFixed(2);

                    return (
                      <div
                        key={`${p.id}-${i}`}
                        className="flex items-center gap-3 bg-main rounded-lg p-3 border border-main"
                      >
                        <img
                          src={p.image_url}
                          alt=""
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "6px",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            style={{
                              fontSize: "12px",
                              fontWeight: "500",
                              color: "var(--color-text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.name?.[i18n.language] || p.name}
                          </p>
                          <p
                            style={{
                              fontSize: "11px",
                              color: "var(--color-muted)",
                              marginTop: "1px",
                            }}
                          >
                            {finalPrice} € × {p.quantity}
                          </p>
                          {isDelivered &&
                            (alreadyReviewed ? (
                              <p
                                style={{
                                  fontSize: "10px",
                                  color: "#3B6D11",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  marginTop: "2px",
                                }}
                              >
                                <CheckCircle size={9} /> Valorado
                              </p>
                            ) : (
                              <button
                                onClick={() => openReview(order, p.id)}
                                style={{
                                  fontSize: "10px",
                                  color: "#534AB7",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  marginTop: "2px",
                                  padding: 0,
                                }}
                              >
                                <Star size={9} /> Valorar
                              </button>
                            ))}
                        </div>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "var(--color-text-primary)",
                            flexShrink: 0,
                          }}
                        >
                          {lineTotal} €
                        </span>
                      </div>
                    );
                  })}
                </div>

                {order.shipping_address && (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--color-muted)",
                      borderTop: "0.5px solid var(--color-border-tertiary)",
                      paddingTop: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "500",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {t("checkout.shippingAddress")}:{" "}
                    </span>
                    {order.shipping_address.full_name} ·{" "}
                    {order.shipping_address.address},{" "}
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.country}
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
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--color-muted)",
                    marginBottom: "2px",
                  }}
                >
                  {t("review.title")} · {reviewing.step + 1} de{" "}
                  {reviewing.products.length}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {currentProduct.name?.[i18n.language] || currentProduct.name}
                </p>
              </div>
              <button
                onClick={() => setReviewing(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-muted)",
                  display: "flex",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {reviewing.products.length > 1 && (
              <div className="flex items-center justify-between px-5 py-3 bg-subtle border-b border-main">
                <button
                  onClick={() =>
                    setReviewing((prev) => ({ ...prev, step: prev.step - 1 }))
                  }
                  disabled={reviewing.step === 0}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: reviewing.step === 0 ? "not-allowed" : "pointer",
                    opacity: reviewing.step === 0 ? 0.3 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "#534AB7",
                  }}
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <div className="flex gap-1.5">
                  {reviewing.products.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background:
                          i === reviewing.step ? "#534AB7" : "#D1D5DB",
                        transition: "background 0.2s",
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={() =>
                    setReviewing((prev) => ({ ...prev, step: prev.step + 1 }))
                  }
                  disabled={reviewing.step === reviewing.products.length - 1}
                  style={{
                    background: "none",
                    border: "none",
                    cursor:
                      reviewing.step === reviewing.products.length - 1
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      reviewing.step === reviewing.products.length - 1
                        ? 0.3
                        : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "#534AB7",
                  }}
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 px-5 py-3 border-b border-main">
              <img
                src={currentProduct.image_url}
                alt=""
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {currentProduct.name?.[i18n.language] || currentProduct.name}
                </p>
                <p style={{ fontSize: "11px", color: "var(--color-muted)" }}>
                  {(
                    currentProduct.price *
                    (1 - (currentProduct.discount || 0) / 100)
                  ).toFixed(2)}{" "}
                  €
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
