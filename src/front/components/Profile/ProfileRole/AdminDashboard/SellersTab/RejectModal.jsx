import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RejectModal = ({ seller, onConfirm, onCancel }) => {
  // Motivo de rechazo introducido por el admin
  const [reason, setReason] = useState('');
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-main border border-main rounded-2xl p-6 shadow-xl w-full max-w-md mx-4">
        {/* Cabecera del modal */}
        <h3 className="text-base font-semibold text-main mb-1">
          {t('admin.rejectTitle')}
        </h3>
        <p className="text-sm text-muted mb-4">
          {t('admin.rejectDesc1')}{' '}
          <span className="font-medium text-main">{seller.store_name}</span>
          {t('admin.rejectDesc2')}
        </p>

        {/* Textarea del motivo */}
        <textarea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('admin.rejectPlaceholder')}
          className="input resize-none mb-4 focus:ring-2 focus:ring-red-400"
        />

        {/* Botones de acción */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="btn-secondary py-2 px-4 text-sm"
          >
            {t('seller.cancel')}
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="btn-danger py-2 px-4 text-sm"
          >
            {t('admin.confirmReject')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
