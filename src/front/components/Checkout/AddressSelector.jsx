import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { AddressForm } from "../AdressForm";

const AddressSelector = ({ title, addresses, selected, onSelect, onAddressCreated }) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setShowForm(addresses.length === 0);
  }, [addresses.length]);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-4 text-main">{title}</h2>

      {/* LISTA DE DIRECCIONES */}
      {addresses.map((address) => (
        <div
          key={address.id}
          onClick={() => onSelect(address.id)}
          className={`border rounded-lg p-4 mb-3 cursor-pointer transition ${
            selected === address.id
              ? "border-violet-600 bg-violet-50 dark:bg-violet-950"
              : "border-main hover:border-[rgb(var(--color-border-focus))]"
          }`}
        >
          <p className="font-medium text-main">{address.full_name}</p>
          <p className="text-sm text-muted">{address.address}</p>
          <p className="text-sm text-muted">
            {address.city}{address.province ? `, ${address.province}` : ""}
          </p>
          <p className="text-sm text-muted">{address.postal_code} · {address.country}</p>
          <p className="text-sm text-muted">{address.phone}</p>
        </div>
      ))}

      {/* TOGGLE FORMULARIO */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn-ghost mt-1"
        >
          + {t("checkout.addNewAddress")}
        </button>
      )}

      {/* FORMULARIO */}
      {showForm && (
        <div className="border border-main rounded-lg p-4 mt-3 bg-subtle">
          <h3 className="text-sm font-medium text-main mb-4">
            {t("checkout.newAddress")}
          </h3>
          <AddressForm
            onSaved={(newAddress) => {
              setShowForm(false);
              onAddressCreated(newAddress);
            }}
          />
          {addresses.length > 0 && (
            <button
              onClick={() => setShowForm(false)}
              className="btn-ghost mt-3"
            >
              {t("seller.cancel")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSelector;