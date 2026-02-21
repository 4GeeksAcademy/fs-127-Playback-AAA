import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCategoriesService } from "../services/categoryService";

export const Categorybar = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  useEffect(() => {
    getCategoriesService().then(([data, error]) => {
      if (error) {
        console.error("Error cargando categorías:", error);
        return;
      }

      // 👇 Ordenar todo por position
      const sorted = data
        .sort((a, b) => a.position - b.position)
        .map((cat) => ({
          ...cat,
          subcategories: (cat.subcategories || [])
            .sort((a, b) => a.position - b.position)
            .map((sub) => ({
              ...sub,
              items: (sub.items || []).sort((a, b) => a.position - b.position),
            })),
        }));

      setCategories(sorted);
    });
  }, []);

  const currentCategory = categories.find((c) => c.name === activeCategory);

  const toggleMobileCategory = (name) => {
    setMobileOpen((prev) => (prev === name ? null : name));
  };

  return (
    <>
      {/* ─────────────── DESKTOP ─────────────── */}
      <div
        className="relative bg-white border-b border-gray-200 hidden md:block"
        onMouseLeave={() => setActiveCategory(null)}
      >
        <div className="max-w-screen-xl mx-auto px-8 flex items-center justify-between">
          <nav className="flex items-center">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setActiveCategory(cat.name)}
              >
                <button
                  onClick={() =>
                    setActiveCategory((prev) =>
                      prev === cat.name ? null : cat.name,
                    )
                  }
                  className={`
                    relative px-4 py-4 text-xs tracking-widest uppercase font-medium transition-colors duration-150 whitespace-nowrap
                    ${
                      activeCategory === cat.name
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }
                  `}
                >
                  {cat.name}
                  {activeCategory === cat.name && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-amber-500 rounded-sm" />
                  )}
                </button>
              </div>
            ))}
          </nav>

          <div className="pl-6 border-l border-gray-200 ml-2 flex-shrink-0">
            <Link
              to="/about"
              className="text-xs tracking-widest uppercase font-medium text-gray-500 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              Acerca de Playback
            </Link>
          </div>
        </div>

        {/* ── Dropdown ── */}
        {currentCategory?.subcategories?.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 bg-white border-b border-gray-200 shadow-2xl">
            <div className="max-w-screen-xl mx-auto px-8 py-8">
              <div className="flex gap-10">
                {currentCategory?.image_url && (
                  <div className="hidden lg:block flex-shrink-0 w-56">
                    <Link
                      to={`/category/${currentCategory.slug}`}
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
                        to={`/category/${currentCategory.slug}/${sub.slug}`}
                        onClick={() => setActiveCategory(null)}
                        className="text-xs font-semibold tracking-widest uppercase text-gray-700 hover:text-amber-600 transition-colors"
                      >
                        {sub.name}
                      </Link>

                      <div className="w-6 h-px bg-gray-200" />

                      {sub.items?.length > 0 && (
                        <ul className="flex flex-col gap-1.5">
                          {sub.items.map((item) => (
                            <li key={item.id}>
                              <Link
                                to={`/category/${currentCategory.slug}/${sub.slug}/${item.slug}`}
                                onClick={() => setActiveCategory(null)}
                                className="text-xs text-gray-500 hover:text-gray-900 transition-colors leading-relaxed"
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
      </div>

      {/* ─────────────── MOBILE ─────────────── */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => {
              setMobilePanelOpen((v) => !v);
              setMobileOpen(null);
            }}
            className="flex items-center gap-2.5 text-xs tracking-widest uppercase font-medium text-gray-700"
          >
            <span className="relative w-5 h-3.5 flex flex-col justify-between">
              <span
                className={`block h-px bg-current transition-all duration-200 origin-center ${mobilePanelOpen ? "rotate-45 translate-y-[6px]" : ""}`}
              />
              <span
                className={`block h-px bg-current transition-all duration-200 ${mobilePanelOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-px bg-current transition-all duration-200 origin-center ${mobilePanelOpen ? "-rotate-45 -translate-y-[6px]" : ""}`}
              />
            </span>
            Categorías
          </button>

          <Link
            to="/about"
            className="text-xs tracking-widest uppercase font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Acerca de Playback
          </Link>
        </div>

        {mobilePanelOpen && (
          <div className="border-t border-gray-100 divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => toggleMobileCategory(cat.name)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <span className="text-xs tracking-widest uppercase font-medium text-gray-700">
                    {cat.name}
                  </span>
                  {cat.subcategories?.length > 0 && (
                    <svg
                      className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 text-gray-400 ${
                        mobileOpen === cat.name ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 10 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M1 1l4 4 4-4" />
                    </svg>
                  )}
                </button>

                {mobileOpen === cat.name && cat.subcategories?.length > 0 && (
                  <div className="bg-gray-50 px-4 pt-4 pb-6">
                    <div className="flex flex-col gap-5">
                      {cat.subcategories.map((sub) => (
                        <div key={sub.id}>
                          <Link
                            to={`/category/${cat.slug}/${sub.slug}`}
                            onClick={() => {
                              setMobileOpen(null);
                              setMobilePanelOpen(false);
                            }}
                            className="block text-xs tracking-widest uppercase font-semibold text-gray-700 hover:text-amber-600 transition-colors mb-2"
                          >
                            {sub.name}
                          </Link>

                          <div className="w-5 h-px bg-gray-200 mb-2" />

                          {sub.items?.length > 0 && (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                              {sub.items.map((item) => (
                                <Link
                                  key={item.id}
                                  to={`/category/${cat.slug}/${sub.slug}/${item.slug}`}
                                  onClick={() => {
                                    setMobileOpen(null);
                                    setMobilePanelOpen(false);
                                  }}
                                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
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
          </div>
        )}
      </div>
    </>
  );
};
