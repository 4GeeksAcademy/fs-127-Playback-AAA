import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import addressService from "../services/addressService";
import { AddressForm } from "../components/AdressForm";
import EditAddressModal from "../components/EditAdressesModal";

const ProfileAddresses = () => {
  const { store } = useGlobalReducer();
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [toast, setToast] = useState(false);


  useEffect(() => { fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    const token = store.token || localStorage.getItem("token");
    const [data] = await addressService.getAddresses(token);
    if (data) setAddresses(data);
  };

  const handleDelete = async (id) => {
    const token = store.token || localStorage.getItem("token");
    await addressService.deleteAddress(token, id);
    fetchAddresses();
  };

  const setMainAddress = (id) => {
    setAddresses([
      ...addresses.filter((a) => a.id === id),
      ...addresses.filter((a) => a.id !== id),
    ]);
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto px-4 py-10">

      {editingAddress && (
        <EditAddressModal
          address={editingAddress}
          onClose={() => setEditingAddress(null)}
          onSaved={() => {
            fetchAddresses(); setEditingAddress(null);
            setToast(true);
            setTimeout(() => setToast(false), 3000);
          }}
        />
      )}

      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-6">Mis Direcciones</h2>
        <div className="space-y-6">
          {addresses.length === 0 && <p className="text-sm text-gray-400">No tienes direcciones guardadas.</p>}
          {addresses.map((addr, index) => (
            <div key={addr.id} className={`border p-4 rounded-xl text-sm ${index === 0 ? "border-violet-500 bg-violet-50" : ""}`}>
              {index === 0 && <span className="text-xs bg-violet-600 text-white px-2 py-1 rounded mb-2 inline-block">Dirección Principal</span>}
              <p className="font-semibold">{addr.full_name}</p>
              <p>{addr.address}</p>
              <p>{addr.municipality}{addr.province ? `, ${addr.province}` : ""}</p>
              <p>{addr.postal_code} {addr.city}</p>
              <p>{addr.country}</p>
              <p>{addr.phone}</p>
              <div className="flex gap-4 mt-3 text-xs">
                {index !== 0 && (
                  <button onClick={() => setMainAddress(addr.id)} className="text-violet-600 hover:underline">
                    Usar como principal
                  </button>
                )}
                <button onClick={() => setEditingAddress(addr)} className="text-violet-600 hover:underline">
                  Editar
                </button>
                <button onClick={() => handleDelete(addr.id)} className="text-red-600 hover:underline">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-6">Añadir Nueva Dirección</h2>
        <AddressForm onSaved={fetchAddresses} />
      </div>
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-black text-white text-sm px-4 py-3 rounded-xl shadow-lg">
          Dirección guardada correctamente
        </div>
      )}

    </div>
  );
};

export default ProfileAddresses;
