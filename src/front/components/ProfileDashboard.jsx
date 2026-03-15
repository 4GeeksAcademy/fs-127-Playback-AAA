import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import orderService from "../services/orderService";

const ProfileDashboard = () => {

  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    const token = store.token || localStorage.getItem("token");
    if (!token) return;

    orderService.getMyOrders(token).then(([data]) => {
      if (data) setOrdersCount(data.length);
    });
  }, []);

  return (

    <div className="grid md:grid-cols-2 gap-6">

      <div
        onClick={() => navigate("/orders")}
        className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-md transition"
      >
        <h3 className="text-gray-500 text-sm">Pedidos</h3>
        <p className="text-2xl font-bold mt-2">{ordersCount}</p>
      </div>

      <div
        onClick={() => navigate("/profile?tab=addresses")}
        className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-md transition"
      >
        <h3 className="text-gray-500 text-sm">Direcciones</h3>
        <p className="text-2xl font-bold mt-2">Gestionar</p>
      </div>

    </div>

  );

};

export default ProfileDashboard;