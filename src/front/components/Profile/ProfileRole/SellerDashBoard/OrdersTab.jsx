import { useState, useEffect } from "react";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import { AlertCircle } from "lucide-react";

const STATUS_STYLE = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-teal-100 text-teal-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABEL = {
  pending: "Pendiente",
  paid: "Pagado",
  confirmed: "Confirmado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const NEXT_STATUSES = {
  pending: [],
  paid: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],

};

const PAYMENT_LABEL = {
  credit_card: "Tarjeta de crédito",
  debit_card: "Tarjeta de débito",
  paypal: "PayPal",
  stripe: "Stripe",
  bank_transfer: "Transferencia bancaria",
};

const API = import.meta.env.VITE_BACKEND_URL;

// ── Componente para pintar la dirección (Separado para no ensuciar el modal) ──
const AddressBlock = ({ label, address }) => {
  // Si no hay dirección, mostramos esto:
  if (!address) {
    return (
      <div>
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-sm text-gray-400 italic">No disponible</p>
      </div>
    );
  }

  // Si hay dirección, la pintamos normalmente:
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{address.full_name}</p>
      <p className="text-sm text-gray-600">{address.address}</p>
      <p className="text-sm text-gray-600">
        {address.postal_code} {address.city} {address.province ? `, ${address.province}` : ""}
      </p>
      <p className="text-sm text-gray-600">{address.country}</p>
      {address.phone && <p className="text-sm text-gray-500 mt-1">📞 {address.phone}</p>}
    </div>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
const OrdersTab = () => {
  const { store } = useGlobalReducer();

  // Estados
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };


  // Función para cargar los pedidos
  const loadOrders = () => {
    setLoading(true);
    fetch(`${API}/api/order/seller-orders`, {
      headers: { Authorization: `Bearer ${store.token}` },
    })
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.log("Error cargando pedidos:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Funciones para el Modal
  const openModal = (order) => {
    setSelected(order);
    setNewStatus(order.status);
  };

  const closeModal = () => {
    setSelected(null);
    setNewStatus("");
  };

  const handleSaveStatus = async () => {
    if (!selected || newStatus === selected.status) {
      closeModal();
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API}/api/order/seller-orders/${selected.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast(errorData.description || "Error al actualizar estado");
        return;
      }

      loadOrders(); // Recargamos para ver los cambios
      closeModal();
    } catch (error) {
      console.log("Error al guardar estado:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-center text-sm text-gray-400 mt-10 animate-pulse">Cargando pedidos…</p>;
  }

  return (

    <div className="pt-6 space-y-4">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-red-600 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <AlertCircle size={15} />
          {toast.msg}
        </div>
      )}
      <p className="text-sm text-gray-500">{orders.length} pedidos encontrados</p>

      {/* ── TABLA DE PEDIDOS ── */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Pedido</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Productos</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-right px-4 py-3">Fecha</th>
              <th className="text-right px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-400 py-10">No tienes pedidos aún.</td>
              </tr>
            ) : (
              orders.map((pedido) => (
                <tr key={pedido.id} onClick={() => openModal(pedido)} className="hover:bg-gray-50 transition cursor-pointer">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{pedido.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{pedido.customer || "—"}</p>
                    {pedido.customer_email && <p className="text-xs text-gray-400">{pedido.customer_email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {pedido.products.slice(0, 3).map((prod) => (
                        prod.image_url && (
                          <img key={prod.id} src={prod.image_url} alt="prod" className="w-7 h-7 rounded object-cover border border-gray-200" />
                        )
                      ))}
                      {pedido.products.length > 3 && (
                        <span className="text-xs text-gray-400 ml-1">+{pedido.products.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">€{pedido.total_price}</td>
                  <td className="px-4 py-3 text-right text-gray-400 text-xs">
                    {new Date(pedido.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[pedido.status] || "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABEL[pedido.status] || pedido.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── MODAL DE DETALLE DEL PEDIDO ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-800">Pedido <span className="font-mono">#{selected.id}</span></p>
                <p className="text-xs text-gray-400">
                  {new Date(selected.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                  {selected.payment_method && ` · ${PAYMENT_LABEL[selected.payment_method] || selected.payment_method}`}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            {/* Bloque: Cliente */}
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Cliente</p>
              <p className="font-semibold text-gray-800">{selected.customer || "—"}</p>
              {selected.customer_email && <p className="text-sm text-gray-500">{selected.customer_email}</p>}
            </div>

            {/* Bloque: Direcciones */}
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Direcciones</p>
              <div className="grid grid-cols-2 gap-4">
                <AddressBlock label="Envío" address={selected.shipping_address} />
                <AddressBlock label="Facturación" address={selected.billing_address} />
              </div>
            </div>

            {/* Bloque: Productos */}
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Productos ({selected.products.length})</p>
              <div className="space-y-3">
                {selected.products.map((producto) => (
                  <div key={producto.id} className="flex items-center gap-3">
                    {producto.image_url && (
                      <img src={producto.image_url} className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0" alt="img" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{producto.name}</p>
                      <p className="text-xs text-gray-400">x{producto.quantity} · €{producto.price} c/u</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 flex-shrink-0">
                      €{(producto.price * producto.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloque: Resumen (Precios) */}
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Resumen</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>€{Number(selected.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>IVA incluido  (21%)</span>
                  <span>€{Number(selected.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Envío</span>
                  <span>€{Number(selected.shipping_cost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span>€{Number(selected.total_price).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Bloque: Cambiar Estado */}
            <div className="px-6 py-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Estado del pedido</p>

              {NEXT_STATUSES[selected.status]?.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value={selected.status}>{STATUS_LABEL[selected.status]} (actual)</option>
                    {NEXT_STATUSES[selected.status].map((statusOpcion) => (
                      <option key={statusOpcion} value={statusOpcion}>
                        {STATUS_LABEL[statusOpcion]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveStatus}
                    disabled={saving || newStatus === selected.status}
                    className="w-full bg-black text-white text-sm py-2.5 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-40"
                  >
                    {saving ? "Guardando…" : "Guardar cambio de estado"}
                  </button>
                </div>
              ) : (
                <span className={`inline-block text-sm px-3 py-1.5 rounded-full font-medium ${STATUS_STYLE[selected.status]}`}>
                  {STATUS_LABEL[selected.status]}
                </span>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;