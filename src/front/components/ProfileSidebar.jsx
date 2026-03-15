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
        : "text-muted hover:bg-muted"
    }`;

  // Label e icono del item seller según el rol
  const sellerLabel = () => {
    if (role === "admin")  return `🛡️ ${t("seller.adminPanel")}`;
    if (role === "seller") return `🏪 ${t("seller.myStore")}`;
    return `✨ ${t("seller.becomeSeller")}`;
  };

  return (
    <div className="w-64 bg-main border-r border-main p-6">
      <h2 className="text-lg font-semibold mb-8 text-main">{t("profile.myAccount")}</h2>

      <div className="space-y-2">
        <div onClick={() => setActiveTab("dashboard")} className={linkClass("dashboard")}>
          {t("profile.tabs.dashboard")}
        </div>

        <div onClick={() => setActiveTab("info")} className={linkClass("info")}>
          {t("profile.tabs.info")}
        </div>

        <div onClick={() => setActiveTab("addresses")} className={linkClass("addresses")}>
          {t("profile.tabs.addresses")}
        </div>

        <div onClick={() => setActiveTab("security")} className={linkClass("security")}>
          {t("profile.tabs.security")}
        </div>

        {/* ── Seller / Admin ────────────────────────── */}
        <div className="pt-2 mt-2 border-t border-main">
          <div onClick={() => setActiveTab("seller")} className={linkClass("seller")}>
            {sellerLabel()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;