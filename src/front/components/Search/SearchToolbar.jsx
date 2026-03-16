import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterPanel } from "./FilterPanel";
import { SortDropdown } from "./SortDropdown";

export const SearchToolbar = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Lee los filtros activos desde la URL
  const sort = searchParams.get("sort") || "relevance";
  const onSale = searchParams.get("on_sale") === "true";
  const inStock = searchParams.get("in_stock") === "true";
  const lowStock = searchParams.get("low_stock") === "true";
  const minPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
  const maxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
  const conditionsParam = searchParams.get("condition") || "";
  const conditions = conditionsParam ? conditionsParam.split(",").filter(Boolean) : [];

  // Estado local de los inputs de precio — no se aplican hasta pulsar el botón
  const [localMin, setLocalMin] = useState(minPrice ?? "");
  const [localMax, setLocalMax] = useState(maxPrice ?? "");

  // Estado de los paneles desplegables
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Refs para cerrar al hacer click fuera
  const filterPanelRef = useRef(null);
  const sortPanelRef = useRef(null);

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

  // ── Helpers para modificar la URL ─────────────────────────────────────────

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const toggleBoolParam = (key) => {
    const current = searchParams.get(key) === "true";
    setParam(key, current ? "" : "true");
  };

  const toggleCondition = (val) => {
    const next = conditions.includes(val)
      ? conditions.filter((c) => c !== val)
      : [...conditions, val];
    setParam("condition", next.join(","));
  };

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    if (localMin !== "") next.set("min_price", localMin);
    else next.delete("min_price");
    if (localMax !== "") next.set("max_price", localMax);
    else next.delete("max_price");
    setSearchParams(next);
    setFiltersOpen(false);
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams();
    // Preserva solo búsqueda y navegación de categoría
    ["q", "category", "subcategory", "item"].forEach((key) => {
      if (searchParams.get(key)) next.set(key, searchParams.get(key));
    });
    setLocalMin("");
    setLocalMax("");
    setSearchParams(next);
  };

  // ── Chips de filtros activos ───────────────────────────────────────────────

  const activeFilters = [
    minPrice && {
      key: "min_price",
      label: t("search.filterChip_min_price", { value: minPrice }),
      clear: () => { setLocalMin(""); setParam("min_price", ""); },
    },
    maxPrice && {
      key: "max_price",
      label: t("search.filterChip_max_price", { value: maxPrice }),
      clear: () => { setLocalMax(""); setParam("max_price", ""); },
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

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Botón de filtros + panel desplegable */}
      <div className="relative" ref={filterPanelRef}>
        <button
          onClick={() => { setFiltersOpen((v) => !v); setSortOpen(false); }}
          className={`flex items-center gap-2 h-9 px-4 rounded-full border text-sm font-medium transition
            ${filtersOpen || activeFilters.length > 0
              ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
              : "border-main bg-[rgb(var(--color-bg-input))] text-sub hover:bg-muted"
            }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t("search.filters")}
          {activeFilters.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center font-bold">
              {activeFilters.length}
            </span>
          )}
        </button>

        {filtersOpen && (
          <FilterPanel
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
            activeFiltersCount={activeFilters.length}
            onClearAll={() => { clearAllFilters(); setFiltersOpen(false); }}
          />
        )}
      </div>

      {/* Dropdown de ordenación */}
      <SortDropdown
        sortPanelRef={sortPanelRef}
        sortOpen={sortOpen}
        setSortOpen={setSortOpen}
        currentSort={sort}
        onSelect={(val) => setParam("sort", val)}
        onOpen={() => setFiltersOpen(false)}
      />

      {/* Chips de filtros activos */}
      {activeFilters.map((f) => (
        <button
          key={f.key}
          onClick={f.clear}
          className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-main bg-[rgb(var(--color-bg-input))] text-xs text-sub hover:bg-muted transition capitalize"
        >
          {f.label}
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
};