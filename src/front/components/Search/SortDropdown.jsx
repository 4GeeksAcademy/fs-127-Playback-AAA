import { ArrowUpDown, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

// Opciones de ordenación disponibles (deben coincidir con el backend)
const SORT_VALUES = [
  "relevance",
  "price_asc",
  "price_desc",
  "rating",
  "newest",
  "discount",
  "stock_asc",
];

export const SortDropdown = ({
  sortPanelRef,
  sortOpen,
  setSortOpen,
  currentSort,
  onSelect,
  onOpen, // callback para cerrar otros paneles al abrir este
}) => {
  const { t } = useTranslation();

  const sortLabel = t(`search.sort_${currentSort}`, {
    defaultValue: t("search.sort_relevance"),
  });

  return (
    <div className="relative" ref={sortPanelRef}>
      <button
        onClick={() => {
          setSortOpen((v) => !v);
          onOpen?.();
        }}
        className="flex items-center gap-2 h-9 px-4 rounded-full border border-theme-border bg-theme-input text-sm font-medium text-theme-secondary hover:bg-theme-muted transition"
      >
        <ArrowUpDown className="w-4 h-4" />
        {sortLabel}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${sortOpen ? "rotate-180" : ""}`}
        />
      </button>

      {sortOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 bg-theme-bg border border-theme-border rounded-2xl shadow-xl py-1.5 z-50">
          {SORT_VALUES.map((val) => (
            <button
              key={val}
              onClick={() => {
                onSelect(val);
                setSortOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition hover:bg-theme-muted
                ${
                  currentSort === val
                    ? "text-violet-600 dark:text-violet-400 font-semibold"
                    : "text-theme-text"
                }`}
            >
              {t(`search.sort_${val}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
