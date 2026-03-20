// ── StepShipping ──────────────────────────────────────────────────────────────
// Paso 1 del wizard — dirección de origen (con GeoAPI)

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import geoService from '../../../../services/geoService';
import { Field, Input } from './FormFields';

const selectBase =
  'w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ' +
  'focus:ring-violet-400 transition border-[rgb(var(--color-border))] ' +
  'bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text))]';
const selectDisabled = `${selectBase} opacity-50 cursor-not-allowed`;

const StepShipping = ({ form, errors, onChange }) => {
  const { t } = useTranslation();

  const [communities,   setCommunities]   = useState([]);
  const [provinces,     setProvinces]     = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [selCommunity,  setSelCommunity]  = useState('');
  const [selProvince,   setSelProvince]   = useState('');
  const [selMunicipality, setSelMunicipality] = useState('');
  const [loadingProv,   setLoadingProv]   = useState(false);
  const [loadingMun,    setLoadingMun]    = useState(false);

  // Helper: dispara onChange con evento sintético
  const set = (name, value) => onChange({ target: { name, value } });

  useEffect(() => {
    geoService.getCommunities().then(setCommunities);
  }, []);

  const handleCommunityChange = async (e) => {
    const val = e.target.value;
    const found = communities.find((c) => c.CCOM === val);
    setSelCommunity(val);
    setSelProvince('');
    setSelMunicipality('');
    setProvinces([]);
    setMunicipalities([]);
    set('origin_community_code', val);
    set('origin_community',      found?.COM || '');
    set('origin_province_code',  '');
    set('origin_province',       '');
    set('origin_city',           '');
    set('origin_zip',            '');
    setLoadingProv(true);
    setProvinces(await geoService.getProvinces(val));
    setLoadingProv(false);
  };

  const handleProvinceChange = async (e) => {
    const val = e.target.value;
    const found = provinces.find((p) => p.CPRO === val);
    setSelProvince(val);
    setSelMunicipality('');
    setMunicipalities([]);
    set('origin_province_code', val);
    set('origin_province',      found?.ALTERNATIVO_PRO || found?.PRO || '');
    set('origin_city',          '');
    set('origin_zip',           '');
    setLoadingMun(true);
    setMunicipalities(await geoService.getMunicipalities(val));
    setLoadingMun(false);
  };

  const handleMunicipalityChange = async (e) => {
    const val = e.target.value;
    const found = municipalities.find((m) => m.CMUN === val);
    setSelMunicipality(val);
    const name = found?.ALTERNATIVO_DMUN50 || found?.DMUN50 || '';
    set('origin_city', name);
    const cp = await geoService.getPostalCode(val, selProvince);
    if (cp) set('origin_zip', cp);
  };

  return (
    <div className="space-y-4">

      {/* Comunidad autónoma */}
      <Field label={`${t('seller.community')} *`} error={errors.origin_community_code}>
        <select value={selCommunity} onChange={handleCommunityChange} required className={selectBase}>
          <option value="" disabled>{t('seller.selectCommunity')}</option>
          {communities.map((c) => (
            <option key={c.CCOM} value={c.CCOM}>{c.COM}</option>
          ))}
        </select>
      </Field>

      {/* Provincia + Municipio */}
      <div className="grid grid-cols-2 gap-3">
        <Field label={`${t('seller.province')} *`} error={errors.origin_province}>
          <select
            value={selProvince}
            onChange={handleProvinceChange}
            disabled={!provinces.length}
            required
            className={provinces.length ? selectBase : selectDisabled}
          >
            <option value="" disabled>
              {loadingProv ? t('common.loading') : t('seller.selectProvince')}
            </option>
            {provinces.map((p) => (
              <option key={p.CPRO} value={p.CPRO}>{p.ALTERNATIVO_PRO || p.PRO}</option>
            ))}
          </select>
        </Field>

        <Field label={`${t('seller.municipality')} *`} error={errors.origin_city}>
          <select
            value={selMunicipality}
            onChange={handleMunicipalityChange}
            disabled={!municipalities.length}
            required
            className={municipalities.length ? selectBase : selectDisabled}
          >
            <option value="" disabled>
              {loadingMun ? t('common.loading') : t('seller.selectMunicipality')}
            </option>
            {municipalities.map((m) => (
              <option key={m.CMUN} value={m.CMUN}>{m.ALTERNATIVO_DMUN50 || m.DMUN50}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* CP + País */}
      <div className="grid grid-cols-2 gap-3">
        <Field label={`${t('seller.zip')} *`} error={errors.origin_zip}>
          <Input name="origin_zip" value={form.origin_zip} onChange={onChange} placeholder="28001" />
        </Field>
        <Field label={`${t('seller.country')} *`} error={errors.origin_country}>
          <Input name="origin_country" value={form.origin_country} onChange={onChange} />
        </Field>
      </div>

      {/* Calle */}
      <Field label={`${t('seller.address')} *`} error={errors.origin_address}>
        <Input
          name="origin_address"
          value={form.origin_address}
          onChange={onChange}
          placeholder="Calle Mayor 12"
        />
      </Field>

    </div>
  );
};

export default StepShipping;