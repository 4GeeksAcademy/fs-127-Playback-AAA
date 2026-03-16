import { Tag, Package, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Toggle } from "./Toggle";

// Cuándo mostrar el punto de color en cada condición
export const CONDITION_DOT = {
  new: "bg-emerald-500",
  used: "bg-blue-500",
  refurbished: "bg-amber-500",
  broken: "bg-red-500",
};

// Opciones de condición disponibles (deben coincidir con el enum del backend)
const CONDITION_VALUES = ["new", "used", "refurbished", "broken"];

export const FilterPanel = ({
  // Precio
  localMin,
  setLocalMin,
  localMax,
  setLocalMax,
  onApplyPrice,
  // Condiciones
  conditions,
  onToggleCondition,
  // Toggles booleanos
  onSale,
  inStock,
  lowStock,
  onToggleOnSale,
  onToggleInStock,
  onToggleLowStock,
  // Limpiar
  activeFiltersCount,
  onClearAll,
}) => {
  const { t } = useTranslation();

  return (
    <div className="absolute left-0 top-full mt-2 w-72 bg-main border border-main rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
        {/* Sección precio */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">
            {t("search.priceSection")}
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={t("search.priceMin")}
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              className="input h-9 px-3 focus:ring-2 focus:ring-violet-500"
            />
            <span className="text-muted">—</span>
            <input
              type="number"
              placeholder={t("search.priceMax")}
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="input h-9 px-3 focus:ring-2 focus:ring-violet-500"
            />
          </div>
          {/* Aplica el precio solo al pulsar — evita fetch en cada tecla */}
          <button
            onClick={onApplyPrice}
            className="mt-2 w-full h-9 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold transition"
          >
            {t("search.applyPrice")}
          </button>
        </div>

        <div className="border-t border-main" />

        {/* Sección condición */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-muted mb-3">
            {t("search.conditionSection")}
          </p>
          <div className="space-y-1.5">
            {CONDITION_VALUES.map((val) => (
              <button
                key={val}
                onClick={() => onToggleCondition(val)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition
                  ${
                    conditions.includes(val)
                      ? "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                      : "hover:bg-muted text-main"
                  }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${CONDITION_DOT[val]}`}
                />
                {t(`enums.productCondition.${val}`)}
                {conditions.includes(val) && (
                  <span className="ml-auto text-xs font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-main" />

        {/* Toggles: en oferta / en stock / pocas unidades */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-500" />
              <span className="text-sm text-main">
                {t("search.onSale")}
              </span>
            </div>
            <Toggle checked={onSale} onChange={onToggleOnSale} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted" />
              <span className="text-sm text-main">
                {t("search.inStockOnly")}
              </span>
            </div>
            <Toggle checked={inStock} onChange={onToggleInStock} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-main">
                {t("search.lowStock")}
              </span>
            </div>
            <Toggle checked={lowStock} onChange={onToggleLowStock} />
          </div>
        </div>

        {/* Limpiar filtros — solo si hay alguno activo */}
        {activeFiltersCount > 0 && (
          <>
            <div className="border-t border-main" />
            <button
              onClick={onClearAll}
              className="w-full text-sm text-red-500 hover:text-red-600 transition font-medium"
            >
              {t("search.clearAll")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};