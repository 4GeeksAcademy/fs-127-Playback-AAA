import { useState } from "react";

const ProfileSecurity = () => {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(form)
    });

    alert("Contraseña actualizada");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border max-w-xl">
      <h2 className="text-lg font-semibold mb-6">Cambiar Contraseña</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" name="current_password" placeholder="Contraseña actual" onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input type="password" name="new_password" placeholder="Nueva contraseña" onChange={handleChange} className="w-full border p-2 rounded-lg" />
        <input type="password" name="confirm_password" placeholder="Confirmar contraseña" onChange={handleChange} className="w-full border p-2 rounded-lg" />

        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
          Actualizar contraseña
        </button>
      </form>
    </div>
  );
};

export default ProfileSecurity;