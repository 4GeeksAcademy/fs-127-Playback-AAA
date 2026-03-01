import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import productServices from "../services/productService";
import { SearchHeader } from "../components/Search/SearchHeader";
import { SearchToolbar } from "../components/Search/SearchToolbar";
import { ProductGrid } from "../components/Search/ProductGrid";

// Cuántos productos mostrar por página
const PRODUCTS_PER_PAGE = 20;

export const SearchPage = () => {
  const { t, i18n } = useTranslation();

  // searchParams: URL actual como objeto legible
  // setSearchParams: actualiza la URL (dispara re-render y nuevo fetch)
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Lectura de parámetros desde la URL ──────────────────────────────────────
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const item = searchParams.get("item") || "";
  const sort = searchParams.get("sort") || "relevance";

  const minPrice = searchParams.get("min_price")
    ? Number(searchParams.get("min_price"))
    : undefined;
  const maxPrice = searchParams.get("max_price")
    ? Number(searchParams.get("max_price"))
    : undefined;

  // Filtros booleanos — vienen como string "true" en la URL
  const inStock = searchParams.get("in_stock") === "true";
  const onSale = searchParams.get("on_sale") === "true";
  const lowStock = searchParams.get("low_stock") === "true";

  // Condiciones — vienen como "new,used" separadas por coma
  const conditionsParam = searchParams.get("condition") || "";
  const conditions = conditionsParam
    ? conditionsParam.split(",").filter(Boolean)
    : [];

  // ── Estado local ────────────────────────────────────────────────────────────
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Valores de precio locales — no se envían hasta pulsar "Aplicar"
  const [localMin, setLocalMin] = useState(minPrice ?? "");
  const [localMax, setLocalMax] = useState(maxPrice ?? "");

  // Refs para cerrar paneles flotantes al hacer click fuera
  const filterPanelRef = useRef(null);
  const sortPanelRef = useRef(null);

  // ── Fetch de productos ──────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);

    productServices
      .searchProducts({
        q,
        category,
        subcategory,
        item,
        sort,
        minPrice,
        maxPrice,
        inStock,
        onSale,
        lowStock,
        conditions,
      })
      .then(([data]) => {
        setResults(data || []);
        setLoading(false);
      });
  }, [searchParams.toString(), i18n.language]);

  // ── Cierre de paneles al hacer click fuera ──────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target))
        setFiltersOpen(false);
      if (sortPanelRef.current && !sortPanelRef.current.contains(e.target))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Helpers para manipular la URL ──────────────────────────────────────────

  // Añade o elimina un parámetro de la URL
  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  // Invierte un filtro booleano en la URL
  const toggleBoolParam = (key) => {
    const current = searchParams.get(key) === "true";
    setParam(key, current ? "" : "true");
  };

  // Añade o quita una condición del array activo
  const toggleCondition = (val) => {
    const next = conditions.includes(val)
      ? conditions.filter((c) => c !== val)
      : [...conditions, val];
    setParam("condition", next.join(","));
  };

  // Aplica el rango de precio al pulsar el botón
  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    if (localMin !== "") next.set("min_price", localMin);
    else next.delete("min_price");
    if (localMax !== "") next.set("max_price", localMax);
    else next.delete("max_price");
    setSearchParams(next);
    setFiltersOpen(false);
  };

  // Elimina todos los filtros preservando búsqueda y navegación de categoría
  const clearAllFilters = () => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (category) next.set("category", category);
    if (subcategory) next.set("subcategory", subcategory);
    if (item) next.set("item", item);
    setLocalMin("");
    setLocalMax("");
    setSearchParams(next);
  };

  // ── Chips de filtros activos ────────────────────────────────────────────────
  const activeFilters = [
    minPrice && {
      key: "min_price",
      label: t("search.filterChip_min_price", { value: minPrice }),
      clear: () => {
        setLocalMin("");
        setParam("min_price", "");
      },
    },
    maxPrice && {
      key: "max_price",
      label: t("search.filterChip_max_price", { value: maxPrice }),
      clear: () => {
        setLocalMax("");
        setParam("max_price", "");
      },
    },
    inStock && {
      key: "in_stock",
      label: t("search.filterChip_in_stock"),
      clear: () => setParam("in_stock", ""),
    },
    onSale && {
      key: "on_sale",
      label: t("search.filterChip_on_sale"),
      clear: () => setParam("on_sale", ""),
    },
    lowStock && {
      key: "low_stock",
      label: t("search.filterChip_low_stock"),
      clear: () => setParam("low_stock", ""),
    },
    ...conditions.map((c) => ({
      key: `condition_${c}`,
      label: t(`enums.productCondition.${c}`),
      clear: () => toggleCondition(c),
    })),
  ].filter(Boolean);

  // ── Paginación ──────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(results.length / PRODUCTS_PER_PAGE);
  const paginated = results.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  // Nombres traducidos — extraídos del primer resultado del fetch.
  // El fetch se repite al cambiar i18n.language, así que siempre llegan
  // en el idioma correcto. Fallback al slug formateado mientras carga o si no hay resultados.
  const categoryName = results[0]?.category_name || category.replace(/-/g, " ");
  const subcategoryName =
    results[0]?.subcategory_name || subcategory.replace(/-/g, " ");
  const itemName = results[0]?.item_name || item.replace(/-/g, " ");

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
      {/* Breadcrumb + título + contador */}
      <SearchHeader
        category={category}
        categoryName={categoryName}
        subcategory={subcategory}
        subcategoryName={subcategoryName}
        item={item}
        itemName={itemName}
        q={q}
        loading={loading}
        resultsCount={results.length}
        onRemoveCategory={() => {
          const next = new URLSearchParams(searchParams);
          next.delete("category");
          next.delete("subcategory");
          next.delete("item");
          setSearchParams(next);
        }}
        onRemoveSubcategory={() => {
          const next = new URLSearchParams(searchParams);
          next.delete("subcategory");
          next.delete("item");
          setSearchParams(next);
        }}
        onRemoveItem={() => {
          const next = new URLSearchParams(searchParams);
          next.delete("item");
          setSearchParams(next);
        }}
      />

      {/* Filtros + ordenación + chips */}
      <SearchToolbar
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filterPanelRef={filterPanelRef}
        localMin={localMin}
        setLocalMin={setLocalMin}
        localMax={localMax}
        setLocalMax={setLocalMax}
        onApplyPrice={applyPriceFilter}
        conditions={conditions}
        onToggleCondition={toggleCondition}
        onSale={onSale}
        onToggleOnSale={() => toggleBoolParam("on_sale")}
        inStock={inStock}
        onToggleInStock={() => toggleBoolParam("in_stock")}
        lowStock={lowStock}
        onToggleLowStock={() => toggleBoolParam("low_stock")}
        activeFilters={activeFilters}
        onClearAll={clearAllFilters}
        sortPanelRef={sortPanelRef}
        sortOpen={sortOpen}
        setSortOpen={setSortOpen}
        currentSort={sort}
        onSelectSort={(val) => setParam("sort", val)}
      />

      {/* Grid de productos / skeleton / estado vacío */}
      <ProductGrid
        loading={loading}
        products={paginated}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        activeFiltersCount={activeFilters.length}
        onClearAll={clearAllFilters}
      />
    </div>
  );
};
