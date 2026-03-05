import { useState } from "react";
import { useTranslation } from "react-i18next";
import { forgotPasswordService } from "../../services/authService";

export const ForgotPasswordForm = ({ onChangeView }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const [data, err] = await forgotPasswordService(email);

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    // El backend siempre devuelve 200 aunque el email no exista (seguridad)
    setSuccess(true);
    setLoading(false);
  };

  // Pantalla de confirmación — se muestra tras enviar el email
  if (success) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          {t("navbar.forgotSuccess")}
        </p>
        <button
          onClick={() => onChangeView("login")}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold transition"
        >
          {t("navbar.loginButton")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(null);
        }}
        required
        className="w-full px-4 py-2.5 rounded-xl border border-theme-border bg-theme-input text-theme-text placeholder-theme-faint focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
      />

      {/* Error inline */}
      {error && <p className="text-xs text-red-500 px-1">{error}</p>}

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
          t("navbar.forgotButton")
        )}
      </button>

      {/* Volver al login */}
      <div className="pt-1 text-center text-sm text-theme-muted">
        <button
          type="button"
          onClick={() => onChangeView("login")}
          className="text-violet-600 dark:text-violet-400 font-semibold hover:underline"
        >
          {t("navbar.backToLogin")}
        </button>
      </div>
    </form>
  );
};
