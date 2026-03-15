import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      <h2 className="text-lg font-medium mb-4 text-main">{title}</h2>

      {/* LISTA DE DIRECCIONES */}
      {addresses.map((address) => (
        <div
          key={address.id}
          onClick={() => onSelect(address.id)}
          className={`border rounded-lg p-4 mb-3 cursor-pointer transition
                    ${
                      selected === address.id
                        ? "border-violet-600 bg-violet-50 dark:bg-violet-950"
                        : "border-main hover:border-[rgb(var(--color-border-focus))]"
                    }`}
        >
          <p className="font-medium text-main">{address.full_name}</p>
          <p className="text-sm text-muted">{address.address}</p>
          <p className="text-sm text-muted">
            {address.city}
            {address.province ? `, ${address.province}` : ""}
          </p>
          <p className="text-sm text-muted">
            {address.postal_code} · {address.country}
          </p>
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

      {/* FORMULARIO RÁPIDO */}
      {showForm && (
        <div className="border border-main rounded-lg p-4 mt-3 space-y-3 bg-subtle">
          <h3 className="text-sm font-medium text-main">
            {t("checkout.newAddress")}
          </h3>

          {[
            { name: "full_name",   placeholder: t("checkout.addr.fullName") },
            { name: "address",     placeholder: t("checkout.addr.address") },
            { name: "phone",       placeholder: t("checkout.addr.phone") },
            { name: "city",        placeholder: t("checkout.addr.city") },
            { name: "province",    placeholder: t("checkout.addr.province") },
            { name: "postal_code", placeholder: t("checkout.addr.postalCode") },
            { name: "country",     placeholder: t("checkout.addr.country") },
          ].map(({ name, placeholder }) => (
            <input
              key={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="input"
            />
          ))}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="btn-primary py-2 px-4 text-sm"
            >
              {loading ? t("checkout.saving") : t("checkout.save")}
            </button>
            {addresses.length > 0 && (
              <button
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="btn-ghost"
              >
                {t("seller.cancel")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;