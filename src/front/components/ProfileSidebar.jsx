import React from "react";

const ProfileSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "info", label: "Información" },
    { id: "security", label: "Seguridad" },
    { id: "orders", label: "Pedidos" }
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 font-bold text-xl border-b">Mi Cuenta</div>

        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                activeTab === item.id
                  ? "bg-black text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default ProfileSidebar;