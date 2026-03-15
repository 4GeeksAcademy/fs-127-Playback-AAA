import { useTranslation } from "react-i18next";

const ProfileTopbar = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-main border-b border-main px-8 py-5">
      <h1 className="text-xl font-semibold text-main">
        {t("profile.userPanel")}
      </h1>
    </div>
  );
};

export default ProfileTopbar;