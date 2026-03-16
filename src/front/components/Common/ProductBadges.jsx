import { Flame, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

const CONDITION_BADGE_CLASS = {
  new:         "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
  used:        "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  refurbished: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  broken:      "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

export const ProductBadges = ({
  discount = 0,
  lowStock = false,
  condition = "",
  className = "",
}) => {
  const { t } = useTranslation();

  if (!discount && !lowStock && !CONDITION_BADGE_CLASS[condition]) return null;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {discount > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Tag className="w-3 h-3" />
          -{discount}%
        </span>
      )}
      {lowStock && (
        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Flame className="w-3 h-3" />
          {t("search.lowStockBadge")}
        </span>
      )}
      {CONDITION_BADGE_CLASS[condition] && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_BADGE_CLASS[condition]}`}>
          {t(`enums.productCondition.${condition}`)}
        </span>
      )}
    </div>
  );
};