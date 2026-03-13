import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Enlaces de "Oportunidades"
const FEATURED_LINKS = [
  { key: "onSale", href: "/products?on_sale=true" },
  { key: "lowStock", href: "/products?low_stock=true" },
  { key: "refurbished", href: "/products?condition=refurbished" },
];

const FEATURED_KEY = "__featured__";

export const CategorybarDesktop = ({ categories }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(null);

  const currentCategory = categories.find((c) => c.name === activeCategory);

  return (
    <div
      className="relative bg-theme-bg border-b border-theme-border max-[950px]:hidden"
      onMouseLeave={() => setActiveCategory(null)}
    >
      <div className="max-w-screen-xl mx-auto px-8 flex items-center justify-between">
        <nav className="flex items-center">
          {/* Categorías */}
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => setActiveCategory(cat.name)}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                onClick={() => setActiveCategory(null)}
                className={`
                  relative px-4 py-4 text-xs tracking-widest uppercase font-medium transition-colors duration-150 whitespace-nowrap inline-block
                  ${activeCategory === cat.name ? "text-theme-text" : "text-theme-muted hover:text-theme-text"}
                `}
              >
                {cat.name}
                {activeCategory === cat.name && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-amber-500 rounded-sm" />
                )}
              </Link>
            </div>
          ))}

          {/* Separador */}
          <div className="w-px h-4 bg-theme-border mx-2" />

          {/* Dropdown Oportunidades */}
          <div
            className="relative"
            onMouseEnter={() => setActiveCategory(FEATURED_KEY)}
          >
            <button
              className={`
                relative px-4 py-4 text-xs tracking-widest uppercase font-medium transition-colors duration-150 whitespace-nowrap
                ${activeCategory === FEATURED_KEY ? "text-theme-text" : "text-theme-muted hover:text-theme-text"}
              `}
            >
              {t("navbar.opportunities")}
              {activeCategory === FEATURED_KEY && (
                <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-amber-500 rounded-sm" />
              )}
            </button>
          </div>
        </nav>

        <div className="pl-6 border-l border-theme-border ml-2 flex-shrink-0">
          <Link
            to="/about"
            className="text-xs tracking-widest uppercase font-medium text-theme-muted hover:text-theme-text transition-colors whitespace-nowrap"
          >
            {t("navbar.aboutPlayback")}
          </Link>
        </div>
      </div>

      {/* Dropdown categorías */}
      {currentCategory?.subcategories?.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 bg-theme-bg border-b border-theme-border shadow-2xl capitalize">
          <div className="max-w-screen-xl mx-auto px-8 py-8">
            <div className="flex gap-10">
              {currentCategory?.image_url && (
                <div className="hidden lg:block flex-shrink-0 w-56">
                  <Link
                    to={`/products?category=${currentCategory.slug}`}
                    onClick={() => setActiveCategory(null)}
                    className="group block relative aspect-[3/4] overflow-hidden"
                  >
                    <img
                      src={currentCategory.image_url}
                      alt={currentCategory.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-3 left-3 text-xs text-white font-medium tracking-wider uppercase">
                      {currentCategory.name}
                    </p>
                  </Link>
                </div>
              )}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-6">
                {currentCategory.subcategories.map((sub) => (
                  <div key={sub.id} className="flex flex-col gap-2.5">
                    <Link
                      to={`/products?category=${currentCategory.slug}&subcategory=${sub.slug}`}
                      onClick={() => setActiveCategory(null)}
                      className="text-xs font-semibold tracking-widest uppercase text-theme-secondary hover:text-amber-600 transition-colors"
                    >
                      {sub.name}
                    </Link>
                    <div className="w-6 h-px bg-theme-border" />
                    {sub.items?.length > 0 && (
                      <ul className="flex flex-col gap-1.5">
                        {sub.items.map((item) => (
                          <li key={item.id}>
                            <Link
                              to={`/products?category=${currentCategory.slug}&subcategory=${sub.slug}&item=${item.slug}`}
                              onClick={() => setActiveCategory(null)}
                              className="text-xs text-theme-muted hover:text-theme-text transition-colors leading-relaxed"
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
        <div className="absolute left-0 right-0 top-full z-50 bg-theme-bg border-b border-theme-border shadow-2xl">
          <div className="max-w-screen-xl mx-auto px-8 py-8">
            <div className="flex gap-10">
              <div className="hidden lg:block flex-shrink-0 w-56">
                <Link
                  to={`/products?on_sale=true&condition=refurbished&low_stock=true`}
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
              {FEATURED_LINKS.map((link) => (
                <Link
                  key={link.key}
                  to={link.href}
                  onClick={() => setActiveCategory(null)}
                  className="text-xs font-semibold tracking-widest uppercase text-theme-secondary hover:text-amber-600 transition-colors"
                >
                  {t(`navbar.${link.key}`)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
