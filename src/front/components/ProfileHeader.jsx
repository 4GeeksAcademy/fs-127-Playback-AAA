import useGlobalReducer from "../hooks/useGlobalReducer";
import { useTranslation } from "react-i18next";

const ProfileHeader = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const user = store.user;

  const getInitials = () => {
    if (!user) return "?";
    const first = user.first_name?.[0] || user.name?.[0] || "";
    const last  = user.last_name?.[0]  || "";
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "U";
  };

  const getMemberSince = () => {
    if (!user?.created_at) return "";
    return new Date(user.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.name && user?.last_name
    ? `${user.name} ${user.last_name}`
    : user?.username || user?.email || t("profile.user");

  return (
    <div
      style={{ background: "linear-gradient(135deg, #534AB7 0%, #7F77DD 100%)", paddingBottom: "48px" }}
      className="px-4 pt-6"
    >
      <div className="max-w-5xl mx-auto flex items-center gap-5">

        {/* Avatar */}
        <div className="flex-shrink-0">
          {user?.image_url ? (
            <img
              src={user.image_url}
              alt={displayName}
              style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2.5px solid rgba(255,255,255,0.45)" }}
            />
          ) : (
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "2.5px solid rgba(255,255,255,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: "500", color: "white",
            }}>
              {getInitials()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-medium truncate" style={{ fontSize: "18px" }}>
            {displayName}
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "3px" }}>
            {getMemberSince()
              ? t("profile.memberSince", { date: getMemberSince() })
              : user?.email}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ProfileHeader;