import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import { getSellerProfileService, updateSellerProfileService } from "../../../../services/sellerService";
import SellerAdressForm from "./SellerAdressForm";

const SettingsTab = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getSellerProfileService(store.token)
      .then((data) => setForm({
        store_name:             data.store_name || "",
        description:            data.description || "",
        phone:                  data.phone || "",
        origin_address:         data.origin_address || "",
        origin_city:            data.origin_city || "",
        origin_zip:             data.origin_zip || "",
        origin_country:         data.origin_country || "",
        origin_community_code:  data.origin_community_code || "",
        origin_province_code:   data.origin_province_code || "",
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("saving");
    try {
      await updateSellerProfileService(store.token, form);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (loading)
    return (
      <p className="text-center text-sm text-faint mt-10">
        {t("dashboard.settings.loading")}
      </p>
    );

  return (
    <form onSubmit={handleSave} className="pt-6 space-y-6">
      <div className="border border-main rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-main">
          {t("dashboard.settings.storeInfo")}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-faint mb-1">
              {t("dashboard.settings.storeName")}
            </label>
            <input name="store_name" value={form.store_name} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="block text-xs text-faint mb-1">
              {t("dashboard.settings.phone")}
            </label>
            <input name="phone" value={form.phone} onChange={handleChange} className="input" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-faint mb-1">
            {t("dashboard.settings.description")}
          </label>
          <textarea
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            className="input resize-none"
          />
        </div>

        {/* Dirección con desplegables */}
        <div className="border-t border-main pt-4">
          <h4 className="text-xs text-faint mb-3 font-medium">
            {t("dashboard.settings.originAddress")}
          </h4>
          <SellerAdressForm
            form={form}
            onChange={handleChange}
            onLocationChange={(fields) => setForm(prev => ({ ...prev, ...fields }))}
          />
        </div>
      </div>

      {status === "success" && (
        <p className="text-sm text-emerald-600">{t("dashboard.settings.success")}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-500">{t("dashboard.settings.error")}</p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="btn-primary py-2 px-5 text-sm"
      >
        {status === "saving"
          ? t("dashboard.settings.saving")
          : t("dashboard.settings.save")}
      </button>
    </form>
  );
};

export default SettingsTab;