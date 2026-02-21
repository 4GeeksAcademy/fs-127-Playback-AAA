import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { signupService } from "../services/authService";

export const Signup = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const [data, error] = await signupService(form);

    if (error) {
      alert(error);
      setLoading(false);
      return;
    }

    dispatch({
      type: "login",
      payload: { token: data.token, user: data.user },
    });
    setLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-xl">
          <div className="p-8">
            <h3 className="text-2xl font-semibold text-center mb-6">
              Crear Cuenta
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Tu apellido"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Tu contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  "Registrarse"
                )}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 text-center py-4 rounded-b-xl">
            <span className="text-gray-600">¿Ya tienes cuenta? </span>
            <Link
              to="/login"
              className="text-green-600 hover:underline font-medium"
            >
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
