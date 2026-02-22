import React, { useEffect, useState } from "react";

const ProfileInfo = () => {
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    name: "",
    last_name: "",
    email: "",
    image_url: ""
  });

  const [imagePreview, setImagePreview] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({
    street: "",
    city: "",
    postal_code: "",
    country: ""
  });

  // =========================
  // CARGAR PERFIL
  // =========================
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => setUser(data));

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/address`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => setAddresses(data));
  }, []);

  // =========================
  // UPDATE DATOS USUARIO
  // =========================
  const handleChangeUser = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          name: user.name,
          last_name: user.last_name,
          email: user.email
        })
      }
    );

    if (response.ok) alert("Perfil actualizado");
  };

  // =========================
  // SUBIR IMAGEN
  // =========================
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/profile/image`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token
        },
        body: formData
      }
    );

    const data = await response.json();

    if (response.ok) {
      setUser(prev => ({
        ...prev,
        image_url: data.image_url
      }));
    }
  };

  // =========================
  // DIRECCIONES
  // =========================
  const handleChangeAddress = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();

    const response = await fetch(
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

    if (response.ok) {
      const newAddress = await response.json();
      setAddresses([...addresses, newAddress]);
      setForm({ street: "", city: "", postal_code: "", country: "" });
    }
  };

  const handleDeleteAddress = async (id) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/address/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      }
    );

    if (response.ok) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  return (
    <div className="space-y-10 max-w-3xl">

      {/* ================== PERFIL ================== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-6">Información Personal</h2>

        <div className="flex flex-col items-center mb-8">
          <img
            src={
              imagePreview ||
              user.image_url ||
              "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border border-gray-300 mb-4"
          />

          <label className="cursor-pointer text-sm text-gray-600 hover:text-black">
            Cambiar imagen
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmitUser} className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            value={user.name}
            onChange={handleChangeUser}
            placeholder="Nombre"
            className="border border-gray-300 rounded-lg p-2"
          />

          <input
            name="last_name"
            value={user.last_name}
            onChange={handleChangeUser}
            placeholder="Apellido"
            className="border border-gray-300 rounded-lg p-2"
          />

          <input
            name="email"
            value={user.email}
            onChange={handleChangeUser}
            placeholder="Email"
            className="border border-gray-300 rounded-lg p-2 md:col-span-2"
          />

          <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 md:col-span-2">
            Guardar cambios
          </button>
        </form>
      </div>

      {/* ================== DIRECCIONES ================== */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-6">Direcciones</h2>

        <form onSubmit={handleSubmitAddress} className="grid md:grid-cols-2 gap-4 mb-8">
          <input
            name="street"
            value={form.street}
            onChange={handleChangeAddress}
            placeholder="Calle"
            className="border border-gray-300 rounded-lg p-2"
            required
          />

          <input
            name="city"
            value={form.city}
            onChange={handleChangeAddress}
            placeholder="Ciudad"
            className="border border-gray-300 rounded-lg p-2"
            required
          />

          <input
            name="postal_code"
            value={form.postal_code}
            onChange={handleChangeAddress}
            placeholder="Código Postal"
            className="border border-gray-300 rounded-lg p-2"
            required
          />

          <input
            name="country"
            value={form.country}
            onChange={handleChangeAddress}
            placeholder="País"
            className="border border-gray-300 rounded-lg p-2"
            required
          />

          <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 md:col-span-2">
            Agregar dirección
          </button>
        </form>

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <p className="text-gray-500">No tienes direcciones guardadas</p>
          ) : (
            addresses.map(addr => (
              <div
                key={addr.id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between"
              >
                <div>
                  <p className="font-medium">{addr.street}</p>
                  <p className="text-sm text-gray-500">
                    {addr.city} · {addr.postal_code} · {addr.country}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default ProfileInfo;