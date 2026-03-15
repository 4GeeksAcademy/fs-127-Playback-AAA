import { useEffect, useRef, useState } from "react";

const API_KEY = "73cbc448c840ab7c4e8ab0de047dd1b07dd322303dc6c96693f82e335e78d53d";

const SellerAddressFormModal = ({ isOpen, onClose, onSave, initialForm }) => {
  const [localForm, setLocalForm] = useState({});

  const [communities, setCommunities] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);

  const initStep = useRef(0);

  // Reset y recarga cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;
    setLocalForm({ ...initialForm });
    setSelectedCommunity("");
    setSelectedProvince("");
    setSelectedMunicipality("");
    setProvinces([]);
    setMunicipalities([]);
    initStep.current = 0;
    fetchCommunities();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Paso 1 — preseleccionar comunidad
  useEffect(() => {
    if (!isOpen || initStep.current !== 0) return;
    if (!localForm.origin_community_code || !communities.length) return;
    initStep.current = 1;
    setSelectedCommunity(localForm.origin_community_code);
    fetchProvinces(localForm.origin_community_code);
  }, [communities, localForm.origin_community_code, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Paso 2 — preseleccionar provincia
  useEffect(() => {
    if (!isOpen || initStep.current !== 1) return;
    if (!localForm.origin_province_code || !provinces.length) return;
    initStep.current = 2;
    setSelectedProvince(localForm.origin_province_code);
    fetchMunicipalities(localForm.origin_province_code);
  }, [provinces, localForm.origin_province_code, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Paso 3 — preseleccionar municipio
  useEffect(() => {
    if (!isOpen || initStep.current !== 2) return;
    if (!municipalities.length) return;
    initStep.current = 3;
    if (localForm.origin_city) {
      const found = municipalities.find(
        (m) => (m.ALTERNATIVO_DMUN50 || m.DMUN50) === localForm.origin_city
      );
      if (found) setSelectedMunicipality(found.CMUN);
    }
  }, [municipalities, localForm.origin_city, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── API helpers ───────────────────────────────────────────────────────────

  const fetchCommunities = async () => {
    try {
      const res = await fetch(
        `https://apiv1.geoapi.es/comunidades?type=JSON&version=2024.01&key=${API_KEY}`
      );
      const data = await res.json();
      setCommunities(data.data || []);
    } catch {
      setCommunities([]);
    }
  };

  const fetchProvinces = async (ccom) => {
    setLoadingProvinces(true);
    try {
      const res = await fetch(
        `https://apiv1.geoapi.es/provincias?CCOM=${ccom}&tipo=JSON&key=${API_KEY}`
      );
      const data = await res.json();
      setProvinces(data.data || []);
    } catch {
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const fetchMunicipalities = async (cpro) => {
    setLoadingMunicipalities(true);
    try {
      const res = await fetch(
        `https://apiv1.geoapi.es/municipios?CPRO=${cpro}&tipo=JSON&key=${API_KEY}`
      );
      const data = await res.json();
      setMunicipalities(data.data || []);
    } catch {
      setMunicipalities([]);
    } finally {
      setLoadingMunicipalities(false);
    }
  };

  const fetchPostalCode = async (cmun, cpro) => {
    try {
      const cmum = cmun.slice(0, -2);
      const res = await fetch(
        `https://apiv1.geoapi.es/codigos_postales?CPRO=${cpro}&CMUM=${cmum}&type=JSON&version=2024.01&key=${API_KEY}`
      );
      const data = await res.json();
      const cp = data.data?.[0]?.CPOS;
      if (cp) setLocalForm((prev) => ({ ...prev, origin_zip: cp }));
    } catch {}
  };

  // ── Handlers de selects ───────────────────────────────────────────────────

  const handleCommunityChange = (e) => {
    const val = e.target.value;
    setSelectedCommunity(val);
    setSelectedProvince("");
    setSelectedMunicipality("");
    setProvinces([]);
    setMunicipalities([]);
    setLocalForm((prev) => ({
      ...prev,
      origin_community_code: val,
      origin_province_code: "",
      origin_city: "",
      origin_zip: "",
    }));
    fetchProvinces(val);
  };

  const handleProvinceChange = (e) => {
    const val = e.target.value;
    setSelectedProvince(val);
    setSelectedMunicipality("");
    setMunicipalities([]);
    setLocalForm((prev) => ({
      ...prev,
      origin_province_code: val,
      origin_city: "",
      origin_zip: "",
    }));
    fetchMunicipalities(val);
  };

  const handleMunicipalityChange = (e) => {
    const val = e.target.value;
    const selected = municipalities.find((m) => m.CMUN === val);
    setSelectedMunicipality(val);
    const city = selected?.ALTERNATIVO_DMUN50 || selected?.DMUN50 || "";
    setLocalForm((prev) => ({ ...prev, origin_city: city }));
    fetchPostalCode(val, selectedProvince);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleSave = () => {
    onSave(localForm);
    onClose();
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400";
  const selectClass = `${inputClass} bg-white`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            📍 Modificar dirección
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* Comunidad */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Comunidad autónoma
            </label>
            <select
              value={selectedCommunity}
              onChange={handleCommunityChange}
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

          {/* Provincia */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Provincia</label>
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              disabled={!provinces.length}
              className={selectClass}
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

          {/* Municipio */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Municipio / Ciudad
            </label>
            <select
              value={selectedMunicipality}
              onChange={handleMunicipalityChange}
              disabled={!municipalities.length}
              className={selectClass}
            >
              <option value="" disabled>
                {loadingMunicipalities ? "Cargando..." : "Selecciona municipio"}
              </option>
              {municipalities.map((m) => (
                <option key={m.CMUN} value={m.CMUN}>
                  {m.ALTERNATIVO_DMUN50 || m.DMUN50}
                </option>
              ))}
            </select>
          </div>

          {/* Código postal */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Código postal
            </label>
            <input
              name="origin_zip"
              value={localForm.origin_zip || ""}
              onChange={handleInputChange}
              placeholder="Código postal"
              className={inputClass}
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Dirección</label>
            <input
              name="origin_address"
              value={localForm.origin_address || ""}
              onChange={handleInputChange}
              placeholder="Calle y número"
              className={inputClass}
            />
          </div>

          {/* País */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">País</label>
            <input
              name="origin_country"
              value={localForm.origin_country || ""}
              onChange={handleInputChange}
              placeholder="País"
              className={inputClass}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Guardar dirección
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerAddressFormModal;