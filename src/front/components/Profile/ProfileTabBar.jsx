import { useState, useRef, useEffect } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";

const ProfileTabBar = ({ activeTab, setActiveTab }) => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const role = store.user?.role;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const sellerLabel = () => {
    if (role === "admin") return t("seller.adminPanel");
    if (role === "seller") return t("seller.myStore");
    return t("seller.becomeSeller");
  };

  const tabs = [
    { key: "dashboard", label: t("profile.tabs.dashboard") },
    { key: "account", label: t("profile.myAccount") },
    { key: "orders", label: t("orders.title") },
    { key: "favorites", label: t("favorites.title") },
    { key: "incidents", label: t("incidents.title") },
    { key: "seller", label: sellerLabel() },
  ];

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (key) => {
    setActiveTab(key);
    setMenuOpen(false);
  };

  return (
    <div
      className="bg-main sticky top-0 z-20"
      style={{
        marginTop: "-32px",
        borderBottom: "0.5px solid var(--border-main)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── MÓVIL ── */}
      <div className="sm:hidden" ref={menuRef}>
        <div className="relative flex items-center justify-center px-4 py-3">
          <span className="text-sm font-medium text-main">{activeLabel}</span>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="absolute right-4 flex items-center justify-center w-8 h-8 rounded-lg transition hover:bg-subtle border border-main"
          >
            {menuOpen ? <X size={15} className="text-main" /> : <Menu size={15} className="text-muted" />}
          </button>
        </div>

        {menuOpen && (
          <div className="absolute left-0 right-0 bg-main z-30 border border-main border-t-0 shadow-lg">
            {tabs.map((tab, i) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleSelect(tab.key)}
                  className={`w-full text-left px-5 py-3.5 text-sm flex items-center justify-between transition
                    hover:bg-subtle
                    ${isActive ? "bg-[#534AB7] text-white font-medium" : "text-main font-normal"}`}
                  style={{
                    borderBottom: i < tabs.length - 1 ? "0.5px solid var(--border-main)" : "none",
                  }}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden sm:flex justify-center max-w-5xl mx-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm whitespace-nowrap flex-shrink-0 cursor-pointer transition
                ${isActive ? "border-b-2 border-[#534AB7] font-medium text-[#534AB7]" : "border-b-2 border-transparent font-normal text-muted"}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabBar;