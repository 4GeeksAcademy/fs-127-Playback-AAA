import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ListFilter } from "lucide-react";
import productServices from "../../services/productService";

// Enlaces de "Oportunidades"
const FEATURED_LINKS = [
  { key: "onSale",      href: "/products?on_sale=true" },
  { key: "lowStock",    href: "/products?low_stock=true" },
  { key: "refurbished", href: "/products?condition=refurbished" },
];

const FEATURED_KEY = "__featured__";

export const CategorybarMobile = ({ categories }) => {
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState({ onSale: [], lowStock: [], refurbished: [] });

  const toggleMobileCategory = (name) => setMobileOpen((prev) => (prev === name ? null : name));
  const closeAll = () => { setMobileOpen(null); setMobilePanelOpen(false); };

  // Carga los productos de oportunidades al montar
  useEffect(() => {
    Promise.all([
      productServices.searchProducts({ onSale: true,              limit: 5 }),
      productServices.searchProducts({ lowStock: true,            limit: 5 }),
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
    <div className="max-[950px]:block hidden bg-main border-b border-main">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => { setMobilePanelOpen((v) => !v); setMobileOpen(null); }}
          className="flex items-center gap-2.5 text-xs tracking-widest uppercase font-medium text-sub"
        >
          <ListFilter className={`transition-transform duration-300 ease-in-out ${mobilePanelOpen ? "rotate-180" : "rotate-0"}`} />
          {t("navbar.labelCategories")}
        </button>
        <Link to="/about" className="text-xs tracking-widest uppercase font-medium text-muted hover:text-main transition-colors">
          {t("navbar.aboutPlayback")}
        </Link>
      </div>

      {mobilePanelOpen && (
        <div className="border-t border-[rgb(var(--color-border-sm))] divide-y divide-[rgb(var(--color-border-sm))]">
          {/* Categorías */}
          {categories.map((cat) => (
            <div key={cat.id}>
              <button
                onClick={() => toggleMobileCategory(cat.name)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="text-xs tracking-widest uppercase font-medium text-sub">{cat.name}</span>
                {cat.subcategories?.length > 0 && (
                  <svg className={`w-2.5 h-2.5 text-faint transition-transform ${mobileOpen === cat.name ? "rotate-180" : ""}`} viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1l4 4 4-4" />
                  </svg>
                )}
              </button>

              {mobileOpen === cat.name && cat.subcategories?.length > 0 && (
                <div className="bg-subtle px-4 pt-4 pb-6">
                  <div className="flex flex-col gap-5">
                    <Link to={`/products?category=${cat.slug}`} onClick={closeAll} className="text-xs tracking-widest uppercase font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                      {t("navbar.viewAll")} {cat.name}
                    </Link>
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id}>
                        <Link
                          to={`/products?category=${cat.slug}&subcategory=${sub.slug}`}
                          onClick={closeAll}
                          className="block text-xs tracking-widest uppercase font-semibold text-sub hover:text-amber-600 transition-colors mb-2"
                        >
                          {sub.name}
                        </Link>
                        <div className="w-5 h-px bg-[rgb(var(--color-border))] mb-2" />
                        {sub.items?.length > 0 && (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            {sub.items.map((item) => (
                              <Link
                                key={item.id}
                                to={`/products?category=${cat.slug}&subcategory=${sub.slug}&item=${item.slug}`}
                                onClick={closeAll}
                                className="text-xs text-muted hover:text-main transition-colors"
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
          <div className="w-full h-px bg-[rgb(var(--color-border))]" />

          {/* Oportunidades */}
          <div>
            <button
              onClick={() => toggleMobileCategory(FEATURED_KEY)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
            >
              <span className="text-xs tracking-widest uppercase font-medium text-sub">{t("navbar.opportunities")}</span>
              <svg className={`w-2.5 h-2.5 text-faint transition-transform ${mobileOpen === FEATURED_KEY ? "rotate-180" : ""}`} viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l4 4 4-4" />
              </svg>
            </button>

            {mobileOpen === FEATURED_KEY && (
              <div className="bg-subtle px-4 pt-4 pb-6 flex flex-col gap-6">
                {FEATURED_LINKS.map((link) => (
                  <div key={link.key} className="flex flex-col gap-2">
                    {/* Cabecera de sección */}
                    <Link
                      to={link.href} onClick={closeAll}
                      className="text-xs tracking-widest uppercase font-semibold text-sub hover:text-amber-600 transition-colors"
                    >
                      {t(`navbar.${link.key}`)}
                    </Link>
                    <div className="w-5 h-px bg-[rgb(var(--color-border))]" />

                    {/* Lista de productos */}
                    <ul className="flex flex-col gap-2">
                      {featuredProducts[link.key]?.map((product) => (
                        <li key={product.id}>
                          <Link
                            to={`/product/${product.id}`}
                            onClick={closeAll}
                            className="flex items-center gap-2 group"
                          >
                            <img
                              src={product.image_url || "https://placehold.co/40x40?text=?"}
                              alt={product.name}
                              className="w-8 h-8 object-cover rounded flex-shrink-0 border border-main"
                              onError={(e) => (e.target.src = "https://placehold.co/40x40?text=?")}
                            />
                            <div className="min-w-0">
                              <p className="text-xs text-muted group-hover:text-main transition-colors truncate">
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
                      to={link.href} onClick={closeAll}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      {t("navbar.viewAll")} →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};