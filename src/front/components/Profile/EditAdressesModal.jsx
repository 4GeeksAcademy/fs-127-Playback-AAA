import { useEffect, useRef, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import addressService from "../../services/addressService";
import geoService from "../../services/geoService";

const EditAddressModal = ({ address, onClose, onSaved }) => {
  const { store } = useGlobalReducer();
  const [form, setForm] = useState({ ...address });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [communities, setCommunities] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  const initStep = useRef(0);

  useEffect(() => {
    setForm({ ...address });
    setSelectedCommunity("");
    setSelectedProvince("");
    setSelectedMunicipality("");
    setProvinces([]);
    setMunicipalities([]);
    initStep.current = 0;
    geoService.getCommunities().then(setCommunities);
  }, []); 

  useEffect(() => {
    if (initStep.current !== 0) return;
    if (!address.community_code || !communities.length) return;
    initStep.current = 1;
    setSelectedCommunity(address.community_code);
    setLoadingProvinces(true);
    geoService.getProvinces(address.community_code).then((data) => {
      setProvinces(data);
      setLoadingProvinces(false);
    });
  }, [communities]); 

  useEffect(() => {
    if (initStep.current !== 1) return;
    if (!address.province_code || !provinces.length) return;
    initStep.current = 2;
    setSelectedProvince(address.province_code);
    setLoadingMunicipalities(true);
    geoService.getMunicipalities(address.province_code).then((data) => {
      setMunicipalities(data);
      setLoadingMunicipalities(false);
    });
  }, [provinces]); 


  useEffect(() => {
    if (initStep.current !== 2) return;
    if (!municipalities.length) return;
    initStep.current = 3;
    const found = municipalities.find(
      (m) => (m.ALTERNATIVO_DMUN50 || m.DMUN50) === address.municipality,
    );
    if (found) setSelectedMunicipality(found.CMUN);
  }, [municipalities]); 
  const handleCommunityChange = async (e) => {
    const val = e.target.value;
    setSelectedCommunity(val);
    setSelectedProvince("");
    setSelectedMunicipality("");
    setProvinces([]);
    setMunicipalities([]);
    setForm((prev) => ({
      ...prev,
      community_code: val,
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

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCommunity)
      return setError("Selecciona una comunidad autónoma.");
    if (!selectedProvince) return setError("Selecciona una provincia.");
    if (!selectedMunicipality) return setError("Selecciona un municipio.");

    setLoading(true);
    const token = store.token || localStorage.getItem("token");
    const [data, err] = await addressService.updateAddress(
      token,
      address.id,
      form,
    );
    setLoading(false);
    if (err) return setError("No se pudo guardar. Inténtalo de nuevo.");
    if (onSaved) onSaved(data);
    onClose();
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400";
  const selectClass = `${inputClass} bg-white`;
  const labelClass = "block text-xs text-gray-500 mb-1";
  const sectionTitle =
    "text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Editar dirección
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          {/* — Datos personales — */}
          <div>
            <p className={sectionTitle}>Datos personales</p>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Nombre completo *</label>
                <input
                  name="full_name"
                  value={form.full_name || ""}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Teléfono *</label>
                <input
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* — Dirección — */}
          <div>
            <p className={sectionTitle}>Dirección</p>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Comunidad autónoma *</label>
                <select
                  value={selectedCommunity}
                  onChange={handleCommunityChange}
                  className={selectClass}
                  required
                >
                  <option value="">
                    {communities.length === 0
                      ? "Cargando..."
                      : "Selecciona comunidad"}
                  </option>
                  {communities.map((c) => (
                    <option key={c.CCOM} value={c.CCOM}>
                      {c.COM}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Provincia *</label>
                {selectedCommunity ? (
                  <select
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    disabled={loadingProvinces}
                    className={selectClass}
                    required
                  >
                    <option value="">
                      {loadingProvinces
                        ? "Cargando..."
                        : "Selecciona provincia"}
                    </option>
                    {provinces.map((p) => (
                      <option key={p.CPRO} value={p.CPRO}>
                        {p.ALTERNATIVO_PRO || p.PRO}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="province"
                    value={form.province || ""}
                    onChange={handleChange}
                    className={inputClass}
                    readOnly
                  />
                )}
              </div>

              <div>
                <label className={labelClass}>Municipio *</label>
                {selectedProvince ? (
                  <select
                    value={selectedMunicipality}
                    onChange={handleMunicipalityChange}
                    disabled={loadingMunicipalities}
                    className={selectClass}
                    required
                  >
                    <option value="">
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
                ) : (
                  <input
                    name="municipality"
                    value={form.municipality || ""}
                    onChange={handleChange}
                    className={inputClass}
                    readOnly
                  />
                )}
              </div>

              <div>
                <label className={labelClass}>Código postal *</label>
                <input
                  name="postal_code"
                  value={form.postal_code || ""}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Dirección *</label>
                <input
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                  placeholder="Calle, número, piso..."
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>País *</label>
                <input
                  name="country"
                  value={form.country || ""}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-4 py-2 text-sm text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-60 transition"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAddressModal;
