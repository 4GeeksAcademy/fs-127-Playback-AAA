import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { useFavorites } from "../../hooks/useFavorites";
import { CardProduct } from "../Common/CardProduct";

const ProfileFavorites = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();

  useFavorites();

  const favorites = store.favorites || [];

  if (favorites.length === 0)
    return (
      <div className="bg-main rounded-xl border border-main p-10 text-center">
        <p className="text-muted text-sm">{t("favorites.empty")}</p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {favorites.map((p) => (
        <CardProduct key={p.id} product={p} />
      ))}
    </div>
  );
};

export default ProfileFavorites;
