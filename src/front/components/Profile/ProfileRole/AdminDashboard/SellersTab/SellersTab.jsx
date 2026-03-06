// ── SellersTab ────────────────────────────────────────────────────────────────
// Tab de gestión de vendedores.
// Gestiona el estado, la carga de datos, los filtros y el modal de rechazo.

import { useState, useEffect } from 'react';
import useGlobalReducer from '../../../../../hooks/useGlobalReducer';
import { getSellersService, updateSellerStatusService } from '../../../../../services/adminService';
import SellerRow    from './SellerRow';
import RejectModal  from './RejectModal';

const SellersTab = ({ onPendingChange }) => {
  const { store } = useGlobalReducer();

  // Lista de vendedores cargados desde el backend
  const [sellers, setSellers] = useState([]);
  // Filtro de estado activo ('', 'pending', 'verified', 'rejected')
  const [filter, setFilter] = useState('');
  // Estado de carga inicial de la lista
  const [loading, setLoading] = useState(true);
  // ID del vendedor cuyo estado se está actualizando en este momento
  const [updating, setUpdating] = useState(null);
  // Vendedor pendiente de rechazo — su presencia abre el RejectModal
  const [rejectTarget, setRejectTarget] = useState(null);
  // Error de la última petición
  const [error, setError] = useState(null);

  // Carga los vendedores y notifica al padre el número de pendientes
  const fetchSellers = async (status = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSellersService(store.token, status || null);
      setSellers(data);
      if (!status) onPendingChange(data.filter(s => s.status === 'pending').length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Recarga la lista cada vez que cambia el filtro activo
  useEffect(() => { fetchSellers(filter); }, [filter]);

  // Cambia el estado de un vendedor con motivo opcional para rechazos
  const handleStatus = async (sellerId, newStatus, rejectionReason = null) => {
    setUpdating(sellerId);
    try {
      await updateSellerStatusService(store.token, sellerId, newStatus, rejectionReason);
      await fetchSellers(filter);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  // Confirma el rechazo desde el modal con el motivo introducido
  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;
    setRejectTarget(null);
    await handleStatus(rejectTarget.id, 'rejected', reason);
  };

  return (
    <div className="space-y-4 pt-4">

      {/* Modal de rechazo — se monta solo cuando hay un vendedor seleccionado */}
      {rejectTarget && (
        <RejectModal
          seller={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {/* Filtros de estado + contador de resultados */}
      <div className="flex gap-2 flex-wrap">
        {[['', 'Todos'], ['pending', 'Pendientes'], ['verified', 'Verificados'], ['rejected', 'Rechazados']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition
              ${filter === val ? 'bg-purple-600 text-white' : 'bg-theme-muted text-theme-secondary hover:bg-theme-subtle border border-theme-border'}`}>
            {label}
          </button>
        ))}
        <span className="ml-auto text-sm text-theme-muted self-center">{sellers.length} resultados</span>
      </div>

      {/* Mensaje de error si la petición falla */}
      {error && (
        <div className="rounded-xl bg-theme-error-bg px-4 py-2.5 text-sm text-theme-error">{error}</div>
      )}

      {/* Lista de vendedores */}
      <div className="border border-theme-border rounded-2xl overflow-hidden divide-y divide-theme-border">
        {loading
          ? <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          : sellers.length === 0
            ? <p className="text-theme-muted text-sm text-center py-12">No hay vendedores con este filtro.</p>
            : sellers.map(seller => (
                <SellerRow
                  key={seller.id}
                  seller={seller}
                  updating={updating}
                  onApprove={() => handleStatus(seller.id, 'verified')}
                  onReject={e => { e.stopPropagation(); setRejectTarget(seller); }}
                  onPending={() => handleStatus(seller.id, 'pending')}
                />
              ))
        }
      </div>

    </div>
  );
};

export default SellersTab;