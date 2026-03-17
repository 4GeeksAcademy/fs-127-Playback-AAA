import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfileHeader from "../components/ProfileHeader";
import ProfileTabBar from "../components/ProfileTabBar";
import ProfileDashboard from "../components/ProfileDashboard";
import ProfileInfo from "../components/ProfileInfo";
import ProfileSecurity from "../components/ProfileSecurity";
import ProfileOrders from "../components/ProfileOrders";
import ProfileAddresses from "../components/ProfileAddresses";
import ProfileRole from "../components/Profile/ProfileRole/ProfileRole";
import { useNavigate } from "react-router-dom";


const ACCOUNT_SECTIONS = ["info", "addresses", "security"];

const AccountLayout = ({ activeSection, setActiveSection }) => {
  const { t } = useTranslation();

  const sections = [
    { key: "info",      icon: "👤", label: t("profile.tabs.info") },
    { key: "addresses", icon: "📍", label: t("profile.tabs.addresses") },
    { key: "security",  icon: "🔒", label: t("profile.tabs.security") },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "addresses": return <ProfileAddresses />;
      case "security":  return <ProfileSecurity />;
      default:          return <ProfileInfo />;
    }
  };

  return (
    <>
      {/* ── MÓVIL: tabs horizontales encima del contenido ── */}
      <div className="sm:hidden flex border-b border-main mb-5">
        {sections.map((s) => {
          const isActive = activeSection === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              style={{
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: isActive ? "500" : "400",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderBottom: isActive ? "2px solid #534AB7" : "2px solid transparent",
                color: isActive ? "#534AB7" : "var(--color-muted)",
                background: "none",
                cursor: "pointer",
                marginBottom: "-1px",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── DESKTOP: sidebar izquierda + contenido derecha ── */}
      <div className="hidden sm:flex gap-8 items-start">
        <aside
          style={{
            width: "180px",
            flexShrink: 0,
            background: "var(--color-background-primary, #fff)",
            border: "0.5px solid var(--border-main, #e5e7eb)",
            borderRadius: "12px",
            padding: "8px",
          }}
        >
          {sections.map((s) => {
            const isActive = activeSection === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className="flex items-center gap-3 w-full text-left transition-all"
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: isActive ? "500" : "400",
                  background: isActive ? "#EEEDFE" : "transparent",
                  color: isActive ? "#534AB7" : "var(--color-muted, #6b7280)",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "2px",
                  display: "flex",
                }}
              >
                <span style={{ fontSize: "14px", lineHeight: 1 }}>{s.icon}</span>
                {s.label}
              </button>
            );
          })}
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          {renderSection()}
        </div>
      </div>

      {/* ── MÓVIL: contenido ── */}
      <div className="sm:hidden">
        {renderSection()}
      </div>
    </>
  );
};

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") || "dashboard";
const navigate = useNavigate();
  const isAccountSection = ACCOUNT_SECTIONS.includes(rawTab);
  const [activeTab,     setActiveTab]     = useState(isAccountSection ? "account" : rawTab);
  const [activeSection, setActiveSection] = useState(isAccountSection ? rawTab : "info");

  useEffect(() => {
    const param = activeTab === "account" ? activeSection : activeTab;
    setSearchParams({ tab: param });
  }, [activeTab, activeSection]);

  const handleTabChange = (tab) => {
    if (tab === "favorites") {
    navigate("/favorites"); 
    return;
  }
    setActiveTab(tab);
    if (tab === "account") setActiveSection("info");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "orders":  return <ProfileOrders />;
      case "seller":  return <ProfileRole />;
      case "account": return <AccountLayout activeSection={activeSection} setActiveSection={setActiveSection} />;
      default:        return <ProfileDashboard setActiveTab={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-subtle">
      <ProfileHeader />
      <ProfileTabBar activeTab={activeTab} setActiveTab={handleTabChange} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Profile;