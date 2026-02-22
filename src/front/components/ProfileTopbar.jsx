import React from "react";
import { Menu } from "lucide-react";

const ProfileTopbar = ({ setIsOpen }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <button
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu />
      </button>

      <h1 className="font-semibold text-lg">Panel de Usuario</h1>

      <div className="w-8 h-8 rounded-full bg-gray-300" />
    </header>
  );
};

export default ProfileTopbar;