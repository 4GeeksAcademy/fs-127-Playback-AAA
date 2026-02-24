import { useEffect, useState } from "react";

const ProfileAddresses = () => {
  const token = localStorage.getItem("token");

  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({
    address: "",
    full_name: "",
    phone: "",
    city: "",
    postal_code: "",
    country: ""
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/address`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => setAddresses(data));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(form)
    });

    const data = await res.json();
    setAddresses([...addresses, data]);
    setForm({ address: "", full_name: "", phone: "", city: "", postal_code: "", country: "" });
  };

  const handleDelete = async (id) => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/address/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    });

    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Agregar Dirección</h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nombre completo" className="border p-2 rounded-lg" required />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" className="border p-2 rounded-lg" required />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Dirección" className="border p-2 rounded-lg md:col-span-2" required />
          <input name="city" value={form.city} onChange={handleChange} placeholder="Ciudad" className="border p-2 rounded-lg" required />
          <input name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="Código Postal" className="border p-2 rounded-lg" required />
          <input name="country" value={form.country} onChange={handleChange} placeholder="País" className="border p-2 rounded-lg" required />
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 md:col-span-2">
            Guardar Dirección
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {addresses.map(addr => (
          <div key={addr.id} className="bg-white p-4 rounded-xl shadow border flex justify-between">
            <div>
              <p className="font-medium">{addr.full_name} — {addr.address}</p>
              <p className="text-sm text-gray-500">
                {addr.city} · {addr.postal_code} · {addr.country}
              </p>
            </div>

            <button
              onClick={() => handleDelete(addr.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileAddresses;