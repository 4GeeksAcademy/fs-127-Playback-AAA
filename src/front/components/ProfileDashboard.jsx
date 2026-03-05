import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

const ProfileDashboard = () => {

  const { store } = useGlobalReducer();
  const navigate = useNavigate();

  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {

    const token = store.token || localStorage.getItem("token");

    if (!token) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/my-orders`, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrdersCount(data.length);
      });

  }, []);

  return (

    <div className="grid md:grid-cols-2 gap-6">

      {/* PEDIDOS */}

      <div
        onClick={() => navigate("/orders")}
        className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-md transition"
      >
        <h3 className="text-gray-500 text-sm">
          Pedidos
        </h3>

        <p className="text-2xl font-bold mt-2">
          {ordersCount}
        </p>
      </div>


      {/* DIRECCIONES */}

      <div
        onClick={() => navigate("/profile?tab=addresses")}
        className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-md transition"
      >
        <h3 className="text-gray-500 text-sm">
          Direcciones
        </h3>

        <p className="text-2xl font-bold mt-2">
          Gestionar
        </p>
      </div>

    </div>

  );

};

export default ProfileDashboard;