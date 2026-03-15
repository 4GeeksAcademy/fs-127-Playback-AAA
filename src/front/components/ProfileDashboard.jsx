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
    <div className="grid md:grid-cols-2 gap-6">

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
  );
};

export default ProfileDashboard;