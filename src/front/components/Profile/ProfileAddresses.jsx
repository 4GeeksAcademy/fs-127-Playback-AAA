import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import addressService from "../../services/addressService";
import { AddressForm } from "./AdressForm";
import EditAddressModal from "./EditAdressesModal";

const ProfileAddresses = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

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
            fetchAddresses();
            setEditingAddress(null);
            setToast(true);
            setTimeout(() => setToast(false), 3000);
          }}
        />
      )}

      {/* DIRECCIONES */}
      <div className="bg-[rgb(var(--color-bg))] p-8 rounded-2xl shadow-sm border border-[rgb(var(--color-border))]">
        <h2 className="text-lg font-semibold mb-6 text-[rgb(var(--color-text))]">
          {t("profile.addresses.title")}
        </h2>

        <div className="space-y-6">
          {addresses.length === 0 && (
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              {t("profile.addresses.empty")}
            </p>
          )}
          {addresses.map((addr, index) => (
            <div
              key={addr.id}
              className="bg-[rgb(var(--color-bg-subtle))] border border-[rgb(var(--color-border))] rounded-xl p-4"
            >
              {index === 0 && (
                <span className="text-xs bg-violet-600 text-white px-2 py-1 rounded mb-3 inline-block">
                  {t("profile.addresses.main")}
                </span>
              )}

              <p className="text-sm font-medium text-[rgb(var(--color-text))] mb-1">
                {addr.full_name}
              </p>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">{addr.address}</p>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {addr.postal_code} {addr.municipality}
                {addr.province ? `, ${addr.province}` : ""}
              </p>
              {addr.community && (
                <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                  {addr.community}
                  {addr.country ? `, ${addr.country}` : ""}
                </p>
              )}
              {addr.phone && (
                <p className="text-sm text-[rgb(var(--color-text-faint))] mt-1">{addr.phone}</p>
              )}

              <div className="flex gap-4 mt-3 text-xs">
                {index !== 0 && (
                  <button
                    onClick={() => setMainAddress(addr.id)}
                    className="text-violet-600 hover:underline"
                  >
                    {t("profile.addresses.setMain")}
                  </button>
                )}
                <button
                  onClick={() => setEditingAddress(addr)}
                  className="text-violet-600 hover:underline"
                >
                  {t("profile.addresses.edit")}
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-red-500 hover:underline"
                >
                  {t("profile.addresses.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-[rgb(var(--color-bg))] p-8 rounded-2xl shadow-sm border border-[rgb(var(--color-border))]">
        <h2 className="text-lg font-semibold mb-6 text-[rgb(var(--color-text))]">
          {t("profile.addresses.addNew")}
        </h2>
        <AddressForm onSaved={fetchAddresses} />
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[rgb(var(--color-bg-subtle))] text-[rgb(var(--color-text))] text-sm px-4 py-3 rounded-xl shadow-lg">
          {t("profile.addresses.saved")}
        </div>
      )}
    </div>
  );
};

export default ProfileAddresses;