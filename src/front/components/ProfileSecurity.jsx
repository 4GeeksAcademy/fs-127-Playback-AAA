import { useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import userService from "../services/userService";

const ProfileSecurity = () => {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const [data, error] = await userService.updatePassword(token, form);

    if (error) {
      showToast(error.description || "Error al actualizar la contraseña", "error");
      return;
    }

    showToast("Contraseña actualizada correctamente");
    setForm({ current_password: "", new_password: "", confirm_password: "" });
  };

  return (
    <>
      {toast && (
        <div className={`fixed bottom-6 right-6 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
          toast.type === "error" ? "bg-red-600" : "bg-green-600"
        }`}>
          {toast.type === "error" ? <AlertCircle size={15} /> : <Check size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow border max-w-xl">
        <h2 className="text-lg font-semibold mb-6">Cambiar Contraseña</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" name="current_password" placeholder="Contraseña actual" value={form.current_password} onChange={handleChange} className="w-full border p-2 rounded-lg" />
          <input type="password" name="new_password" placeholder="Nueva contraseña" value={form.new_password} onChange={handleChange} className="w-full border p-2 rounded-lg" />
          <input type="password" name="confirm_password" placeholder="Confirmar contraseña" value={form.confirm_password} onChange={handleChange} className="w-full border p-2 rounded-lg" />

          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
            Actualizar contraseña
          </button>
        </form>
      </div>
    </>
  );
};

export default ProfileSecurity;