import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export const ResetPassword = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!token) {
      setMessage("Token inválido");
      return;
    }

    setLoading(true);

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: token,
          new_password: password,
          confirm_password: confirmPassword
        })
      }
    );

    const data = await res.json();

    if (res.ok) {

      setMessage("Contraseña actualizada correctamente");

      setTimeout(() => {
        navigate("/");
      }, 2000);

    } else {

      setMessage(data.msg || "Error al cambiar contraseña");
      setLoading(false);

    }

  };

  return (

    <div className="max-w-md mx-auto py-20 px-6">

      <h1 className="text-2xl font-semibold mb-6">
        Cambiar contraseña
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-lg"
          required
        />

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border p-3 rounded-lg"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-white w-full py-3 rounded-lg"
        >
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </button>

      </form>

      {message && (
        <p className="text-sm mt-4 text-gray-600">
          {message}
        </p>
      )}

    </div>

  );

};