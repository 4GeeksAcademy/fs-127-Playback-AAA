import { useState, useEffect } from "react";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import { getMyProductsService } from "../../../../services/sellerService";

const STATUS_STYLE = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const ResumTab = () => {
  const { store } = useGlobalReducer();
  const [orders, setOrders]     = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/seller-orders`, {
        headers: { Authorization: `Bearer ${store.token}` },
      }).then((r) => r.json()),
      getMyProductsService(store.token),
    ])
      .then(([ordersData, productsData]) => {
        setOrders(ordersData || []);
        setProducts(productsData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-sm text-gray-400 mt-10 animate-pulse">Cargando resumen…</p>;

  // ── Stats calculadas ──────────────────────────────
  const pedidosPendientes = orders.filter((o) => o.status === "pending" || o.status === "processing");
  const sinStock          = products.filter((p) => p.stock === 0);

  const ahora      = new Date();
  const inicioMes  = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const ventasMes  = orders
    .filter((o) => o.status !== "cancelled" && new Date(o.created_at) >= inicioMes)
    .reduce((sum, o) => sum + o.products.reduce((s, p) => s + p.price * p.quantity, 0), 0);

  return (
    <div className="pt-6 space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-5 border border-purple-200 bg-purple-50">
          <span className="text-xl">📈</span>
          <p className="text-2xl font-bold text-purple-600 mt-2">€{ventasMes.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Ventas este mes</p>
        </div>

        <div className={`rounded-xl p-5 border ${pedidosPendientes.length > 0 ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}>
          <div className="flex justify-between items-start">
            <span className="text-xl">⏳</span>
            {pedidosPendientes.length > 0 && (
              <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">ATENCIÓN</span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-2">{pedidosPendientes.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pedidos pendientes</p>
        </div>

        <div className="rounded-xl p-5 border border-gray-200">
          <span className="text-xl">🛍️</span>
          <p className="text-2xl font-bold text-gray-800 mt-2">{products.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Productos activos {sinStock.length > 0 && <span className="text-red-500">· {sinStock.length} sin stock</span>}
          </p>
        </div>
      </div>

      {/* Actividad reciente */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Actividad reciente</h3>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
          {orders.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-mono text-xs">#{o.id}</span>
                <span className="text-gray-800">{o.customer || "Cliente"}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-xs hidden sm:block">
                  {new Date(o.created_at).toLocaleDateString("es-ES")}
                </span>
                <span className="font-semibold text-gray-800">
                  €{o.products.reduce((s, p) => s + p.price * p.quantity, 0).toFixed(2)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[o.status] || "bg-gray-100 text-gray-500"}`}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">No hay actividad aún.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default ResumTab;