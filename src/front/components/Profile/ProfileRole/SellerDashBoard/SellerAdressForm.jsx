import { useEffect, useState } from "react";
import SellerAddressFormModal from "./SellerAdressFormModal";

const Toast = ({ visible }) => (
  <div
    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg transition-all duration-300 ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
    }`}
  >
    <span className="text-green-400">✓</span>
    Dirección guardada
  </div>
);

const SellerAdressForm = ({ form, onChange, onLocationChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 2500);
    return () => clearTimeout(t);
  }, [showToast]);

  const hasAddress = !!(form.origin_city || form.origin_address);

  // Cuando el modal guarda, propagamos todos los cambios al form padre
const handleSave = (localForm) => {
    console.log("localForm recibido:", localForm); 
  setShowToast(true);
  onLocationChange({
    origin_city:           localForm.origin_city || "",
    origin_zip:            localForm.origin_zip || "",
    origin_community_code: localForm.origin_community_code || "",
    origin_province_code:  localForm.origin_province_code || "",
    origin_address:        localForm.origin_address || "",   // ← añade estos
    origin_country:        localForm.origin_country || "",   // ← añade estos
  });
};

  return (
    <>
    <Toast visible={showToast} />
    <div className="space-y-3">

      {/* Tarjeta de dirección guardada */}
      {hasAddress ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-0.5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Dirección actual
          </p>
          {form.origin_address && (
            <p className="text-sm text-gray-700">{form.origin_address}</p>
          )}
          <p className="text-sm text-gray-700">
            {form.origin_city}
            {form.origin_zip ? ` · ${form.origin_zip}` : ""}
          </p>
          {form.origin_country && (
            <p className="text-sm text-gray-500">{form.origin_country}</p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-400">No hay dirección guardada</p>
        </div>
      )}

      {/* Botón para abrir el modal */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
      >
        <span>✏️</span>
        {hasAddress ? "Modificar dirección" : "Añadir dirección"}
      </button>

      {/* Modal */}
      <SellerAddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialForm={form}
      />
    </div>
    </>
  );
};

export default SellerAdressForm;
