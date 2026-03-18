// ── SellersTab ────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useGlobalReducer from '../../../../../hooks/useGlobalReducer';
import { getSellersService, updateSellerStatusService } from '../../../../../services/adminService';
import SellerRow   from './SellerRow';
import RejectModal from './RejectModal';

const SellersTab = ({ onPendingChange }) => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();

  const [sellers,      setSellers]      = useState([]);
  const [filter,       setFilter]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [updating,     setUpdating]     = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [error,        setError]        = useState(null);

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

  useEffect(() => { fetchSellers(filter); }, [filter]);

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

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;
    setRejectTarget(null);
    await handleStatus(rejectTarget.id, 'rejected', reason);
  };

  const FILTERS = [
    ['',         t('admin.filterAll')],
    ['pending',  t('admin.filterPending')],
    ['verified', t('admin.filterVerified')],
    ['rejected', t('admin.filterRejected')],
  ];

  return (
    <div className="space-y-4 pt-4">

      {rejectTarget && (
        <RejectModal
          seller={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {/* ── Filtros + contador ──
          En móvil: botones hacen wrap y el contador va debajo en su propia línea.
          En sm+: todo en una fila con ml-auto. */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition
              ${filter === val
                ? 'bg-purple-600 text-white'
                : 'bg-muted text-sub hover:bg-subtle border border-main'}`}
          >
            {label}
          </button>
        ))}

        {/* Contador: ocupa su propia línea en móvil, va al final en sm+ */}
        <span className="w-full sm:w-auto sm:ml-auto text-sm text-muted">
          {sellers.length} {t('admin.results')}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-[rgb(var(--color-error-bg))] px-4 py-2.5 text-sm text-[rgb(var(--color-error))]">
          {error}
        </div>
      )}

      {/* Lista de vendedores */}
      <div className="border border-main rounded-2xl overflow-hidden divide-y divide-[rgb(var(--color-border))]">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sellers.length === 0 ? (
          <p className="text-muted text-sm text-center py-12">{t('admin.noSellers')}</p>
        ) : (
          sellers.map(seller => (
            <SellerRow
              key={seller.id}
              seller={seller}
              updating={updating}
              onApprove={() => handleStatus(seller.id, 'verified')}
              onReject={e => { e.stopPropagation(); setRejectTarget(seller); }}
            />
          ))
        )}
      </div>

    </div>
  );
};

export default SellersTab;