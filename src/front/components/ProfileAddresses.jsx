import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../hooks/useGlobalReducer";
import addressService from "../services/addressService";

const EMPTY_FORM = {
  address: "",
  full_name: "",
  phone: "",
  city: "",
  province: "",
  municipality: "",
  postal_code: "",
  country: "",
};

const ProfileAddresses = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const token = store.token || localStorage.getItem("token");
    const [data, err] = await addressService.getAddresses(token);
    if (data) setAddresses(data);
    if (err) setError(err);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const token = store.token || localStorage.getItem("token");
    const [data, err] = await addressService.createAddress(token, form);

    if (err) {
      setError(err);
      return;
    }

    setMessage(t("profile.addresses.saved"));
    setForm(EMPTY_FORM);
    fetchAddresses();
  };

  const handleDelete = async (id) => {
    const token = store.token || localStorage.getItem("token");
    const [, err] = await addressService.deleteAddress(token, id);
    if (err) {
      setError(err);
      return;
    }
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
      {/* DIRECCIONES */}
      <div className="bg-main p-8 rounded-2xl shadow-sm border border-main">
        <h2 className="text-lg font-semibold mb-6 text-main"> {t("profile.addresses.title")} </h2>

        <div className="space-y-6">
          {addresses.map((addr, index) => (
            <div
              key={addr.id}
              className={`border p-4 rounded-xl text-sm ${ index === 0 ? "border-violet-500 bg-violet-50 dark:bg-violet-950" : "border-main" }`}
            >
              {index === 0 && (
                <span className="text-xs bg-violet-600 text-white px-2 py-1 rounded mb-2 inline-block">
                  {t("profile.addresses.main")}
                </span>
              )}

              <p className="font-semibold text-main">{addr.full_name}</p>
              <p className="text-muted">{addr.address}</p>
              <p className="text-muted">
                {addr.city}
                {addr.province ? `, ${addr.province}` : ""}
              </p>
              <p className="text-muted">{addr.postal_code}</p>
              <p className="text-muted">{addr.country}</p>
              <p className="text-muted">{addr.phone}</p>

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
      <div className="bg-main p-8 rounded-2xl shadow-sm border border-main">
        <h2 className="text-lg font-semibold mb-6 text-main"> {t("profile.addresses.addNew")} </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "full_name", placeholder: t("checkout.addr.fullName") },
            { name: "address", placeholder: t("checkout.addr.address") },
            { name: "phone", placeholder: t("checkout.addr.phone") },
            { name: "city", placeholder: t("checkout.addr.city") },
            { name: "province", placeholder: t("checkout.addr.province") },
            { name: "municipality", placeholder: t("profile.addresses.municipality"), },
            { name: "postal_code", placeholder: t("checkout.addr.postalCode") },
            { name: "country", placeholder: t("checkout.addr.country") },
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
          
          <button className="btn-primary w-full">
            {t("profile.addresses.save")}
          </button>

          {message && ( <p className="text-emerald-600 text-sm mt-3">{message}</p> )}
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProfileAddresses;
