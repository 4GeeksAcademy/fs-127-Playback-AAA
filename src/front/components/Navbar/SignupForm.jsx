import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { signupService } from "../../services/authService";
import { useTranslation } from "react-i18next";

export const SignupForm = ({ onSuccess }) => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", last_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { t } = useTranslation();

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const [data, error] = await signupService(form);

    if (error) {
      showToast(error);
      setLoading(false);
      return;
    }

    dispatch({ type: "login", payload: { token: data.token, user: data.user } });
    setLoading(false);
    if (onSuccess) onSuccess();
    navigate("/");
  };

  return (
    <>
      {toast && (
        <div className="fixed bottom-6 right-6 bg-red-600 dark:bg-red-500 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <AlertCircle size={15} />
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="name"
            placeholder={t("navbar.namePlaceholder")}
            value={form.name}
            onChange={handleChange}
            required
            className="input focus:ring-2 focus:ring-violet-500 focus:border-transparent rounded-xl px-4 py-2.5"
          />
          <input
            type="text"
            name="last_name"
            placeholder={t("navbar.lastNamePlaceholder")}
            value={form.last_name}
            onChange={handleChange}
            required
            className="input focus:ring-2 focus:ring-violet-500 focus:border-transparent rounded-xl px-4 py-2.5"
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="input focus:ring-2 focus:ring-violet-500 focus:border-transparent rounded-xl px-4 py-2.5"
        />

        <input
          type="password"
          name="password"
          placeholder={t("navbar.passwordPlaceholder")}
          value={form.password}
          onChange={handleChange}
          required
          className="input focus:ring-2 focus:ring-violet-500 focus:border-transparent rounded-xl px-4 py-2.5"
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
    </>
  );
};