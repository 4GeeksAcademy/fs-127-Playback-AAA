import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import productServices from "../../services/productService";

// Enlaces de "Oportunidades"
const FEATURED_LINKS = [
  { key: "onSale",       href: "/products?on_sale=true" },
  { key: "lowStock",     href: "/products?low_stock=true" },
  { key: "refurbished",  href: "/products?condition=refurbished" },
];

const FEATURED_KEY = "__featured__";

export const CategorybarDesktop = ({ categories }) => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState({ onSale: [], lowStock: [], refurbished: [] });

  const currentCategory = categories.find((c) => c.name === activeCategory);

  // Carga los productos de oportunidades al montar
  useEffect(() => {
    Promise.all([
      productServices.searchProducts({ onSale: true,           limit: 5 }),
      productServices.searchProducts({ lowStock: true,         limit: 5 }),
      productServices.searchProducts({ conditions: ["refurbished"], limit: 5 }),
    ]).then(([[onSaleData], [lowStockData], [refurbishedData]]) => {
      setFeaturedProducts({
        onSale:      (onSaleData      || []).slice(0, 5),
        lowStock:    (lowStockData    || []).slice(0, 5),
        refurbished: (refurbishedData || []).slice(0, 5),
      });
    });
  }, [i18n.language]);

  return (
    <div
      className="relative bg-main border-b border-main max-[950px]:hidden"
      onMouseLeave={() => setActiveCategory(null)}
    >
      <div className="max-w-screen-xl mx-auto px-8 flex items-center justify-between overflow-hidden">
        <nav className="flex items-center min-w-0">
          {/* Categorías */}
          {categories.map((cat) => (
            <div key={cat.id} className="relative" onMouseEnter={() => setActiveCategory(cat.name)}>
              <Link
                to={`/products?category=${cat.slug}`}
                onClick={() => setActiveCategory(null)}
                className={`relative px-2 py-4 text-xs tracking-wider uppercase font-medium transition-colors duration-150 whitespace-nowrap inline-block
                  ${activeCategory === cat.name ? "text-main" : "text-muted hover:text-main"}`}
              >
                {cat.name}
                {activeCategory === cat.name && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-amber-500 rounded-sm" />
                )}
              </Link>
            </div>
          ))}

          {/* Separador */}
          <div className="w-px h-4 bg-[rgb(var(--color-border))] mx-2 flex-shrink-0" />

          {/* Dropdown Oportunidades */}
          <div className="relative" onMouseEnter={() => setActiveCategory(FEATURED_KEY)}>
            <button
              className={`relative px-2 py-4 text-xs tracking-wider uppercase font-medium transition-colors duration-150 whitespace-nowrap
                ${activeCategory === FEATURED_KEY ? "text-main" : "text-muted hover:text-main"}`}
            >
              {t("navbar.opportunities")}
              {activeCategory === FEATURED_KEY && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-amber-500 rounded-sm" />
              )}
            </button>
          </div>
        </nav>

        {/* Acerca de */}
        <div className="pl-6 border-l border-main ml-2 flex-shrink-0">
          <Link
            to="/about"
            className="text-xs tracking-wider uppercase font-medium text-muted hover:text-main transition-colors whitespace-nowrap"
          >
            {t("navbar.aboutPlayback")}
          </Link>
        </div>
      </div>

      {/* Dropdown categorías */}
      {currentCategory?.subcategories?.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 bg-main border-b border-main shadow-2xl capitalize">
          <div className="max-w-screen-xl mx-auto px-8 py-8">
            <div className="flex gap-10">
              {currentCategory?.image_url && (
                <div className="hidden lg:block flex-shrink-0 w-56">
                  <Link
                    to={`/products?category=${currentCategory.slug}`}
                    onClick={() => setActiveCategory(null)}
                    className="group block relative aspect-[3/4] overflow-hidden"
                  >
                    <img src={currentCategory.image_url} alt={currentCategory.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-3 left-3 text-xs text-white font-medium tracking-wider uppercase">{currentCategory.name}</p>
                  </Link>
                </div>
              )}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-6">
                {currentCategory.subcategories.map((sub) => (
                  <div key={sub.id} className="flex flex-col gap-2.5">
                    <Link
                      to={`/products?category=${currentCategory.slug}&subcategory=${sub.slug}`}
                      onClick={() => setActiveCategory(null)}
                      className="text-xs font-semibold tracking-widest uppercase text-sub hover:text-amber-600 transition-colors"
                    >
                      {sub.name}
                    </Link>
                    <div className="w-6 h-px bg-[rgb(var(--color-border))]" />
                    {sub.items?.length > 0 && (
                      <ul className="flex flex-col gap-1.5">
                        {sub.items.map((item) => (
                          <li key={item.id}>
                            <Link
                              to={`/products?category=${currentCategory.slug}&subcategory=${sub.slug}&item=${item.slug}`}
                              onClick={() => setActiveCategory(null)}
                              className="text-xs text-muted hover:text-main transition-colors leading-relaxed"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Oportunidades */}
      {activeCategory === FEATURED_KEY && (
        <div className="absolute left-0 right-0 top-full z-50 bg-main border-b border-main shadow-2xl">
          <div className="max-w-screen-xl mx-auto px-8 py-8">
            <div className="flex gap-10">

              {/* Imagen lateral */}
              <div className="hidden lg:block flex-shrink-0 w-48">
                <Link
                  to="/products?on_sale=true&condition=refurbished&low_stock=true"
                  onClick={() => setActiveCategory(null)}
                  className="group block relative aspect-[3/4] overflow-hidden"
                >
                  <img
                    src="https://res.cloudinary.com/playback-assets/image/upload/v1771748886/ofertas.png"
                    alt="Oportunidades"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-3 left-3 text-xs text-white font-medium tracking-wider uppercase">
                    {t("navbar.opportunities")}
                  </p>
                </Link>
              </div>

              {/* Tres columnas de productos */}
              {FEATURED_LINKS.map((link) => (
                <div key={link.key} className="flex flex-col gap-2.5 flex-1 min-w-0">
                  {/* Cabecera de sección */}
                  <Link
                    to={link.href}
                    onClick={() => setActiveCategory(null)}
                    className="text-xs font-semibold tracking-widest uppercase text-sub hover:text-amber-600 transition-colors whitespace-nowrap"
                  >
                    {t(`navbar.${link.key}`)}
                  </Link>
                  <div className="w-6 h-px bg-[rgb(var(--color-border))]" />

                  {/* Lista de productos */}
                  <ul className="flex flex-col gap-2">
                    {featuredProducts[link.key]?.map((product) => (
                      <li key={product.id}>
                        <Link
                          to={`/product/${product.id}`}
                          onClick={() => setActiveCategory(null)}
                          className="flex items-center gap-2 group/item"
                        >
                          <img
                            src={product.image_url || "https://placehold.co/40x40?text=?"}
                            alt={product.name}
                            className="w-8 h-8 object-cover rounded flex-shrink-0 border border-main"
                            onError={(e) => (e.target.src = "https://placehold.co/40x40?text=?")}
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-muted group-hover/item:text-main transition-colors truncate leading-relaxed">
                              {product.name}
                            </p>
                            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                              {product.discount > 0
                                ? (product.price * (1 - product.discount / 100)).toFixed(2)
                                : product.price.toFixed(2)}€
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                    {featuredProducts[link.key]?.length === 0 && (
                      <li className="text-xs text-faint italic">{t("search.noResults")}</li>
                    )}
                  </ul>

                  {/* Ver todos */}
                  <Link
                    to={link.href}
                    onClick={() => setActiveCategory(null)}
                    className="text-xs text-violet-600 dark:text-violet-400 hover:underline mt-1"
                  >
                    {t("navbar.viewAll")} →
                  </Link>
                </div>
              ))}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};