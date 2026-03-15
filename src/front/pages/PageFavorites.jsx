import useGlobalReducer from "../hooks/useGlobalReducer";
import { CardProduct } from "../components/CardProduct";
import { useFavorites } from "../hooks/useFavorites";
import { useTranslation } from 'react-i18next';

export const PageFavorites = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const favorites = store.favorites || [];

  useFavorites();

  if (favorites.length === 0)
    return (
      <div className="flex items-center justify-center h-96 text-faint text-sm tracking-widest uppercase">
        {t('favorites.empty')}
      </div>
    );

  return (
    <div>
      <section className="w-full px-20 max-w-screen-2xl mx-auto">
        <div className="py-5">
          <p className="text-2xl font-semibold mt-1 pb-3 text-main">
            {t('favorites.title')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((p) => (
            <CardProduct key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};
