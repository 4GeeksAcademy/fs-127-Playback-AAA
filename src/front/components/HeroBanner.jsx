import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFeaturedSubcategoryBannerService } from "../services/categoryService";
import { useTranslation } from "react-i18next";

export const HeroBanner = () => {
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    getFeaturedSubcategoryBannerService().then(([data, error]) => {
      if (data) setBanner(data);
      setLoading(false);
    });
  }, [i18n.language]);

  if (loading)
    return (
      <div className="w-full px-4 max-w-screen-2xl mx-auto my-6">
        <div className="min-h-48 sm:min-h-60 md:min-h-72 bg-muted animate-pulse" />
      </div>
    );

  if (!banner) return null;

  return (
    <section>
      <div className="w-full px-4 max-w-screen-2xl mx-auto my-6">
        <div
          className="relative overflow-hidden min-h-48 sm:min-h-60 md:min-h-72 flex items-center justify-center"
          style={{
            backgroundImage: `url('${banner.image_url}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 bg-black/70 text-white px-5 py-5 sm:px-8 sm:py-8 flex flex-col items-center text-center w-11/12 sm:w-80 md:w-96 m-4">
            <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
              {banner.name}
            </h4>
            <span className="text-xs font-bold uppercase mb-2">
              {t("home.heroBannerSpan1")}
            </span>
            <p className="text-stone-300 text-xs sm:text-sm mb-4 sm:mb-6">
              {banner.description}
            </p>
            <button
              onClick={() =>
                navigate(
                  `/products?category=${banner.category_slug}&subcategory=${banner.slug}`,
                )
              }
              className="bg-stone-800 hover:bg-stone-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs sm:text-sm transition-all w-full"
            >
              {banner.offer_count > 0
                ? `${t("home.heroBannerSpan2")} (${banner.offer_count})`
                : t("home.viewSubcategory")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
