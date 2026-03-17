import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../hooks/useGlobalReducer";
import orderService from "../services/orderService";

const ProfileDashboard = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
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

    <div>

      <h1 className="text-2xl font-semibold mb-8">
        Panel de control
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* PEDIDOS */}

        <div
          onClick={() => navigate("/orders")}
          className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-md transition"
        >
          <h3 className="text-gray-500 text-sm">
            📦 Pedidos
          </h3>

          <p className="text-2xl font-bold mt-2">
            {ordersCount}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Ver historial de pedidos
          </p>
        </div>


        {/* INCIDENCIAS */}

        <div
          onClick={() => navigate("/profile?tab=incidents")}
          className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-md transition"
        >
          <h3 className="text-gray-500 text-sm">
            ⚠️ Incidencias
          </h3>

          <p className="text-2xl font-bold mt-2">
            Ver
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Consulta tus incidencias
          </p>
        </div>


        {/* DIRECCIONES */}

        <div
          onClick={() => navigate("/profile?tab=addresses")}
          className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-md transition"
        >
          <h3 className="text-gray-500 text-sm">
            📍 Direcciones
          </h3>

          <p className="text-2xl font-bold mt-2">
            Gestionar
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Administra tus direcciones
          </p>
        </div>


        {/* SEGURIDAD */}

        <div
          onClick={() => navigate("/profile?tab=security")}
          className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-md transition"
        >
          <h3 className="text-gray-500 text-sm">
            🔒 Seguridad
          </h3>

          <p className="text-2xl font-bold mt-2">
            Ajustes
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Cambiar contraseña
          </p>
        </div>


        {/* TIENDA (solo seller) */}

        {store.user?.role === "seller" && (

          <div
            onClick={() => navigate("/profile?tab=seller")}
            className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-md transition"
          >
            <h3 className="text-gray-500 text-sm">
              🏪 Mi tienda
            </h3>

            <p className="text-2xl font-bold mt-2">
              Panel
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Gestionar productos
            </p>
          </div>

        )}

      </div>


      {/* BLOQUE ORIGINAL DE DEV */}

      <div className="grid md:grid-cols-2 gap-6 mt-10">

        <div
          onClick={() => navigate("/orders")}
          className="bg-main p-6 rounded-xl shadow border border-main cursor-pointer hover:shadow-md transition"
        >
          <h3 className="text-muted text-sm">{t("orders.title")}</h3>
          <p className="text-2xl font-bold mt-2 text-main">{ordersCount}</p>
        </div>

        <div
          onClick={() => navigate("/profile?tab=addresses")}
          className="bg-main p-6 rounded-xl shadow border border-main cursor-pointer hover:shadow-md transition"
        >
          <h3 className="text-muted text-sm">{t("profile.tabs.addresses")}</h3>
          <p className="text-2xl font-bold mt-2 text-main">{t("profile.manage")}</p>
        </div>

      </div>

    </div>
  );
};

export default ProfileDashboard;