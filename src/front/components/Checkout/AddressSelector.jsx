import { useState, useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { AddressForm } from "../AdressForm";

const AddressSelector = ({ title, addresses, selected, onSelect, onAddressCreated }) => {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setShowForm(addresses.length === 0);
  }, [addresses.length]);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-4">{title}</h2>

      {/* LISTA DE DIRECCIONES */}
      {addresses.map((address) => (
        <div
          key={address.id}
          onClick={() => onSelect(address.id)}
          className={`border rounded-lg p-4 mb-3 cursor-pointer transition ${
            selected === address.id
              ? "border-violet-600 bg-violet-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <p className="font-medium">{address.full_name}</p>
          <p className="text-sm text-stone-500">{address.address}</p>
          <p className="text-sm text-stone-500">
            {address.city}{address.province ? `, ${address.province}` : ""}
          </p>
          <p className="text-sm text-stone-500">{address.postal_code} · {address.country}</p>
          <p className="text-sm text-stone-500">{address.phone}</p>
        </div>
      ))}

      {/* TOGGLE FORMULARIO */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-violet-600 hover:underline mt-1"
        >
          + Añadir nueva dirección
        </button>
      )}

      {/* FORMULARIO */}
      {showForm && (
        <div className="border rounded-lg p-4 mt-3 bg-gray-50">
          <h3 className="text-sm font-medium text-stone-700 mb-4">Nueva dirección</h3>
          <AddressForm
            onSaved={(newAddress) => {
              setShowForm(false);
              onAddressCreated(newAddress);
            }}
          />
          {addresses.length > 0 && (
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-stone-500 hover:underline mt-3"
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSelector;