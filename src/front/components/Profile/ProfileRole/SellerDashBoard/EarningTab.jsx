import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import orderService from "../../../../services/orderService";

const EarningTab = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getSellerOrders(store.token).then(([data]) => {
      if (data) setOrders(data);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <p className="text-center text-sm text-faint mt-10 animate-pulse">
        {t("dashboard.earnings.loading")}
      </p>
    );

  const pedidosConfirmados = orders.filter((o) => o.status !== "cancelled");

  const totalGanado = pedidosConfirmados.reduce(
    (sum, o) => sum + o.products.reduce((s, p) => s + p.price * p.quantity, 0),
    0
  );
  const totalPedidos = pedidosConfirmados.length;
  const ticketMedio  = totalPedidos > 0 ? totalGanado / totalPedidos : 0;

  const porMes = {};
  pedidosConfirmados.forEach((o) => {
    const mes = new Date(o.created_at).toLocaleDateString("es-ES", {
      month: "short", year: "2-digit",
    });
    const ganancia = o.products.reduce((s, p) => s + p.price * p.quantity, 0);
    porMes[mes] = (porMes[mes] || 0) + ganancia;
  });

  const meses       = Object.entries(porMes).slice(-6);
  const maxGanancia = Math.max(...meses.map(([, v]) => v), 1);

  return (
    <div className="pt-6 space-y-6">

      {/* ── KPIs: 1 col en móvil, 3 en sm+ ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            €{totalGanado.toFixed(2)}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {t("dashboard.earnings.totalRevenue")}
          </p>
        </div>
        <div className="rounded-xl p-5 border border-main">
          <p className="text-2xl font-bold text-main">{totalPedidos}</p>
          <p className="text-xs text-muted mt-0.5">
            {t("dashboard.earnings.completedOrders")}
          </p>
        </div>
        <div className="rounded-xl p-5 border border-main">
          <p className="text-2xl font-bold text-main">€{ticketMedio.toFixed(2)}</p>
          <p className="text-xs text-muted mt-0.5">
            {t("dashboard.earnings.avgTicket")}
          </p>
        </div>
      </div>

      {/* ── Gráfico de barras ──
          En móvil mostramos solo los últimos 4 meses para que las barras
          no queden demasiado finas */}
      {meses.length > 0 && (
        <div className="border border-main rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-main mb-4">
            {t("dashboard.earnings.revenueByMonth")}
          </h3>
          <div
            className="flex items-end gap-2 sm:gap-3"
            style={{ height: "144px" }}
          >
            {/* En móvil mostramos los últimos 4, en sm+ los 6 */}
            {meses.map(([mes, valor], idx) => {
              const isMobileHidden = idx < meses.length - 4;
              const barHeight = Math.max(Math.round((valor / maxGanancia) * 120), 4);
              return (
                <div
                  key={mes}
                  className={`flex-1 flex flex-col items-center gap-1 ${isMobileHidden ? "hidden sm:flex" : "flex"}`}
                >
                  <span className="text-[10px] text-faint leading-none">
                    €{valor.toFixed(0)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-purple-500 hover:bg-purple-600 transition-all"
                    style={{ height: `${barHeight}px` }}
                  />
                  <span className="text-[11px] text-faint leading-none">{mes}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Últimos movimientos ── */}
      <div>
        <h3 className="text-sm font-semibold text-main mb-3">
          {t("dashboard.earnings.lastMovements")}
        </h3>
        <div className="divide-y divide-[rgb(var(--color-border))] border border-main rounded-xl overflow-hidden">
          {orders.slice(0, 10).map((o) => {
            const ganancia  = o.products.reduce((s, p) => s + p.price * p.quantity, 0);
            const cancelado = o.status === "cancelled";
            return (
              <div
                key={o.id}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-subtle"
              >
                <div className="min-w-0 mr-4">
                  <p className="font-medium text-main truncate">
                    {t("dashboard.earnings.order")} #{o.id}
                    {o.customer ? ` — ${o.customer}` : ""}
                  </p>
                  <p className="text-xs text-faint mt-0.5">
                    {new Date(o.created_at).toLocaleDateString("es-ES")} ·{" "}
                    {o.products.length} producto{o.products.length > 1 ? "s" : ""}
                  </p>
                </div>
                <span className={`font-semibold flex-shrink-0 ${cancelado ? "text-red-500" : "text-emerald-600"}`}>
                  {cancelado
                    ? t("dashboard.orders.status.cancelled")
                    : `+€${ganancia.toFixed(2)}`}
                </span>
              </div>
            );
          })}
          {orders.length === 0 && (
            <p className="text-center text-faint text-sm py-10">
              {t("dashboard.earnings.noMovements")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningTab;