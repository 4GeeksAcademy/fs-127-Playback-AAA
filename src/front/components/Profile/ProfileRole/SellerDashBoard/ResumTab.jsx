import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import { getMyProductsService } from "../../../../services/sellerService";
import orderService from "../../../../services/orderService";

const STATUS_STYLE = {
  pending:    "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  confirmed:  "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  processing: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  shipped:    "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400",
  delivered:  "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
  cancelled:  "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const ResumTab = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      orderService.getSellerOrders(store.token),
      getMyProductsService(store.token),
    ])
      .then(([[ordersData], productsData]) => {
        setOrders(ordersData || []);
        setProducts(productsData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <p className="text-center text-sm text-faint mt-10 animate-pulse">
        {t("dashboard.overview.loading")}
      </p>
    );

  const pedidosPendientes = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  );
  const sinStock = products.filter((p) => p.stock === 0);

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const ventasMes = orders
    .filter((o) => o.status !== "cancelled" && new Date(o.created_at) >= inicioMes)
    .reduce((sum, o) => sum + o.products.reduce((s, p) => s + p.price * p.quantity, 0), 0);

  return (
    <div className="pt-6 space-y-6">

      {/* ── KPIs: 1 col en móvil, 3 en sm+ ── */}

       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

  {/* 📈 Ventas */}
  <div className="rounded-xl p-5 border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950 flex items-center gap-4">
    <span className="text-3xl">📈</span>
    <div>
      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
        {ventasMes.toFixed(2)}€
      </p>
      <p className="text-xs text-muted mt-0.5">{t("dashboard.overview.salesThisMonth")}</p>
    </div>
  </div>

  {/* ⏳ Pedidos pendientes */}
  <div className={`rounded-xl p-5 border flex items-center gap-4 ${
    pedidosPendientes.length > 0
      ? "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950"
      : "border-main"
  }`}>
    <span className="text-3xl">⏳</span>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <p className="text-2xl font-bold text-main">{pedidosPendientes.length}</p>
        {pedidosPendientes.length > 0 && (
          <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
            {t("dashboard.overview.attention")}
          </span>
        )}
      </div>
      <p className="text-xs text-muted mt-0.5">{t("dashboard.overview.pendingOrders")}</p>
    </div>
  </div>

  {/* 🛍️ Productos activos */}
  <div className="rounded-xl p-5 border border-main flex items-center gap-4">
    <span className="text-3xl">🛍️</span>
    <div>
      <p className="text-2xl font-bold text-main">{products.length}</p>
      <p className="text-xs text-muted mt-0.5">
        {t("dashboard.overview.activeProducts")}{" "}
        {sinStock.length > 0 && (
          <span className="text-red-500">· {sinStock.length} {t("dashboard.overview.noStock")}</span>
        )}
      </p>
    </div>
  </div>

</div>

      {/* ── Actividad reciente ── */}
      <div>
        <h3 className="text-sm font-semibold text-main mb-3">
          {t("dashboard.overview.recentActivity")}
        </h3>
        <div className="divide-y divide-[rgb(var(--color-border))] border border-main rounded-xl overflow-hidden">
          {orders.slice(0, 5).map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-subtle"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-faint font-mono text-xs flex-shrink-0">#{o.id}</span>
                <span className="text-main truncate">
                  {o.customer || t("dashboard.overview.customer")}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
                <span className="text-faint text-xs hidden sm:block whitespace-nowrap">
                  {new Date(o.created_at).toLocaleDateString("es-ES")}
                </span>
                <span className="font-semibold text-main whitespace-nowrap">
                  {o.products.reduce((s, p) => s + p.price * p.quantity, 0).toFixed(2)}€
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_STYLE[o.status] || "bg-muted text-muted"}`}>
                  {t(`dashboard.orders.status.${o.status}`, { defaultValue: o.status })}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-faint text-sm py-10">
              {t("dashboard.overview.noActivity")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumTab;