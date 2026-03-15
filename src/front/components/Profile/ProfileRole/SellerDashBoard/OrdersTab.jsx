import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useGlobalReducer from '../../../../hooks/useGlobalReducer';

const STATUS_STYLE = {
  pending:
    'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400',
  paid: 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400',
  confirmed: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
  processing:
    'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400',
  shipped:
    'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400',
  delivered:
    'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
  cancelled: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
};

const NEXT_STATUSES = {
  pending: [],
  paid: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const API = import.meta.env.VITE_BACKEND_URL;

// ── Componente para pintar la dirección (Separado para no ensuciar el modal) ──
const AddressBlock = ({ label, address }) => {
  const { t } = useTranslation();

  // Si no hay dirección, mostramos esto:
  if (!address) {
    return (
      <div>
        <p className="text-xs text-faint mb-1">{label}</p>
        <p className="text-sm text-faint italic">
          {t('dashboard.orders.noAddress')}
        </p>
      </div>
    );
  }

  // Si hay dirección, la pintamos normalmente:
  return (
    <div>
      <p className="text-xs text-faint mb-1">{label}</p>
      <p className="text-sm font-medium text-main">{address.full_name}</p>
      <p className="text-sm text-sub">{address.address}</p>
      <p className="text-sm text-sub">
        {address.postal_code} {address.city}{' '}
        {address.province ? `, ${address.province}` : ''}
      </p>
      <p className="text-sm text-sub">{address.country}</p>
      {address.phone && (
        <p className="text-sm text-muted mt-1">📞 {address.phone}</p>
      )}
    </div>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
const OrdersTab = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();

  // Estados
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Función para cargar los pedidos
  const loadOrders = () => {
    setLoading(true);
    fetch(`${API}/api/order/seller-orders`, {
      headers: { Authorization: `Bearer ${store.token}` },
    })
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.log('Error cargando pedidos:', error))
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
    setNewStatus('');
  };

  const handleSaveStatus = async () => {
    if (!selected || newStatus === selected.status) {
      closeModal();
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API}/api/order/seller-orders/${selected.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${store.token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.description || 'Error al actualizar estado');
        return;
      }

      loadOrders(); // Recargamos para ver los cambios
      closeModal();
    } catch (error) {
      console.log('Error al guardar estado:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-center text-sm text-faint mt-10 animate-pulse">
        {t('dashboard.orders.loading')}
      </p>
    );
  }

  return (
    <div className="pt-6 space-y-4">
      <p className="text-sm text-muted">
        {orders.length} {t('dashboard.orders.found')}
      </p>

      {/* ── TABLA DE PEDIDOS ── */}
      <div className="border border-main rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-subtle text-faint text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">
                {t('dashboard.orders.table.order')}
              </th>
              <th className="text-left px-4 py-3">
                {t('dashboard.orders.table.customer')}
              </th>
              <th className="text-left px-4 py-3">
                {t('dashboard.orders.table.products')}
              </th>
              <th className="text-right px-4 py-3">
                {t('dashboard.orders.table.total')}
              </th>
              <th className="text-right px-4 py-3">
                {t('dashboard.orders.table.date')}
              </th>
              <th className="text-right px-4 py-3">
                {t('dashboard.orders.table.status')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--color-border))]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-faint py-10">
                  {t('dashboard.orders.noOrders')}
                </td>
              </tr>
            ) : (
              orders.map((pedido) => (
                <tr
                  key={pedido.id}
                  onClick={() => openModal(pedido)}
                  className="hover:bg-subtle transition cursor-pointer"
                >
                  <td className="px-4 py-3 text-faint font-mono text-xs">
                    #{pedido.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-main">
                      {pedido.customer || '—'}
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
                          (prod) =>
                            prod.image_url && (
                              <img
                                key={prod.id}
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
                    €{pedido.total_price}
                  </td>
                  <td className="px-4 py-3 text-right text-faint text-xs">
                    {new Date(pedido.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[pedido.status] || 'bg-muted text-muted'}`}
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

      {/* ── MODAL DE DETALLE DEL PEDIDO ── */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-main rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-main">
              <div>
                <p className="font-semibold text-main">
                  {t('dashboard.orders.table.order')}{' '}
                  <span className="font-mono">#{selected.id}</span>
                </p>
                <p className="text-xs text-faint">
                  {new Date(selected.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {selected.payment_method &&
                    ` · ${t(`dashboard.orders.payment.${selected.payment_method}`, { defaultValue: selected.payment_method })}`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-faint hover:text-main text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Bloque: Cliente */}
            <div className="px-6 py-4 border-b border-main">
              <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
                {t('dashboard.orders.modal.customer')}
              </p>
              <p className="font-semibold text-main">
                {selected.customer || '—'}
              </p>
              {selected.customer_email && (
                <p className="text-sm text-muted">{selected.customer_email}</p>
              )}
            </div>

            {/* Bloque: Direcciones */}
            <div className="px-6 py-4 border-b border-main">
              <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
                {t('dashboard.orders.modal.addresses')}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <AddressBlock
                  label={t('dashboard.orders.modal.shipping')}
                  address={selected.shipping_address}
                />
                <AddressBlock
                  label={t('dashboard.orders.modal.billing')}
                  address={selected.billing_address}
                />
              </div>
            </div>

            {/* Bloque: Productos */}
            <div className="px-6 py-4 border-b border-main">
              <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
                {t('dashboard.orders.modal.productsSection')} (
                {selected.products.length})
              </p>
              <div className="space-y-3">
                {selected.products.map((producto) => (
                  <div key={producto.id} className="flex items-center gap-3">
                    {producto.image_url && (
                      <img
                        src={producto.image_url}
                        className="w-12 h-12 rounded-lg object-cover border border-main flex-shrink-0"
                        alt="img"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-main truncate">
                        {producto.name}
                      </p>
                      <p className="text-xs text-faint">
                        x{producto.quantity} · €{producto.price} c/u
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-sub flex-shrink-0">
                      €{(producto.price * producto.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloque: Resumen (Precios) */}
            <div className="px-6 py-4 border-b border-main">
              <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
                {t('dashboard.orders.modal.summary')}
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted">
                  <span>{t('checkout.subtotal')}</span>
                  <span>€{Number(selected.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>{t('checkout.tax')}</span>
                  <span>€{Number(selected.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>{t('checkout.shipping')}</span>
                  <span>€{Number(selected.shipping_cost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-main pt-2 border-t border-main mt-2">
                  <span>{t('checkout.total')}</span>
                  <span>€{Number(selected.total_price).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Bloque: Cambiar Estado */}
            <div className="px-6 py-4">
              <p className="text-xs text-faint uppercase tracking-wide font-medium mb-3">
                {t('dashboard.orders.modal.statusSection')}
              </p>

              {NEXT_STATUSES[selected.status]?.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input"
                  >
                    <option value={selected.status}>
                      {t(`dashboard.orders.status.${selected.status}`, {
                        defaultValue: selected.status,
                      })}{' '}
                      {t('dashboard.orders.modal.current')}
                    </option>
                    {NEXT_STATUSES[selected.status].map((statusOpcion) => (
                      <option key={statusOpcion} value={statusOpcion}>
                        {t(`dashboard.orders.status.${statusOpcion}`, {
                          defaultValue: statusOpcion,
                        })}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveStatus}
                    disabled={saving || newStatus === selected.status}
                    className="btn-primary w-full"
                  >
                    {saving
                      ? t('dashboard.orders.modal.saving')
                      : t('dashboard.orders.modal.saveStatus')}
                  </button>
                </div>
              ) : (
                <span
                  className={`inline-block text-sm px-3 py-1.5 rounded-full font-medium ${STATUS_STYLE[selected.status]}`}
                >
                  {t(`dashboard.orders.status.${selected.status}`, {
                    defaultValue: selected.status,
                  })}
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
