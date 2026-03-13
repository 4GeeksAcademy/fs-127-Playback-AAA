// ── StepShipping ──────────────────────────────────────────────────────────────
// Paso 1 del wizard — dirección de origen

import { useTranslation } from 'react-i18next';
import { Field, Input } from './FormFields';

const StepShipping = ({ form, errors, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <Field label={`${t('seller.address')} *`} error={errors.origin_address}>
        <Input name="origin_address" value={form.origin_address} onChange={onChange} placeholder="Calle Mayor 12" />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label={`${t('seller.zip')} *`} error={errors.origin_zip}>
          <Input name="origin_zip" value={form.origin_zip} onChange={onChange} placeholder="28001" />
        </Field>
        <div className="col-span-2">
          <Field label={`${t('seller.city')} *`} error={errors.origin_city}>
            <Input name="origin_city" value={form.origin_city} onChange={onChange} placeholder="Madrid" />
          </Field>
        </div>
      </div>
      <Field label={`${t('seller.country')} *`} error={errors.origin_country}>
        <Input name="origin_country" value={form.origin_country} onChange={onChange} />
      </Field>
    </div>
  );
};

export default StepShipping;