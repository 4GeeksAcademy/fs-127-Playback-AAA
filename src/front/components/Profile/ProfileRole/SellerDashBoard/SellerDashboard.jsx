import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import OrderTab from './OrdersTab';
import ProductsTab from './ProductsTab';
import EarningTab from './EarningTab';
import SettingsTab from './SettingsTab';
import ResumTab from './ResumTab';

export default function StoreDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useTranslation();

  // Definición de tabs — dentro del componente para acceder a t()
  const TABS = [
    { id: 'overview', label: `📊 ${t('dashboard.seller.tabs.overview')}` },
    { id: 'orders', label: `📦 ${t('dashboard.seller.tabs.orders')}` },
    { id: 'products', label: `🛍️ ${t('dashboard.seller.tabs.products')}` },
    { id: 'earnings', label: `💰 ${t('dashboard.seller.tabs.earnings')}` },
    { id: 'settings', label: `⚙️ ${t('dashboard.seller.tabs.settings')}` },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <ResumTab />;
      case 'orders':
        return <OrderTab />;
      case 'products':
        return <ProductsTab />;
      case 'earnings':
        return <EarningTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-main border border-main rounded-2xl shadow-sm overflow-hidden">
        {/* Cabecera */}
        <div className="px-8 pt-8 pb-0">
          <h2 className="text-lg font-semibold text-main mb-1">
            🏪 {t('dashboard.seller.title')}
          </h2>
          <p className="text-muted text-sm mb-4">
            {t('dashboard.seller.desc')}
          </p>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-main">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px
                  ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-500'
                      : 'border-transparent text-muted hover:text-main'
                  }`}
              >
                {tab.label}
                {/* {tab.id === "orders" && pendingOrders > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {pendingOrders}
                  </span>
                )} */}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="px-8 pb-8">{renderTab()}</div>
      </div>
    </div>
  );
}
