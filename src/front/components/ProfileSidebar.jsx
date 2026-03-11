import useGlobalReducer from "../hooks/useGlobalReducer";
import { useTranslation } from "react-i18next";

const ProfileSidebar = ({ activeTab, setActiveTab }) => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const role = store.user?.role;

  const linkClass = (tab) =>
    `block px-4 py-3 rounded-lg cursor-pointer transition ${
      activeTab === tab
        ? "bg-purple-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  // Label e icono del item seller según el rol
  const sellerLabel = () => {
    if (role === "admin")                    return `🛡️ ${t("seller.adminPanel")}`;
    if (role === "seller")                   return `🏪 ${t("seller.myStore")}`;
    return `✨ ${t("seller.becomeSeller")}`;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-8">Mi Cuenta</h2>

      <div className="space-y-2">
        <div onClick={() => setActiveTab("dashboard")} className={linkClass("dashboard")}>
          Panel de control
        </div>

        <div onClick={() => setActiveTab("info")} className={linkClass("info")}>
          Información
        </div>

        <div onClick={() => setActiveTab("addresses")} className={linkClass("addresses")}>
          Direcciones
        </div>

        {/* ── Pedidos ────────────────────────── */}
        <div onClick={() => setActiveTab("orders")} className={linkClass("orders")}>
          📦 Pedidos
        </div>

        <div onClick={() => setActiveTab("security")} className={linkClass("security")}>
          Seguridad
        </div>

        {/* ── Incidencias ────────────────────────── */}
        <div onClick={() => setActiveTab("incidents")} className={linkClass("incidents")}>
          ⚠️ Incidencias
        </div>

        {/* ── Seller / Admin ────────────────────────── */}
        <div className="pt-2 mt-2 border-t border-gray-100">
          <div onClick={() => setActiveTab("seller")} className={linkClass("seller")}>
            {sellerLabel()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;