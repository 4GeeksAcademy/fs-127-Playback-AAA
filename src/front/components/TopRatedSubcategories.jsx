import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTopRatedSubcategoriesService } from "../services/categoryService";
import { useTranslation } from "react-i18next";


export const TopRatedSubcategories = () => {
      const { t } = useTranslation();
  
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga las 5 subcategorías con mejor valoración media y más productos al montar el componente
  useEffect(() => {
    getTopRatedSubcategoriesService().then(([data, error]) => {
      if (data) setSubcategories(data);
      setLoading(false);
    });
  }, []);

  // Mientras carga muestra un skeleton con el número de columnas del grid
  if (loading)
    return (
      <section>
        <h2 className="text-lg font-semibold my-4 text-theme-text">
{t("home.featuredCategories")}  
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full h-40 sm:h-44 md:h-48 bg-theme-muted" />
              <div className="h-4 bg-theme-muted mt-2 mx-4" />
            </div>
          ))}
        </div>
      </section>
    );

  // Si el backend no devuelve datos no renderiza nada
  if (!subcategories.length) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold my-4 text-theme-text">
  {t("home.featuredCategories")}
   </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {subcategories.map((sub) => (
          // Al hacer click navega a productos filtrando por categoría y subcategoría
          <div
            key={sub.id}
            onClick={() => navigate(`/products/${sub.category_slug.toLowerCase()}/${sub.slug.toLowerCase()}`)}
            className="cursor-pointer group hover:shadow-md transition-all duration-200 bg-theme-bg"
          >
            <img
              src={
                sub.image_url || "https://placehold.co/400x300?text=Sin+imagen"
              }
              alt={sub.name}
              className="w-full h-40 sm:h-44 md:h-48 object-cover"
              // Si la imagen falla muestra un placeholder
              onError={(e) =>
                (e.target.src = "https://placehold.co/400x300?text=Sin+imagen")
              }
            />
            <p className="text-center text-xs font-semibold uppercase py-2 text-theme-text">
              {sub.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
