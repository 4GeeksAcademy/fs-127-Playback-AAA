import { useTranslation } from "react-i18next";

export const SearchHeader = ({
  // Slugs — usados solo para saber si mostrar el breadcrumb y para navegación
  category,
  subcategory,
  item,
  q,
  // Nombres — estos son los que se muestran al usuario
  categoryName,
  subcategoryName,
  itemName,
  // Estado
  loading,
  resultsCount,
  // Callbacks para eliminar cada nivel del breadcrumb
  onRemoveCategory,
  onRemoveSubcategory,
  onRemoveItem,
}) => {
  const { t } = useTranslation();

  // Título de la página: item > subcategoría > categoría > búsqueda > "Todos"
  const pageTitle = item
    ? itemName
    : subcategory
      ? subcategoryName
      : category
        ? categoryName
        : q
          ? `"${q}"`
          : t("search.allProducts");

  return (
    <div className="mb-6">
      {/* Breadcrumb — solo si hay al menos un filtro de categoría activo */}
      {(category || subcategory || item) && (
        <div className="flex items-center gap-1 flex-wrap mb-1">
          {/* Categoría: al pulsar elimina categoría + subcategoría + item */}
          {category && (
            <button
              onClick={onRemoveCategory}
              className="text-xs tracking-widest text-theme-muted hover:text-red-500 capitalize transition"
            >
              {categoryName}
            </button>
          )}

          {/* Subcategoría: al pulsar elimina subcategoría + item */}
          {subcategory && (
            <>
              <span className="text-xs text-theme-faint">›</span>
              <button
                onClick={onRemoveSubcategory}
                className="text-xs tracking-widest text-theme-muted hover:text-red-500 capitalize transition"
              >
                {subcategoryName}
              </button>
            </>
          )}

          {/* Item: al pulsar solo elimina el item */}
          {item && (
            <>
              <span className="text-xs text-theme-faint">›</span>
              <button
                onClick={onRemoveItem}
                className="text-xs tracking-widest text-theme-muted hover:text-red-500 capitalize transition"
              >
                {itemName}
              </button>
            </>
          )}
        </div>
      )}

      {/* Título y contador de resultados */}
      <h1 className="text-2xl font-semibold text-theme-text capitalize">
        {pageTitle}
      </h1>
      <p className="text-sm text-theme-muted mt-1">
        {loading
          ? t("search.searching")
          : t("search.productCount", { count: resultsCount })}
      </p>
    </div>
  );
};
