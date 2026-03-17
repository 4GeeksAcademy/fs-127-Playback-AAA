import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import OrderTab    from './OrdersTab';
import ProductsTab from './ProductsTab';
import EarningTab  from './EarningTab';
import SettingsTab from './SettingsTab';
import ResumTab    from './ResumTab';

export default function StoreDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useTranslation();

  const TABS = [
    { id: 'overview',  emoji: '📊', label: t('dashboard.seller.tabs.overview') },
    { id: 'orders',    emoji: '📦', label: t('dashboard.seller.tabs.orders') },
    { id: 'products',  emoji: '🛍️', label: t('dashboard.seller.tabs.products') },
    { id: 'earnings',  emoji: '💰', label: t('dashboard.seller.tabs.earnings') },
    { id: 'settings',  emoji: '⚙️', label: t('dashboard.seller.tabs.settings') },
  ];

  const activeLabel = TABS.find(t => t.id === activeTab);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':  return <ResumTab />;
      case 'orders':    return <OrderTab />;
      case 'products':  return <ProductsTab />;
      case 'earnings':  return <EarningTab />;
      case 'settings':  return <SettingsTab />;
      default:          return null;
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-main border border-main rounded-2xl shadow-sm overflow-hidden">

        {/* Cabecera */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-0">
          <h2 className="text-lg font-semibold text-main mb-1">
            🏪 {t('dashboard.seller.title')}
          </h2>
          <p className="text-muted text-sm mb-4">
            {t('dashboard.seller.desc')}
          </p>

          {/* ── MÓVIL: dropdown selector ── */}
          <div className="sm:hidden mb-1">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full appearance-none border border-main rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-main bg-main cursor-pointer focus:outline-none focus:border-purple-400"
              >
                {TABS.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.emoji} {tab.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
            </div>
          </div>

          {/* ── DESKTOP: tabs horizontales ── */}
          <div className="hidden sm:flex border-b border-main">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-purple-500 text-purple-500'
                    : 'border-transparent text-muted hover:text-main'
                  }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido del tab activo */}
        <div className="px-4 sm:px-8 py-6 sm:pb-8">
          {renderTab()}
        </div>

      </div>
    </div>
  );
}