import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ListFilter } from "lucide-react";

// Enlaces de "Oportunidades"
const FEATURED_LINKS = [
  { key: "onSale", href: "/products?on_sale=true" },
  { key: "lowStock", href: "/products?low_stock=true" },
  { key: "refurbished", href: "/products?condition=refurbished" },
];

const FEATURED_KEY = "__featured__";

export const CategorybarMobile = ({ categories }) => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const toggleMobileCategory = (name) => {
    setMobileOpen((prev) => (prev === name ? null : name));
  };

  const closeAll = () => {
    setMobileOpen(null);
    setMobilePanelOpen(false);
  };

  return (
    <div className="max-[950px]:block hidden bg-theme-bg border-b border-theme-border">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => {
            setMobilePanelOpen((v) => !v);
            setMobileOpen(null);
          }}
          className="flex items-center gap-2.5 text-xs tracking-widest uppercase font-medium text-theme-secondary"
        >
          <ListFilter
            className={`transition-transform duration-300 ease-in-out ${
              mobilePanelOpen ? "rotate-180" : "rotate-0"
            }`}
          />
          {t("navbar.labelCategories")}
        </button>

        <Link
          to="/about"
          className="text-xs tracking-widest uppercase font-medium text-theme-muted hover:text-theme-text transition-colors"
        >
          {t("navbar.aboutPlayback")}
        </Link>
      </div>

      {mobilePanelOpen && (
        <div className="border-t border-theme-border-sm divide-y divide-theme-border-sm">
          {/* Categorías */}
          {categories.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => toggleMobileCategory(cat.name)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="text-xs tracking-widest uppercase font-medium text-theme-secondary">
                  {cat.name}
                </span>
                {cat.subcategories?.length > 0 && (
                  <svg
                    className={`w-2.5 h-2.5 text-theme-faint transition-transform ${mobileOpen === cat.name ? "rotate-180" : ""}`}
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M1 1l4 4 4-4" />
                  </svg>
                )}
              </button>

              {mobileOpen === cat.name && cat.subcategories?.length > 0 && (
                <div className="bg-theme-subtle px-4 pt-4 pb-6">
                  <div className="flex flex-col gap-5">
                    <Link
                      to={`/products?category=${cat.slug}`}
                      onClick={closeAll}
                      className="text-xs tracking-widest uppercase font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      {t("navbar.viewAll")} {cat.name}
                    </Link>
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id}>
                        <Link
                          to={`/products?category=${cat.slug}&subcategory=${sub.slug}`}
                          onClick={closeAll}
                          className="block text-xs tracking-widest uppercase font-semibold text-theme-secondary hover:text-amber-600 transition-colors mb-2"
                        >
                          {sub.name}
                        </Link>
                        <div className="w-5 h-px bg-theme-border mb-2" />
                        {sub.items?.length > 0 && (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            {sub.items.map((item) => (
                              <Link
                                key={item.id}
                                to={`/products?category=${cat.slug}&subcategory=${sub.slug}&item=${item.slug}`}
                                onClick={closeAll}
                                className="text-xs text-theme-muted hover:text-theme-text transition-colors"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Separador */}
          <div className="w-full h-px bg-theme-border" />

          {/* Oportunidades */}
          <div>
            <button
              onClick={() => toggleMobileCategory(FEATURED_KEY)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-xs tracking-widest uppercase font-medium text-theme-secondary">
                {t("navbar.opportunities")}
              </span>
              <svg
                className={`w-2.5 h-2.5 text-theme-faint transition-transform ${mobileOpen === FEATURED_KEY ? "rotate-180" : ""}`}
                viewBox="0 0 10 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M1 1l4 4 4-4" />
              </svg>
            </button>

            {mobileOpen === FEATURED_KEY && (
              <div className="bg-theme-subtle px-4 pt-4 pb-6 flex flex-col gap-3">
                {FEATURED_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    to={link.href}
                    onClick={closeAll}
                    className="text-xs tracking-widest uppercase font-semibold text-theme-secondary hover:text-amber-600 transition-colors"
                  >
                    {t(`navbar.${link.key}`)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
