import { useState } from "react";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import { getStripeOnboardingLinkService } from "../../../../services/sellerService";

const SellerStripeConnect = () => {
  const { store } = useGlobalReducer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = store.token || localStorage.getItem("token");
      const data = await getStripeOnboardingLinkService(token);
      // Stripe redirigirá a /seller/stripe/return al completar
      window.location.href = data.onboarding_url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-theme-bg border border-theme-border rounded-2xl p-8 shadow-sm max-w-2xl">
      <div className="text-4xl mb-4">💳</div>

      <h3 className="text-lg font-semibold text-theme-text mb-2">
        Conecta tu cuenta de pagos
      </h3>

      <p className="text-theme-muted text-sm mb-6">
        Para recibir pagos de tus ventas necesitas conectar tu cuenta con
        Stripe. El proceso tarda menos de 5 minutos.
      </p>

      <button
        onClick={handleOpenOnboarding}
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
      >
        {loading ? "Abriendo..." : "Registrarme en Stripe →"}
      </button>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
};

export default SellerStripeConnect;