import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resetPasswordService } from "../services/authService";

// Página independiente a la que llega el usuario desde el link del email
// El token viene en la URL: /reset-password?token=xxx
export const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Leemos el token de la URL automáticamente — el usuario no tiene que copiarlo
  const tokenFromUrl = searchParams.get("token") || "";

  const [form, setForm] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const [data, err] = await resetPasswordService({
      token: tokenFromUrl,
      ...form,
    });

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  // Pantalla de éxito — redirige al inicio tras confirmar
  if (success) {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-4 text-center">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            {t("navbar.resetSuccess")}
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold transition"
          >
            {t("navbar.goHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-4">
        <p className="text-2xl font-semibold text-main">
          {t("navbar.resetTitle")}
        </p>

        {/* Si no hay token en la URL avisamos al usuario */}
        {!tokenFromUrl && (
          <p className="text-xs text-red-500 px-1">{t("navbar.missingToken")}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            name="new_password"
            placeholder={t("navbar.newPasswordPlaceholder")}
            value={form.new_password}
            onChange={handleChange}
            required
            className="input focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />

          <input
            type="password"
            name="confirm_password"
            placeholder={t("navbar.confirmPasswordPlaceholder")}
            value={form.confirm_password}
            onChange={handleChange}
            required
            className="input focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />

          {/* Error inline */}
          {error && <p className="text-xs text-red-500 px-1">{error}</p>}

          <button
            type="submit"
            disabled={loading || !tokenFromUrl}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("home.loading")}
              </>
            ) : (
              t("navbar.resetButton")
            )}
          </button>
        </form>
      </div>
    </div>
  );
};