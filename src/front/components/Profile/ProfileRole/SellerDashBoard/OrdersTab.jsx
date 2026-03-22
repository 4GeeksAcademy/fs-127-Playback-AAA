import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import { AlertCircle, ArrowUpDown } from "lucide-react";
import orderService from "../../../../services/orderService";
import OrderDetailModal from "./OrderTabModal";

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

// Estados que requieren datos extra — se abre el modal en lugar de avanzar inline
const REQUIRES_MODAL = new Set(["shipped"]);

const OrdersTab = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();

  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [toast,    setToast]    = useState(null);
  const [sortKey,  setSortKey]  = useState("id");
  const [sortDir,  setSortDir]  = useState("desc");

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrders = async () => {
    setLoading(true);
    const [data, error] = await orderService.getSellerOrders(store.token);
    if (error) { showToast(error); setLoading(false); return; }

    // Auto-confirmar en paralelo todos los SellerOrders que sigan en "paid".
    // Se hace silenciosamente: si alguno falla no interrumpe el resto.
    const paidOrders = data.filter((p) => p.status === "paid");
    if (paidOrders.length > 0) {
      await Promise.allSettled(
        paidOrders.map((p) =>
          orderService.updateOrderStatus(store.token, p.seller_order_id, "confirmed")
        )
      );
      // Recargar para que la lista refleje los estados ya actualizados
      const [refreshed] = await orderService.getSellerOrders(store.token);
      setOrders(refreshed ?? data);
    } else {
      setOrders(data);
    }

    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  // Avance rápido de estado desde la lista sin abrir el modal.
  // Usa seller_order_id (no order.id) para el PATCH.
  // Si el siguiente estado requiere datos extra (código de envío), abre el modal.
  const handleInlineAdvance = async (e, pedido) => {
    e.stopPropagation();
    const next = NEXT_STATUS[pedido.status];
    if (!next) return;

    // Transiciones que necesitan input del vendedor → abrir modal
    if (REQUIRES_MODAL.has(next)) {
      setSelected(pedido);
      return;
    }

    const [, err] = await orderService.updateOrderStatus(store.token, pedido.seller_order_id, next);
    if (err) showToast(err);
    else loadOrders();
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...orders].sort((a, b) => {
    // Los cancelados siempre al final, independientemente del sort activo
    if (a.status === "cancelled" && b.status !== "cancelled") return 1;
    if (b.status === "cancelled" && a.status !== "cancelled") return -1;

    let va, vb;
    if (sortKey === "id")     { va = a.id;                   vb = b.id; }
    if (sortKey === "date")   { va = new Date(a.created_at); vb = new Date(b.created_at); }
    if (sortKey === "total")  { va = Number(a.total_price);  vb = Number(b.total_price); }
    if (sortKey === "status") { va = a.status;               vb = b.status; }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ col }) => (
    <ArrowUpDown
      size={12}
      className={`inline ml-1 transition-opacity ${
        sortKey === col ? "opacity-100 text-violet-500" : "opacity-30"
      }`}
    />
  );

  // Clases del botón de badge según si tiene siguiente estado o no
  const badgeClasses = (pedido) => {
    const hasNext = !!NEXT_STATUS[pedido.status];
    const base = STATUS_STYLE[pedido.status] || "bg-muted text-muted";
    const interactive = hasNext
      ? "hover:brightness-95 hover:scale-[1.06] hover:shadow-sm active:scale-95 transition-all duration-150 cursor-pointer"
      : "cursor-default";
    return `${base} ${interactive}`;
  };

  if (loading)
    return (
      <p className="text-center text-sm text-faint mt-10 animate-pulse">
        {t("dashboard.orders.loading")}
      </p>
    );

  return (
    <div className="pt-6 space-y-4">

      {toast && (
        <div className="fixed bottom-6 right-6 bg-red-600 dark:bg-red-500 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <AlertCircle size={15} />
          {toast.msg}
        </div>
      )}

      <p className="text-sm text-muted">
        {orders.length} {t("dashboard.orders.found")}
      </p>

      {sorted.length === 0 && (
        <p className="text-center text-faint text-sm py-10">
          {t("dashboard.orders.noOrders")}
        </p>
      )}

      {/* ══════════════════════════════════════════════
          MÓVIL: lista de cards  (solo visible en <sm)
      ══════════════════════════════════════════════ */}
      {sorted.length > 0 && (
        <div className="flex flex-col gap-3 sm:hidden">
          {sorted.map((pedido) => (
            <div
              key={pedido.seller_order_id}
              onClick={() => setSelected(pedido)}
              className="border border-main rounded-xl p-3 cursor-pointer hover:bg-subtle transition active:scale-[0.99]"
            >
              {/* Fila única: miniaturas + info + total + badge */}
              <div className="flex items-center gap-3">

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-faint">#{pedido.id}</span>
                    {pedido.customer && (
                      <span className="text-xs font-medium text-main truncate">· {pedido.customer}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-faint">
                    {new Date(pedido.created_at).toLocaleDateString("es-ES")}
                  </span>
                </div>

                {/* Miniaturas apiladas (máx 2) */}
                {pedido.products?.length > 0 && (
                  <div className="flex items-center flex-shrink-0">
                    {pedido.products.slice(0, 2).map((prod, i) =>
                      prod.image_url ? (
                        <img
                          key={`${prod.id}-${i}`}
                          src={prod.image_url}
                          alt="prod"
                          className="w-9 h-9 rounded-lg object-cover border border-main"
                          style={{ marginLeft: i > 0 ? "-10px" : "0", zIndex: 2 - i, position: "relative" }}
                        />
                      ) : null
                    )}
                    {pedido.products.length > 2 && (
                      <span className="text-[10px] text-faint ml-1.5">+{pedido.products.length - 2}</span>
                    )}
                  </div>
                )}

                {/* Total + badge (botón de avance rápido con hover) */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="font-semibold text-main text-sm">
                    {Number(pedido.total_price).toFixed(2)}€
                  </span>
                  <button
                    onClick={(e) => handleInlineAdvance(e, pedido)}
                    disabled={!NEXT_STATUS[pedido.status]}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClasses(pedido)}`}
                  >
                    {t(`dashboard.orders.status.${pedido.status}`, { defaultValue: pedido.status })}
                    {NEXT_STATUS[pedido.status] && <span className="ml-1 opacity-60">→</span>}
                  </button>
                  {pedido.status === "cancelled" && (
                    <p style={{ fontSize: "9px", color: "#A32D2D", opacity: 0.7, textAlign: "right", marginTop: "2px" }}>
                      💳 {t("dashboard.orders.refundIssued")}
                    </p>
                  )}

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          DESKTOP: tabla  (solo visible en sm+)
      ══════════════════════════════════════════════ */}
      {sorted.length > 0 && (
        <div className="hidden sm:block border border-main rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-subtle text-faint text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("id")}>
                  {t("dashboard.orders.table.order")} <SortIcon col="id" />
                </th>
                <th className="text-left px-4 py-3">
                  {t("dashboard.orders.table.customer")}
                </th>
                <th className="text-left px-4 py-3 hidden md:table-cell">
                  {t("dashboard.orders.table.products")}
                </th>
                <th className="text-right px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("total")}>
                  {t("dashboard.orders.table.total")} <SortIcon col="total" />
                </th>
                <th className="text-right px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("date")}>
                  {t("dashboard.orders.table.date")} <SortIcon col="date" />
                </th>
                <th className="text-right px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort("status")}>
                  {t("dashboard.orders.table.status")} <SortIcon col="status" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {sorted.map((pedido) => (
                <tr
                  key={pedido.seller_order_id}
                  onClick={() => setSelected(pedido)}
                  className="hover:bg-subtle transition cursor-pointer"
                >
                  <td className="px-4 py-3 text-faint font-mono text-xs">#{pedido.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-main truncate max-w-[160px]">
                      {pedido.customer || "—"}
                    </p>
                    {pedido.customer_email && (
                      <p className="text-xs text-faint">{pedido.customer_email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      {pedido.products.slice(0, 3).map((prod, i) =>
                        prod.image_url && (
                          <img
                            key={`${prod.id}-${i}`}
                            src={prod.image_url}
                            alt="prod"
                            className="w-7 h-7 rounded object-cover border border-main"
                          />
                        )
                      )}
                      {pedido.products.length > 3 && (
                        <span className="text-xs text-faint ml-1">+{pedido.products.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-main whitespace-nowrap">
                    {Number(pedido.total_price).toFixed(2)}€
                  </td>
                  <td className="px-4 py-3 text-right text-faint text-xs whitespace-nowrap">
                    {new Date(pedido.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {/* Badge convertido en botón de avance con hover */}
                    <button
                      onClick={(e) => handleInlineAdvance(e, pedido)}
                      disabled={!NEXT_STATUS[pedido.status]}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${badgeClasses(pedido)}`}
                    >
                      {t(`dashboard.orders.status.${pedido.status}`, { defaultValue: pedido.status })}
                      {NEXT_STATUS[pedido.status] && <span className="ml-1 opacity-60">→</span>}
                    </button>
                    {pedido.status === "cancelled" && (
                      <p style={{ fontSize: "9px", color: "#A32D2D", opacity: 0.7, marginTop: "3px", textAlign: "right" }}>
                        💳 {t("dashboard.orders.refundIssued")}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdated={loadOrders}
        />
      )}
    </div>
  );
};

export default OrdersTab;