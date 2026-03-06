// ── StepStoreInfo ─────────────────────────────────────────────────────────────
// Paso 0 del wizard — nombre de tienda, NIF, descripción y teléfono

import { useTranslation } from 'react-i18next';
import { Field, Input, Textarea } from './FormFields';

const StepStoreInfo = ({ form, errors, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Field label={`${t('seller.storeName')} *`} error={errors.store_name}>
            <Input name="store_name" value={form.store_name} onChange={onChange} placeholder="RetroConsolas García" />
          </Field>
        </div>
        <Field label={`${t('seller.nifCif')} *`} error={errors.nif_cif}>
          <Input name="nif_cif" value={form.nif_cif} onChange={onChange} placeholder="12345678A" />
        </Field>
      </div>
      <Field label={t('seller.storeDescription')}>
        <Textarea name="description" value={form.description} onChange={onChange} placeholder={t('seller.storeDescriptionPlaceholder')} />
      </Field>
      <Field label={t('seller.phone')}>
        <Input name="phone" value={form.phone} onChange={onChange} placeholder="+34 600 000 000" />
      </Field>
    </div>
  );
};

export default StepStoreInfo;