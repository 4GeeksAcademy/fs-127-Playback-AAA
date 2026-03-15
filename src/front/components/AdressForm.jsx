import { useEffect, useRef, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import addressService from "../services/addressService";
import geoService from "../services/geoService";

const EMPTY_FORM = {
  full_name: "",
  phone: "",
  street: "",
  number: "",
  floor: "",
  door: "",
  extra: "",
  city: "",
  community: "",
  province: "",
  municipality: "",
  postal_code: "",
  country: "España",
};

const Toast = ({ visible, message, type = "success" }) => (
  <div
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 text-white text-sm rounded-xl shadow-lg transition-all duration-300 ${
      type === "success" ? "bg-gray-900" : "bg-red-600"
    } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
  >
    <span>{type === "success" ? "✓" : "✕"}</span>
    {message}
  </div>
);

const SectionTitle = ({ title }) => (
  <div className="flex items-center gap-3 pt-2">
    <p className="text-xs font-semibold tracking-widest uppercase text-gray-400">
      {title}
    </p>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

export const AddressForm = ({ onSaved }) => {
  const { store } = useGlobalReducer();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const [communities, setCommunities] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  const toastTimer = useRef(null);

  const showToast = (message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      2500,
    );
  };

  useEffect(() => {
    geoService.getCommunities().then(setCommunities);
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCommunityChange = async (e) => {
    const val = e.target.value;
    const selected = communities.find((c) => c.CCOM === val); // ← añade esta línea
    setSelectedCommunity(val);
    setSelectedProvince("");
    setSelectedMunicipality("");
    setProvinces([]);
    setMunicipalities([]);
    setForm((prev) => ({
      ...prev,
      community_code: val,
      community: selected?.COM || "",
      province_code: "",
      province: "",
      municipality: "",
      city: "",
      postal_code: "",
    }));
    setLoadingProvinces(true);
    const data = await geoService.getProvinces(val);
    setProvinces(data);
    setLoadingProvinces(false);
  };

  const handleProvinceChange = async (e) => {
    const val = e.target.value;
    const selected = provinces.find((p) => p.CPRO === val);
    setSelectedProvince(val);
    setSelectedMunicipality("");
    setMunicipalities([]);
    setForm((prev) => ({
      ...prev,
      province_code: val,
      province: selected?.ALTERNATIVO_PRO || selected?.PRO || "",
      municipality: "",
      city: "",
      postal_code: "",
    }));
    setLoadingMunicipalities(true);
    const data = await geoService.getMunicipalities(val);
    setMunicipalities(data);
    setLoadingMunicipalities(false);
  };

  const handleMunicipalityChange = async (e) => {
    const val = e.target.value;
    const selected = municipalities.find((m) => m.CMUN === val);
    setSelectedMunicipality(val);
    const name = selected?.ALTERNATIVO_DMUN50 || selected?.DMUN50 || "";
    setForm((prev) => ({ ...prev, municipality: name, city: name }));
    const cp = await geoService.getPostalCode(val, selectedProvince);
    if (cp) setForm((prev) => ({ ...prev, postal_code: cp }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const addressParts = [
      form.street,
      form.number,
      form.floor,
      form.door,
      form.extra,
    ]
      .filter(Boolean)
      .join(", ");
    const token = store.token || localStorage.getItem("token");
    const [data, err] = await addressService.createAddress(token, {
      ...form,
      address: addressParts,
    });
    setLoading(false);

    if (err) {
      showToast("Error al guardar la dirección", "error");
      return;
    }

    showToast("Dirección guardada correctamente");
    setForm(EMPTY_FORM);
    setSelectedCommunity("");
    setSelectedProvince("");
    setSelectedMunicipality("");
    setProvinces([]);
    setMunicipalities([]);
    if (onSaved) onSaved(data);
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition";
  const selectClass = `${inputClass} bg-white`;
  const disabledSelect = `${selectClass} opacity-50 cursor-not-allowed`;

  return (
    <>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <SectionTitle title="Datos de contacto" />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 col-span-2">
            <label className="block text-xs font-medium text-gray-500">
              Nombre completo<span className="text-violet-500 ml-0.5">*</span>
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Ej: María García López"
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">
              Teléfono<span className="text-violet-500 ml-0.5">*</span>
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Ej: 612 345 678"
              required
              className={inputClass}
            />
          </div>
        </div>

        <SectionTitle title="Dirección" />
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">
              Comunidad autónoma
              <span className="text-violet-500 ml-0.5">*</span>
            </label>
            <select
              value={selectedCommunity}
              onChange={handleCommunityChange}
              required
              className={selectClass}
            >
              <option value="" disabled>
                Selecciona comunidad
              </option>
              {communities.map((c) => (
                <option key={c.CCOM} value={c.CCOM}>
                  {c.COM}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">
                Provincia<span className="text-violet-500 ml-0.5">*</span>
              </label>
              <select
                value={selectedProvince}
                onChange={handleProvinceChange}
                disabled={!provinces.length}
                required
                className={provinces.length ? selectClass : disabledSelect}
              >
                <option value="" disabled>
                  {loadingProvinces ? "Cargando..." : "Selecciona provincia"}
                </option>
                {provinces.map((p) => (
                  <option key={p.CPRO} value={p.CPRO}>
                    {p.ALTERNATIVO_PRO || p.PRO}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">
                Municipio<span className="text-violet-500 ml-0.5">*</span>
              </label>
              <select
                value={selectedMunicipality}
                onChange={handleMunicipalityChange}
                disabled={!municipalities.length}
                required
                className={municipalities.length ? selectClass : disabledSelect}
              >
                <option value="" disabled>
                  {loadingMunicipalities
                    ? "Cargando..."
                    : "Selecciona municipio"}
                </option>
                {municipalities.map((m) => (
                  <option key={m.CMUN} value={m.CMUN}>
                    {m.ALTERNATIVO_DMUN50 || m.DMUN50}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">
                Código postal<span className="text-violet-500 ml-0.5">*</span>
              </label>
              <input
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                placeholder="Ej: 28001"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">
                País<span className="text-violet-500 ml-0.5">*</span>
              </label>
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="País"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">
              Calle<span className="text-violet-500 ml-0.5">*</span>
            </label>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="Ej: Calle Mayor"
              required
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">
                Número<span className="text-violet-500 ml-0.5">*</span>
              </label>
              <input
                name="number"
                value={form.number}
                onChange={handleChange}
                placeholder="Ej: 12"
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">
                Piso
              </label>
              <input
                name="floor"
                value={form.floor}
                onChange={handleChange}
                placeholder="Ej: 3º"
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500">
                Puerta
              </label>
              <input
                name="door"
                value={form.door}
                onChange={handleChange}
                placeholder="Ej: B"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">
              Información adicional
            </label>
            <input
              name="extra"
              value={form.extra}
              onChange={handleChange}
              placeholder="Escalera, bloque, referencias..."
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Guardando...
            </>
          ) : (
            "Guardar dirección"
          )}
        </button>
      </form>
    </>
  );
};
