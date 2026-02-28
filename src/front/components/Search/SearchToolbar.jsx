import { useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FilterPanel } from "./FilterPanel";
import { SortDropdown } from "./SortDropdown";

export const SearchToolbar = ({
  // Panel de filtros
  filtersOpen,
  setFiltersOpen,
  filterPanelRef,
  // Datos de filtros
  localMin,
  setLocalMin,
  localMax,
  setLocalMax,
  onApplyPrice,
  conditions,
  onToggleCondition,
  onSale,
  inStock,
  lowStock,
  onToggleOnSale,
  onToggleInStock,
  onToggleLowStock,
  // Chips de filtros activos
  activeFilters,
  onClearAll,
  // Ordenación
  sortPanelRef,
  sortOpen,
  setSortOpen,
  currentSort,
  onSelectSort,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Botón de filtros + panel desplegable */}
      <div className="relative" ref={filterPanelRef}>
        <button
          onClick={() => {
            setFiltersOpen((v) => !v);
            setSortOpen(false);
          }}
          className={`flex items-center gap-2 h-9 px-4 rounded-full border text-sm font-medium transition
            ${
              filtersOpen || activeFilters.length > 0
                ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                : "border-theme-border bg-theme-input text-theme-secondary hover:bg-theme-muted"
            }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t("search.filters")}
          {/* Badge con el número de filtros activos */}
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
            onApplyPrice={onApplyPrice}
            conditions={conditions}
            onToggleCondition={onToggleCondition}
            onSale={onSale}
            onToggleOnSale={onToggleOnSale}
            inStock={inStock}
            onToggleInStock={onToggleInStock}
            lowStock={lowStock}
            onToggleLowStock={onToggleLowStock}
            activeFiltersCount={activeFilters.length}
            onClearAll={() => {
              onClearAll();
              setFiltersOpen(false);
            }}
          />
        )}
      </div>

      {/* Dropdown de ordenación */}
      <SortDropdown
        sortPanelRef={sortPanelRef}
        sortOpen={sortOpen}
        setSortOpen={setSortOpen}
        currentSort={currentSort}
        onSelect={onSelectSort}
        onOpen={() => setFiltersOpen(false)}
      />

      {/* Chips de filtros activos — uno por filtro aplicado */}
      {activeFilters.map((f) => (
        <button
          key={f.key}
          onClick={f.clear}
          className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-theme-border bg-theme-input text-xs text-theme-secondary hover:bg-theme-muted transition capitalize"
        >
          {f.label}
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
};
