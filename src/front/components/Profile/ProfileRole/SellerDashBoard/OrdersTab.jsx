import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import { AlertCircle, ArrowUpDown } from "lucide-react";
import orderService from "../../../../services/orderService";
import OrderDetailModal from "./OrderTabModal";

const STATUS_STYLE = {
  pending:
    "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
  paid: "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400",
  confirmed: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
  processing:
    "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
  shipped:
    "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400",
  delivered:
    "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
  cancelled: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
};

const OrdersTab = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("desc");

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrders = async () => {
    setLoading(true);
    const [data, error] = await orderService.getSellerOrders(store.token);
    if (error) showToast(error);
    else setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...orders].sort((a, b) => {
    let va, vb;
    if (sortKey === "id") {
      va = a.id;
      vb = b.id;
    }
    if (sortKey === "date") {
      va = new Date(a.created_at);
      vb = new Date(b.created_at);
    }
    if (sortKey === "total") {
      va = Number(a.total_price);
      vb = Number(b.total_price);
    }
    if (sortKey === "status") {
      va = a.status;
      vb = b.status;
    }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ col }) => (
    <ArrowUpDown
      size={12}
      className={`inline ml-1 transition-opacity ${sortKey === col ? "opacity-100 text-violet-500" : "opacity-30"}`}
    />
  );

  if (loading) {
    return (
      <p className="text-center text-sm text-faint mt-10 animate-pulse">
        {t("dashboard.orders.loading")}
      </p>
    );
  }

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

      <div className="border border-main rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-subtle text-faint text-xs uppercase tracking-wide">
            <tr>
              <th
                className="text-left px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSort("id")}
              >
                {t("dashboard.orders.table.order")} <SortIcon col="id" />
              </th>
              <th className="text-left px-4 py-3">
                {t("dashboard.orders.table.customer")}
              </th>
              <th className="text-left px-4 py-3">
                {t("dashboard.orders.table.products")}
              </th>
              <th
                className="text-right px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSort("total")}
              >
                {t("dashboard.orders.table.total")} <SortIcon col="total" />
              </th>
              <th
                className="text-right px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSort("date")}
              >
                {t("dashboard.orders.table.date")} <SortIcon col="date" />
              </th>
              <th
                className="text-right px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSort("status")}
              >
                {t("dashboard.orders.table.status")} <SortIcon col="status" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--color-border))]">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-faint py-10">
                  {t("dashboard.orders.noOrders")}
                </td>
              </tr>
            ) : (
              sorted.map((pedido) => (
                <tr
                  key={pedido.id}
                  onClick={() => setSelected(pedido)}
                  className="hover:bg-subtle transition cursor-pointer"
                >
                  <td className="px-4 py-3 text-faint font-mono text-xs">
                    #{pedido.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-main">
                      {pedido.customer || "—"}
                    </p>
                    {pedido.customer_email && (
                      <p className="text-xs text-faint">
                        {pedido.customer_email}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {pedido.products
                        .slice(0, 3)
                        .map(
                          (prod, i) =>
                            prod.image_url && (
                              <img
                                key={`${prod.id}-${i}`}
                                src={prod.image_url}
                                alt="prod"
                                className="w-7 h-7 rounded object-cover border border-main"
                              />
                            ),
                        )}
                      {pedido.products.length > 3 && (
                        <span className="text-xs text-faint ml-1">
                          +{pedido.products.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-main">
                    €{Number(pedido.total_price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-faint text-xs">
                    {new Date(pedido.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[pedido.status] || "bg-muted text-muted"}`}
                    >
                      {t(`dashboard.orders.status.${pedido.status}`, {
                        defaultValue: pedido.status,
                      })}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
