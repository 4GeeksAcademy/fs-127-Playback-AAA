import { useTranslation } from "react-i18next";
import { ProductCard } from "./ProductCard";
import { Pagination } from "../Pagination";

export const ProductGrid = ({
  loading,
  products, // productos de la página actual (ya paginados)
  totalPages,
  currentPage,
  onPageChange,
  activeFiltersCount,
  onClearAll,
}) => {
  const { t } = useTranslation();

  // ── Skeleton de carga ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-main overflow-hidden animate-pulse"
          >
            <div className="w-full h-48 bg-muted" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Estado vacío ───────────────────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-main font-medium mb-1">
          {t("search.noResults")}
        </p>
        <p className="text-sm text-muted mb-4">
          {t("search.noResultsHint")}
        </p>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
          >
            {t("search.clearFilters")}
          </button>
        )}
      </div>
    );
  }

  // ── Grid de productos ──────────────────────────────────────────────────────
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Paginación — solo si hay más de una página */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            onPageChange(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </>
  );
};