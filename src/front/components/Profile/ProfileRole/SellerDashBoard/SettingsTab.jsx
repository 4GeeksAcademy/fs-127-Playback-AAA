import { useState, useEffect } from "react";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import { getSellerProfileService, updateSellerProfileService } from "../../../../services/sellerService";
import SellerAdressForm from "./SellerAdressForm";

const SettingsTab = () => {
  const { store } = useGlobalReducer();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getSellerProfileService(store.token)
      .then((data) => setForm({
        store_name: data.store_name || "",
        description: data.description || "",
        phone: data.phone || "",
        origin_address: data.origin_address || "",
        origin_city: data.origin_city || "",
        origin_zip: data.origin_zip || "",
        origin_country: data.origin_country || "",
        origin_community_code: data.origin_community_code || "",
        origin_province_code: data.origin_province_code || "",
      }))
      .finally(() => setLoading(false));
  }, []);
 // Envia todos los inputs que tenemos seria el equivalente a: setForm({ ...form, phone: "612345678" })
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

  if (loading) return <p className="text-center text-sm text-gray-400 mt-10">Cargando…</p>;

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400";

  return (
    <form onSubmit={handleSave} className="pt-6 space-y-6">
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold">Información de la tienda</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nombre de la tienda</label>
            <input name="store_name" value={form.store_name} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Descripción breve</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange}
            className={`${inputClass} resize-none`} />
        </div>

        {/* Dirección con desplegables */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-xs text-gray-500 mb-3 font-medium">Dirección de origen</h4>
     <SellerAdressForm
  form={form}
  onChange={handleChange}
  onLocationChange={(fields) => setForm(prev => ({ ...prev, ...fields }))}
/>
        </div>
      </div>

      {status === "success" && <p className="text-sm text-emerald-600">✅ Guardado correctamente.</p>}
      {status === "error" && <p className="text-sm text-red-500">❌ Error al guardar.</p>}

      <button type="submit" disabled={status === "saving"}
        className="px-5 py-2 bg-purple-500 text-white text-sm rounded-lg disabled:opacity-60">
        {status === "saving" ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
};

export default SettingsTab;