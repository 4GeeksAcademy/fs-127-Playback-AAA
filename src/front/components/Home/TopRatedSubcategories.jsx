import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTopRatedSubcategoriesService,
  getCategoriesService,
} from '../../services/categoryService';
import { useTranslation } from 'react-i18next';

export const TopRatedSubcategories = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRandom, setIsRandom] = useState(false); // si son aleatorias

  const { t, i18n } = useTranslation();

  // Carga las 5 subcategorías con mejor valoración media y más productos al montar el componente
  useEffect(() => {
    getTopRatedSubcategoriesService().then(([data, error]) => {
      if (data && data.length > 0) {
        setSubcategories(data);
        setLoading(false);
      } else {
        // Fallback — subcategorías aleatorias de todas las categorías
        getCategoriesService().then(([catData]) => {
          if (catData?.length) {
            const allSubs = catData.flatMap((cat) =>
              (cat.subcategories || []).map((sub) => ({
                ...sub,
                category_slug: cat.slug,
              })),
            );
            const shuffled = [...allSubs]
              .sort(() => Math.random() - 0.5)
              .slice(0, 5);
            setSubcategories(shuffled);
            setIsRandom(true);
          }
          setLoading(false);
        });
      }
    });
  }, [i18n.language]);

  // Mientras carga muestra un skeleton con el número de columnas del grid
  if (loading)
    return (
      <section>
        <h2 className="text-lg font-semibold my-4 text-main">
          {t('home.featuredCategories')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full h-40 sm:h-44 md:h-48 bg-muted" />
              <div className="h-4 bg-muted mt-2 mx-4" />
            </div>
          ))}
        </div>
      </section>
    );

  // Si el backend no devuelve datos no renderiza nada
  if (!subcategories.length) return null;

  // El nombre viene como string o como objeto i18n según el origen
  const getName = (sub) =>
    typeof sub.name === 'object'
      ? sub.name?.[i18n.language] || sub.name?.es || sub.name?.en
      : sub.name;

  return (
    <section>
      <h2 className="text-lg font-semibold my-4 text-main">
        {isRandom ? t('home.featuredCategories') : t('home.featuredCategories')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {subcategories.map((sub, index) => (
          // Al hacer click navega a productos filtrando por categoría y subcategoría
          <div
            key={sub.id}
            onClick={() =>
              navigate(
                `/products?category=${sub.category_slug?.toLowerCase()}&subcategory=${sub.slug?.toLowerCase()}`,
              )
            }
            className={`cursor-pointer group hover:shadow-md transition-all duration-200 bg-main border border-main
              ${
                subcategories.length % 2 !== 0 &&
                index === subcategories.length - 1
                  ? 'sm:col-span-2 lg:col-span-1'
                  : ''
              }`}
          >
            <img
              src={
                sub.image_url || 'https://placehold.co/400x300?text=Sin+imagen'
              }
              alt={getName(sub)}
              className="w-full h-40 sm:h-44 md:h-48 object-cover"
              // Si la imagen falla muestra un placeholder
              onError={(e) =>
                (e.target.src = 'https://placehold.co/400x300?text=Sin+imagen')
              }
            />
            <p className="text-center text-xs font-semibold uppercase py-2 text-main">
              {getName(sub)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
