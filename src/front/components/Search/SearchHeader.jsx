import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const SearchHeader = ({
  loading,
  resultsCount,
  // Nombres traducidos, si no llegan usa el slug como fallback
  categoryName: categoryNameProp,
  subcategoryName: subcategoryNameProp,
  itemName: itemNameProp,
}) => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const item = searchParams.get("item") || "";

  // Usa el nombre traducido si llega como prop, si no formatea el slug
  const categoryName = categoryNameProp || category.replace(/-/g, " ");
  const subcategoryName = subcategoryNameProp || subcategory.replace(/-/g, " ");
  const itemName = itemNameProp || item.replace(/-/g, " ");

  const pageTitle = item
    ? itemName
    : subcategory
      ? subcategoryName
      : category
        ? categoryName
        : q
          ? `"${q}"`
          : t("search.allProducts");

  const removeCategory = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("category");
    next.delete("subcategory");
    next.delete("item");
    setSearchParams(next);
  };

  const removeSubcategory = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("subcategory");
    next.delete("item");
    setSearchParams(next);
  };

  const removeItem = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("item");
    setSearchParams(next);
  };

  return (
    <div className="mb-6">
      {(category || subcategory || item) && (
        <div className="flex items-center gap-1 flex-wrap mb-1">
          {category && (
            <button
              onClick={removeCategory}
              className="text-xs tracking-widest text-muted hover:text-red-500 capitalize transition"
            >
              {categoryName}
            </button>
          )}
          {subcategory && (
            <>
              <span className="text-xs text-faint">›</span>
              <button
                onClick={removeSubcategory}
                className="text-xs tracking-widest text-muted hover:text-red-500 capitalize transition"
              >
                {subcategoryName}
              </button>
            </>
          )}
          {item && (
            <>
              <span className="text-xs text-faint">›</span>
              <button
                onClick={removeItem}
                className="text-xs tracking-widest text-muted hover:text-red-500 capitalize transition"
              >
                {itemName}
              </button>
            </>
          )}
        </div>
      )}

      <h1 className="text-2xl font-semibold text-main capitalize">
        {pageTitle}
      </h1>
      <p className="text-sm text-muted mt-1">
        {loading
          ? t("search.searching")
          : t("search.productCount", { count: resultsCount })}
      </p>
    </div>
  );
};