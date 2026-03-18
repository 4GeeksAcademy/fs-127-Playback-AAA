import { useState, useRef, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";

const ProfileTabBar = ({ activeTab, setActiveTab }) => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const role = store.user?.role;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const sellerLabel = () => {
    if (role === "admin")  return t("seller.adminPanel");
    if (role === "seller") return t("seller.myStore");
    return t("seller.becomeSeller");
  };

  const tabs = [
    { key: "dashboard",  label: t("profile.tabs.dashboard") },
    { key: "orders",     label: t("orders.title") },
    { key: "favorites",  label: t("favorites.title") },
    { key: "incidents",  label: t("incidents.title") },   // ← NUEVO
    { key: "account",    label: t("profile.myAccount") },
    { key: "seller",     label: sellerLabel() },
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
        borderBottom: "0.5px solid var(--border-main, #e5e7eb)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── MÓVIL ── */}
     <div className="sm:hidden" ref={menuRef}>
  <div className="relative flex items-center justify-center px-4 py-3">
    {/* label centrado */}
    <span className="text-sm font-medium text-main">{activeLabel}</span>
    {/* botón anclado a la derecha */}
    <button
      onClick={() => setMenuOpen((v) => !v)}
      className="absolute right-4 flex items-center justify-center w-8 h-8 rounded-lg transition hover:bg-subtle"
      style={{ border: "0.5px solid var(--border-main, #e5e7eb)" }}
    >
      {menuOpen
        ? <X size={15} style={{ color: "#534AB7" }} />
        : <Menu size={15} style={{ color: "var(--color-muted, #6b7280)" }} />
      }
    </button>
  </div>

        {menuOpen && (
          <div
            className="absolute left-0 right-0 bg-main z-30"
            style={{
              border: "0.5px solid var(--border-main, #e5e7eb)",
              borderTop: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {tabs.map((tab, i) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleSelect(tab.key)}
                  className="w-full text-left px-5 py-3.5 text-sm transition hover:bg-subtle flex items-center justify-between"
                  style={{
                    borderBottom: i < tabs.length - 1 ? "0.5px solid var(--border-main, #e5e7eb)" : "none",
                    color: isActive ? "#534AB7" : "var(--color-text-primary)",
                    fontWeight: isActive ? "500" : "400",
                    background: isActive ? "#EEEDFE" : "transparent",
                  }}
                >
                  {tab.label}
                  {isActive && (
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#534AB7", flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── DESKTOP ── */}
<div className="hidden sm:flex justify-center max-w-5xl mx-auto" style={{ scrollbarWidth: "none" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "13px 22px",
                fontSize: "13px",
                whiteSpace: "nowrap",
                flexShrink: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderBottom: isActive ? "2px solid #534AB7" : "2px solid transparent",
                color: isActive ? "#534AB7" : "var(--color-muted, #6b7280)",
                fontWeight: isActive ? "500" : "400",
                transition: "color .15s, border-color .15s",
              }}
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