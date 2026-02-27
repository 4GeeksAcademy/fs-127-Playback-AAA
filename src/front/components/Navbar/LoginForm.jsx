import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { loginService } from "../../services/authService";
import favoriteServices from "../../services/favoriteService";
import { useTranslation } from "react-i18next";

export const LoginForm = ({ onSuccess }) => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const [data, error] = await loginService(form);

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

    dispatch({
      type: "login",
      payload: { token: data.token, user: data.user },
    });

    // Cargar favoritos de la DB
    const [favorites] = await favoriteServices.getFavorites(data.token);
    if (favorites) {
      dispatch({ type: "set_favorites", payload: favorites });
    }
    if (onSuccess) onSuccess();
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-input text-theme-text placeholder-theme-faint focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
      />

      <input
        type="password"
        name="password"
        placeholder={t("navbar.passwordPlaceholder")}
        value={form.password}
        onChange={handleChange}
        required
        className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-input text-theme-text placeholder-theme-faint focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? t("home.loading") : t("navbar.loginButton")}
      </button>
    </form>
  );
};
