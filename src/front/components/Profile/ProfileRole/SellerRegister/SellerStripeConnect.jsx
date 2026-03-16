import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGlobalReducer from '../../../../hooks/useGlobalReducer';
import { getStripeOnboardingLinkService } from '../../../../services/sellerService';

const SellerStripeConnect = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = store.token || localStorage.getItem('token');
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
    <div className="bg-main border border-main rounded-2xl p-8 shadow-sm max-w-2xl">
      <div className="text-4xl mb-4">💳</div>

      <h3 className="text-lg font-semibold text-main mb-2">
        {t('seller.stripe.title')}
      </h3>

      <p className="text-muted text-sm mb-6">{t('seller.stripe.desc')}</p>

      <button
        onClick={handleOpenOnboarding}
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? t('seller.stripe.opening') : t('seller.stripe.cta')}
      </button>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
};

export default SellerStripeConnect;
