// ── StepReview ────────────────────────────────────────────────────────────────
// Paso 2 del wizard — resumen de datos y aviso antes de enviar

import { useTranslation } from 'react-i18next';

const StepReview = ({ form, isEdit }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-sub">{t('seller.reviewTitle')}</h3>

      {/* Tabla resumen con los datos introducidos */}
      <div className="rounded-xl border border-main bg-subtle p-4 text-sm space-y-2">
        {[
          [t('seller.storeName'),  form.store_name],
          [t('seller.nifCif'),     form.nif_cif],
          [t('seller.city'),       `${form.origin_city} (${form.origin_zip})`],
          [t('seller.country'),    form.origin_country],
        ].map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <span className="text-muted w-40 shrink-0">{label}</span>
            <span className="text-main font-medium truncate">{value}</span>
          </div>
        ))}
      </div>

      {/* Aviso — diferente texto según si es primera solicitud o reenvío */}
      <div className="flex items-start gap-2 rounded-xl bg-[rgb(var(--color-info-bg))] p-3 text-xs text-[rgb(var(--color-info))]">
        <span className="mt-0.5">ℹ</span>
        <span>{isEdit ? t('seller.resubmitNotice') : t('seller.pendingNotice')}</span>
      </div>
    </div>
  );
};

export default StepReview;