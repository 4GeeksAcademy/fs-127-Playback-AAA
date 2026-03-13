import { useEffect, useState } from "react";
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

    setMessage("Dirección guardada correctamente");
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
      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-6">Mis Direcciones</h2>

        <div className="space-y-6">
          {addresses.map((addr, index) => (
            <div
              key={addr.id}
              className={`border p-4 rounded-xl text-sm ${index === 0 ? "border-violet-500 bg-violet-50" : ""}`}
            >
              {index === 0 && (
                <span className="text-xs bg-violet-600 text-white px-2 py-1 rounded mb-2 inline-block">
                  Dirección Principal
                </span>
              )}

              <p className="font-semibold">{addr.full_name}</p>
              <p>{addr.address}</p>
              <p>
                {addr.city}
                {addr.province ? `, ${addr.province}` : ""}
              </p>
              <p>{addr.postal_code}</p>
              <p>{addr.country}</p>
              <p>{addr.phone}</p>

              <div className="flex gap-4 mt-3 text-xs">
                {index !== 0 && (
                  <button
                    onClick={() => setMainAddress(addr.id)}
                    className="text-violet-600 hover:underline"
                  >
                    Usar como principal
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-6">Añadir Nueva Dirección</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "full_name", placeholder: "Nombre completo" },
            { name: "address", placeholder: "Dirección" },
            { name: "phone", placeholder: "Teléfono" },
            { name: "city", placeholder: "Ciudad" },
            { name: "province", placeholder: "Provincia" },
            { name: "municipality", placeholder: "Municipio" },
            { name: "postal_code", placeholder: "Código Postal" },
            { name: "country", placeholder: "País" },
          ].map(({ name, placeholder }) => (
            <input
              key={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full border p-3 rounded-lg"
            />
          ))}
          <button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg transition w-full font-medium">
            Guardar Dirección
          </button>

          {message && <p className="text-green-600 text-sm mt-3">{message}</p>}
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProfileAddresses;
