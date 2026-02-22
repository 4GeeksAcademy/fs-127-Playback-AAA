import React, { useState } from "react";

const ProfileSecurity = () => {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/profile/password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(form)
      }
    );

    if (response.ok) {
      alert("Contraseña actualizada");
      setForm({
        current_password: "",
        new_password: "",
        confirm_password: ""
      });
    } else {
      alert("Error al cambiar contraseña");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-xl">
      <h2 className="text-xl font-bold mb-6">Seguridad</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          name="current_password"
          value={form.current_password}
          onChange={handleChange}
          placeholder="Contraseña actual"
          className="w-full border p-2 rounded-lg"
        />

        <input
          type="password"
          name="new_password"
          value={form.new_password}
          onChange={handleChange}
          placeholder="Nueva contraseña"
          className="w-full border p-2 rounded-lg"
        />

        <input
          type="password"
          name="confirm_password"
          value={form.confirm_password}
          onChange={handleChange}
          placeholder="Confirmar contraseña"
          className="w-full border p-2 rounded-lg"
        />

        <button className="bg-black text-white px-6 py-2 rounded-lg">
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
};

export default ProfileSecurity;