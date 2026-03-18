import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FavoriteButton } from "../Common/FavoriteButton";
import { StarRating } from "../Common/StarRating";

// Clases del badge de condición (los productos "new" no muestran badge)
const CONDITION_BADGE_CLS = {
  new: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
  used: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  refurbished:
    "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  broken: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

export const ProductCard = ({ product }) => {
  const { t } = useTranslation();

  // Precio final aplicando el descuento si existe
  const finalPrice =
    product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price;

  // Los productos nuevos no muestran badge de condición (es el estado por defecto)
  const isNew = product.condition === "new";

  return (
    <Link
      to={`/product/${product.id}`}
      className="group rounded-2xl border border-main bg-main hover:shadow-lg transition overflow-hidden flex flex-col"
    >
      {/* Imagen con badges superpuestos */}
      <div className="relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) =>
              (e.target.src = "https://placehold.co/300x300?text=Sin+imagen")
            }
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center text-faint text-xs" />
        )}

        {/* Badges: descuento y pocas unidades */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
          {product.low_stock && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {t("search.lowStockBadge")}
            </span>
          )}
        </div>

        {/* Botón de favorito — esquina superior derecha */}
        <FavoriteButton product={product} className="absolute top-2 right-2" />
      </div>

      {/* Info del producto */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {/* Badge de condición — solo si NO es "new" */}
        {!isNew && CONDITION_BADGE_CLS[product.condition] && (
          <span
            className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_BADGE_CLS[product.condition]}`}
          >
            {t(`enums.productCondition.${product.condition}`)}
          </span>
        )}

        {/* Nombre */}
        <p className="text-sm font-medium text-main truncate">{product.name}</p>

        {/* Ruta de categoría: categoría › subcategoría › item */}
        <p className="text-xs text-muted truncate capitalize">
          {[product.category_name, product.subcategory_name, product.item_name]
            .filter(Boolean)
            .join(" › ")}
        </p>

        {/* Valoración media — solo si tiene reviews */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted">{product.rating}</span>
          </div>
        )}

        {/* Precio — con tachado si tiene descuento */}
        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
            {finalPrice.toFixed(2)}€
          </span>
          {product.discount > 0 && (
            <span className="text-xs text-muted line-through">
              {product.price.toFixed(2)}€
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
