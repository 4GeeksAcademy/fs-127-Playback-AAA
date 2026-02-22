import React from "react";

const ProfileDashboard = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-bold mb-2">Pedidos</h3>
        <p className="text-2xl font-semibold">12</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-bold mb-2">Incidencias</h3>
        <p className="text-2xl font-semibold">2</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-bold mb-2">Direcciones</h3>
        <p className="text-2xl font-semibold">3</p>
      </div>
    </div>
  );
};

export default ProfileDashboard;