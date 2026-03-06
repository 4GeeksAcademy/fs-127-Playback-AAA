import { useState } from 'react';
import SellersTab from './SellersTab/SellersTab';
import StatsTab from './StatsTab';
import UsersTab from './UsersTab';
import IncidentsTab from './IncidentsTab';

// Definición de tabs
const TABS = [
  { id: 'stats', label: '📊 Estadísticas' },
  { id: 'sellers', label: '🏪 Vendedores' },
  { id: 'users', label: '👥 Usuarios' },
  { id: 'incidents', label: '🚨 Incidencias' },
];

const AdminDashboard = () => {
  // Tab activo
  const [activeTab, setActiveTab] = useState('stats');
  // Número de solicitudes de vendedor pendientes — alimenta la badge del tab
  const [pendingSellers, setPendingSellers] = useState(0);

  // Renderiza el contenido del tab activo
  const renderTab = () => {
    switch (activeTab) {
      case 'stats':
        return <StatsTab />;
      case 'sellers':
        return <SellersTab onPendingChange={setPendingSellers} />;
      case 'users':
        return <UsersTab />;
      case 'incidents':
        return <IncidentsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-theme-bg border border-theme-border rounded-2xl shadow-sm overflow-hidden">
        {/* Cabecera del panel */}
        <div className="px-8 pt-8 pb-0">
          <h2 className="text-lg font-semibold text-theme-text mb-1">
            🛡️ Panel de administración
          </h2>
          <p className="text-theme-muted text-sm mb-4">
            Gestiona vendedores, usuarios e incidencias de la plataforma.
          </p>

          {/* Navegación por tabs pegada al borde inferior de la cabecera */}
          <div className="flex gap-1 border-b border-theme-border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px
                  ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-500'
                      : 'border-transparent text-theme-muted hover:text-theme-text'
                  }`}
              >
                {tab.label}
                {/* Badge de pendientes — solo visible en el tab de vendedores si hay alguno */}
                {tab.id === 'sellers' && pendingSellers > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {pendingSellers}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido del tab activo */}
        <div className="px-8 pb-8">{renderTab()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
