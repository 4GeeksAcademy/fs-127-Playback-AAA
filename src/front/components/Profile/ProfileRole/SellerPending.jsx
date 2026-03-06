import { useTranslation } from 'react-i18next';

const SellerPending = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-theme-bg border border-theme-border rounded-2xl p-8 shadow-sm max-w-2xl text-center">
      <div className="text-5xl mb-4">⏳</div>
      <h3 className="text-lg font-semibold text-theme-text mb-2">{t('seller.pendingTitle')}</h3>
      <p className="text-theme-muted text-sm">{t('seller.pendingDesc')}</p>
    </div>
  );
};

export default SellerPending;