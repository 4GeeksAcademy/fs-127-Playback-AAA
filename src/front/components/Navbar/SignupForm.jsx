import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { signupService } from "../../services/authService";
import { useTranslation } from "react-i18next";

export const SignupForm = ({ onSuccess }) => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

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
    if (onSuccess) onSuccess();
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          name="name"
          placeholder={t("navbar.namePlaceholder")}
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-input text-theme-text placeholder-theme-faint focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
        />
        <input
          type="text"
          name="last_name"
          placeholder={t("navbar.lastNamePlaceholder")}
          value={form.last_name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-input text-theme-text placeholder-theme-faint focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
        />
      </div>

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
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t("home.loading")}
          </>
        ) : (
          t("navbar.signupButton")
        )}
      </button>
    </form>
  );
};
