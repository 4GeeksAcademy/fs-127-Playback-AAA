import { useState, useEffect } from "react";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import { getSellerProfileService, updateSellerProfileService } from "../../../../services/sellerService";
import { useTranslation } from 'react-i18next';

const SettingsTab = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getSellerProfileService(store.token)
      .then((data) => setForm({
          store_name: data.store_name || '',
          description: data.description || '',
          phone: data.phone || '',
          origin_address: data.origin_address || '',
          origin_city: data.origin_city || '',
          origin_zip: data.origin_zip || '',
          origin_country: data.origin_country || '',
        }))
      .finally(() => setLoading(false));
  }, []);
  // Envia todos los inputs que tenemos seria el equivalente a: setForm({ ...form, phone: "612345678" })
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });


  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await updateSellerProfileService(store.token, form);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (loading)
    return (
      <p className="text-center text-sm text-faint mt-10">
        {t('dashboard.settings.loading')}
      </p>
    );

  return (
    <form onSubmit={handleSave} className="pt-6 space-y-6">
      <div className="border border-main rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-main">
          {t('dashboard.settings.storeInfo')}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-faint mb-1">
              {t('dashboard.settings.storeName')}
            </label>
            <input
              name="store_name"
              value={form.store_name}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-faint mb-1">
              {t('dashboard.settings.phone')}
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-faint mb-1">
              {t('dashboard.settings.address')}
            </label>
            <input
              name="origin_address"
              value={form.origin_address}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-faint mb-1">
              {t('dashboard.settings.city')}
            </label>
            <input
              name="origin_city"
              value={form.origin_city}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-faint mb-1">
              {t('dashboard.settings.zip')}
            </label>
            <input
              name="origin_zip"
              value={form.origin_zip}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-faint mb-1">
              {t('dashboard.settings.country')}
            </label>
            <input
              name="origin_country"
              value={form.origin_country}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-faint mb-1">
            {t('dashboard.settings.description')}
          </label>
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            className="input resize-none"
          />
        </div>
      </div>

      {status === 'success' && (
        <p className="text-sm text-emerald-600">
          {t('dashboard.settings.success')}
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-500">{t('dashboard.settings.error')}</p>
      )}

      <button
        type="submit"
        disabled={status === 'saving'}
        className="btn-primary py-2 px-5 text-sm"
      >
        {status === 'saving'
          ? t('dashboard.settings.saving')
          : t('dashboard.settings.save')}
      </button>
    </form>
  );
};

export default SettingsTab;
