import { useTranslation } from 'react-i18next';
import useGlobalReducer from '../../../hooks/useGlobalReducer';
import { deleteSellerProfileService } from '../../../services/sellerService';
import SellerRegister from './SellerRegister/SellerRegister';

const SellerRejected = ({ sellerProfile, onResubmit, onCancel }) => {
  const { t } = useTranslation();
  const { store } = useGlobalReducer();

  const handleCancel = async () => {
    try {
      await deleteSellerProfileService(store.token);
      onCancel();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto px-4">

      {/* Notificación de rechazo */}
      <div className="bg-main border border-main rounded-2xl p-8 shadow-sm text-center">
        <div className="text-5xl mb-4">❌</div>
        <h3 className="text-lg font-semibold text-[rgb(var(--color-error))] mb-2">{t('seller.rejectedTitle')}</h3>
        <p className="text-muted text-sm">{t('seller.rejectedDesc')}</p>
      </div>

      {/* Motivo del rechazo — solo si el admin lo especificó */}
      {sellerProfile.rejection_reason && (
        <div className="bg-main border border-main rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">
            📋 {t('seller.rejectionReason')}
          </p>
          <p className="text-sm text-main bg-[rgb(var(--color-error-bg))] border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
            {sellerProfile.rejection_reason}
          </p>
        </div>
      )}

      {/* Formulario precargado para corregir y reenviar */}
      <div className="bg-main border border-main rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-main mb-1">✏️ {t('seller.editTitle')}</h2>
        <p className="text-muted text-sm mb-8">{t('seller.editSubtitle')}</p>
        <SellerRegister
          initialData={sellerProfile}
          isEdit
          onSuccess={onResubmit}
        />
      </div>

      {/* Cancelar solicitud — borra el perfil y vuelve al wizard de registro */}
      <div className="bg-main border border-main rounded-2xl p-6 shadow-sm text-center">
        <p className="text-sm text-muted mb-3">{t('seller.cancelApplicationDesc')}</p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
        >
          🗑 {t('seller.cancelApplication')}
        </button>
      </div>

    </div>
  );
};

export default SellerRejected;