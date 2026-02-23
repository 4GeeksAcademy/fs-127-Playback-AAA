const ProfileSidebar = ({ activeTab, setActiveTab }) => {
  const linkClass = (tab) =>
    `block px-4 py-3 rounded-lg cursor-pointer transition ${
      activeTab === tab
        ? "bg-purple-600 text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-8">Mi Cuenta</h2>

      <div className="space-y-2">
        <div onClick={() => setActiveTab("dashboard")} className={linkClass("dashboard")}>
          Dashboard
        </div>

        <div onClick={() => setActiveTab("info")} className={linkClass("info")}>
          Información
        </div>

        <div onClick={() => setActiveTab("addresses")} className={linkClass("addresses")}>
          Direcciones
        </div>

        <div onClick={() => setActiveTab("security")} className={linkClass("security")}>
          Seguridad
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;