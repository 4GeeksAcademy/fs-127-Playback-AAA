import { useState } from "react";
import OrderTab from './OrdersTab';
import ProductsTab from './ProductsTab';
import EarningTab from './EarningTab';
import SettingsTab from './SettingsTab';
import ResumTab from './ResumTab';


// Definición de tabs

const TABS = [
  { id: "overview",  label: "📊 Resumen"    },
  { id: "orders",    label: "📦 Pedidos"    },
  { id: "products",  label: "🛍️ Productos"  },
  { id: "earnings",  label: "💰 Ganancias"  },
  { id: "settings",  label: "⚙️ Tienda"     },
];

export default function StoreDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

//  const pendingOrders = ORDERS.filter((o) => o.status === "pendiente").length;

  const renderTab = () => {
    switch (activeTab) {
      case "overview":  return <ResumTab />;
      case "orders":    return <OrderTab />;
      case "products":  return <ProductsTab />;
      case "earnings":  return <EarningTab />;
      case "settings":  return <SettingsTab />;
      default:          return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-theme-bg border border-theme-border rounded-2xl shadow-sm overflow-hidden">
        {/* Cabecera */}
        <div className="px-8 pt-8 pb-0">
          <h2 className="text-lg font-semibold text-theme-text mb-1">
            🏪 Mi Tienda
          </h2>
          <p className="text-theme-muted text-sm mb-4">
            Gestiona tus pedidos, productos y ganancias desde aquí.
          </p>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-theme-border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px
                  ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-500"
                      : "border-transparent text-theme-muted hover:text-theme-text"
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