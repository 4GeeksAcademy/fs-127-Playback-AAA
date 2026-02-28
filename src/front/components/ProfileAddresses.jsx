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
    country: ""
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
        country: ""
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

  const mainAddress = addresses[0];
  const otherAddresses = addresses.slice(1);

  return (
    <div className="space-y-12 max-w-4xl mx-auto px-4">

      {/* DIRECCIÓN PRINCIPAL */}
      {mainAddress && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-6">
            Dirección Principal
          </h2>

          <div className="space-y-2 text-sm">
            <p><strong>{mainAddress.full_name}</strong></p>
            <p>{mainAddress.address}</p>
            <p>{mainAddress.city}, {mainAddress.province}</p>
            <p>{mainAddress.postal_code}</p>
            <p>{mainAddress.country}</p>
            <p>{mainAddress.phone}</p>

            <button
              onClick={() => handleDelete(mainAddress.id)}
              className="text-red-600 text-xs mt-4 hover:underline"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* OTRAS DIRECCIONES */}
      {otherAddresses.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-6">
            Otras Direcciones
          </h2>

          <div className="space-y-6">
            {otherAddresses.map((addr) => (
              <div key={addr.id} className="border p-4 rounded-xl text-sm">
                <p><strong>{addr.full_name}</strong></p>
                <p>{addr.address}</p>
                <p>{addr.city}, {addr.province}</p>
                <p>{addr.postal_code}</p>
                <p>{addr.country}</p>
                <p>{addr.phone}</p>

                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-red-600 text-xs mt-2 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORMULARIO */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-6">
          Añadir Nueva Dirección
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nombre completo" className="w-full border p-3 rounded-lg" />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Dirección" className="w-full border p-3 rounded-lg" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" className="w-full border p-3 rounded-lg" />
          <input name="city" value={form.city} onChange={handleChange} placeholder="Ciudad" className="w-full border p-3 rounded-lg" />
          <input name="province" value={form.province} onChange={handleChange} placeholder="Provincia" className="w-full border p-3 rounded-lg" />
          <input name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="Código Postal" className="w-full border p-3 rounded-lg" />
          <input name="country" value={form.country} onChange={handleChange} placeholder="País" className="w-full border p-3 rounded-lg" />

          <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition w-full">
            Guardar Dirección
          </button>

          {message && (
            <p className="text-green-600 text-sm mt-3">{message}</p>
          )}
        </form>
      </div>

    </div>
  );
};

export default ProfileAddresses;