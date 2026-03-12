import { useState, useEffect } from "react";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";

const EarningTab = () => {
  const { store } = useGlobalReducer();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //Hacemos el fetch para obtener los pedidos del vendedor
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/seller-orders`, {
      headers: { Authorization: `Bearer ${store.token}` },
    })
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <p className="text-center text-sm text-gray-400 mt-10 animate-pulse">
        Cargando ganancias…
      </p>
    );

  // ── Calcular stats desde los pedidos ──────────────
  const pedidosConfirmados = orders.filter((o) => o.status !== "cancelled");

  const totalGanado = pedidosConfirmados.reduce((sum, o) => {
    return sum + o.products.reduce((s, p) => s + p.price * p.quantity, 0);
  }, 0);

  const totalPedidos = pedidosConfirmados.length;
  const ticketMedio = totalPedidos > 0 ? totalGanado / totalPedidos : 0;

  // ── Ganancias por mes (últimos 6) ─────────────────
  const porMes = {};
  pedidosConfirmados.forEach((o) => {
    const mes = new Date(o.created_at).toLocaleDateString("es-ES", {
      month: "short",
      year: "2-digit",
    });
    const ganancia = o.products.reduce((s, p) => s + p.price * p.quantity, 0);
    porMes[mes] = (porMes[mes] || 0) + ganancia;
  });

  const meses = Object.entries(porMes).slice(-6);
  const maxGanancia = Math.max(...meses.map(([, v]) => v), 1);

  return (
    <div className="pt-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-5 border border-purple-200 bg-purple-50">
          <p className="text-2xl font-bold text-purple-600">
            €{totalGanado.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Ingresos totales</p>
        </div>
        <div className="rounded-xl p-5 border border-gray-200">
          <p className="text-2xl font-bold text-gray-800">{totalPedidos}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pedidos completados</p>
        </div>
        <div className="rounded-xl p-5 border border-gray-200">
          <p className="text-2xl font-bold text-gray-800">
            €{ticketMedio.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Ticket medio</p>
        </div>
      </div>

      {/* Gráfico de barras por mes */}
      {meses.length > 0 && (
        <div className="border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Ingresos por mes
          </h3>
          <div className="flex items-end gap-3" style={{ height: "144px" }}>
            {meses.map(([mes, valor]) => {
              const barHeight = Math.max(
                Math.round((valor / maxGanancia) * 120),
                4,
              );
              return (
                <div
                  key={mes}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] text-gray-400">
                    €{valor.toFixed(0)}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-purple-500 hover:bg-purple-600 transition-all"
                    style={{ height: `${barHeight}px` }}
                  />
                  <span className="text-[11px] text-gray-400">{mes}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Últimos pedidos con ganancia */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Últimos movimientos
        </h3>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
          {orders.slice(0, 10).map((o) => {
            const ganancia = o.products.reduce(
              (s, p) => s + p.price * p.quantity,
              0,
            );
            const cancelado = o.status === "cancelled";
            return (
              <div
                key={o.id}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    Pedido #{o.id} — {o.customer || "Cliente"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(o.created_at).toLocaleDateString("es-ES")} ·{" "}
                    {o.products.length} producto
                    {o.products.length > 1 ? "s" : ""}
                  </p>
                </div>
                <span
                  className={`font-semibold ${cancelado ? "text-red-500" : "text-emerald-600"}`}
                >
                  {cancelado ? "Cancelado" : `+€${ganancia.toFixed(2)}`}
                </span>
              </div>
            );
          })}
          {orders.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">
              No hay movimientos aún.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningTab;
