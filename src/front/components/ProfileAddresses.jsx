import { useEffect, useState } from "react";

const ProfileAddresses = () => {

  const token = localStorage.getItem("token");

  const [addresses, setAddresses] = useState([]);

  const [form, setForm] = useState({
    address: "",
    full_name: "",
    phone: "",
    city: "",
    province: "",
    municipality: "",
    postal_code: "",
    country: "",
    address_type: "shipping"
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/address`,
      {
        headers: { Authorization: "Bearer " + token }
      }
    );

    const data = await res.json();

    setAddresses(data);

  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/address`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(form)
      }
    );

    if (res.ok) {

      setMessage("Dirección guardada correctamente");

      setForm({
        address: "",
        full_name: "",
        phone: "",
        city: "",
        province: "",
        municipality: "",
        postal_code: "",
        country: "",
        address_type: "shipping"
      });

      fetchAddresses();

    }

  };

  const handleDelete = async (id) => {

    await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/address/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      }
    );

    fetchAddresses();

  };

  const setMainAddress = (id) => {

    const newOrder = [
      ...addresses.filter(a => a.id === id),
      ...addresses.filter(a => a.id !== id)
    ];

    setAddresses(newOrder);

  };

  return (

    <div className="space-y-10 max-w-4xl mx-auto px-4 py-10">

      {/* DIRECCIONES */}

      <div className="bg-white p-8 rounded-2xl shadow-sm border">

        <h2 className="text-lg font-semibold mb-6">
          Mis Direcciones
        </h2>

        <div className="space-y-6">

          {addresses.map((addr, index) => (

            <div
              key={addr.id}
              className={`border p-4 rounded-xl text-sm ${
                index === 0
                  ? "border-violet-500 bg-violet-50"
                  : ""
              }`}
            >

              {index === 0 && (
                <span className="text-xs bg-violet-600 text-white px-2 py-1 rounded mb-2 inline-block">
                  Dirección Principal
                </span>
              )}

              <p className="font-semibold">{addr.full_name}</p>
              <p>{addr.address}</p>
              <p>{addr.city}, {addr.province}</p>
              <p>{addr.postal_code}</p>
              <p>{addr.country}</p>
              <p>{addr.phone}</p>

              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {addr.address_type === "shipping"
                  ? "Envío"
                  : "Facturación"}
              </span>

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

        <h2 className="text-lg font-semibold mb-6">
          Añadir Nueva Dirección
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Nombre completo"
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Dirección"
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Teléfono"
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Ciudad"
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="province"
            value={form.province}
            onChange={handleChange}
            placeholder="Provincia"
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="postal_code"
            value={form.postal_code}
            onChange={handleChange}
            placeholder="Código Postal"
            className="w-full border p-3 rounded-lg"
          />

          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="País"
            className="w-full border p-3 rounded-lg"
          />

          <select
            name="address_type"
            value={form.address_type}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          >

            <option value="shipping">
              Dirección de envío
            </option>

            <option value="billing">
              Dirección de facturación
            </option>

          </select>

          <button
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg transition w-full font-medium"
          >
            Guardar Dirección
          </button>

          {message && (
            <p className="text-green-600 text-sm mt-3">
              {message}
            </p>
          )}

        </form>

      </div>

    </div>

  );

};

export default ProfileAddresses;