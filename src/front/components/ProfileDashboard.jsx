const ProfileDashboard = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-gray-500 text-sm">Pedidos</h3>
        <p className="text-2xl font-bold mt-2">4</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-gray-500 text-sm">Direcciones</h3>
        <p className="text-2xl font-bold mt-2">2</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-gray-500 text-sm">Cuenta</h3>
        <p className="text-green-600 font-medium mt-2">Activa</p>
      </div>
    </div>
  );
};

export default ProfileDashboard;