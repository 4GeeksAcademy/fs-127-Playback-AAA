import { useState, useEffect } from "react";
import addressService from "../../services/addressService";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const EMPTY_FORM = {
  full_name: "",
  address: "",
  phone: "",
  city: "",
  province: "",
  postal_code: "",
  country: "",
};

const AddressSelector = ({
  title,
  addresses,
  selected,
  onSelect,
  onAddressCreated,
}) => {
  const { store } = useGlobalReducer();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setShowForm(addresses.length === 0);
  }, [addresses.length]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    const required = [
      "full_name",
      "address",
      "phone",
      "city",
      "postal_code",
      "country",
    ];
    for (const field of required) {
      if (!form[field]) {
        setError(`El campo '${field}' es obligatorio`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    const token = store.token || localStorage.getItem("token");
    const [data, err] = await addressService.createAddress(token, form);

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    setForm(EMPTY_FORM);
    setShowForm(false);
    setLoading(false);

    // Notifica al padre para que recargue las direcciones y preselecciona la nueva
    onAddressCreated(data);
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-4">{title}</h2>

      {/* LISTA DE DIRECCIONES */}
      {addresses.map((address) => (
        <div
          key={address.id}
          onClick={() => onSelect(address.id)}
          className={`border rounded-lg p-4 mb-3 cursor-pointer transition
                    ${
                      selected === address.id
                        ? "border-violet-600 bg-violet-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
        >
          <p className="font-medium">{address.full_name}</p>
          <p className="text-sm text-stone-500">{address.address}</p>
          <p className="text-sm text-stone-500">
            {address.city}
            {address.province ? `, ${address.province}` : ""}
          </p>
          <p className="text-sm text-stone-500">
            {address.postal_code} · {address.country}
          </p>
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

      {/* FORMULARIO RÁPIDO */}
      {showForm && (
        <div className="border rounded-lg p-4 mt-3 space-y-3 bg-gray-50">
          <h3 className="text-sm font-medium text-stone-700">
            Nueva dirección
          </h3>

          {[
            { name: "full_name", placeholder: "Nombre completo" },
            { name: "address", placeholder: "Dirección" },
            { name: "phone", placeholder: "Teléfono" },
            { name: "city", placeholder: "Ciudad" },
            { name: "province", placeholder: "Provincia (opcional)" },
            { name: "postal_code", placeholder: "Código postal" },
            { name: "country", placeholder: "País" },
          ].map(({ name, placeholder }) => (
            <input
              key={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full border rounded-lg p-2 text-sm"
            />
          ))}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            {addresses.length > 0 && (
              <button
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="text-sm text-stone-500 hover:underline"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
