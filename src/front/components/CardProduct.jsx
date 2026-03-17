import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FavoriteButton } from "./FavoriteButton";
import { ProductBadges } from "./Common/ProductBadges";
import { ProductPrice } from "./Common/ProductPrice";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { StarRating } from "./StarRating";
import orderService from "../services/orderService";

export const CardProduct = ({ product }) => {
  const { store, dispatch } = useGlobalReducer();
  const { t } = useTranslation();
  const {
    id,
    name,
    price,
    image_url,
    discount,
    low_stock,
    condition,
    rating,
    Review,
    stock,
  } = product;

  const [toast, setToast] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  const enCarrito = store.cart?.find((item) => item.id === id)?.quantity || 0;
  const inStock = stock == null ? true : stock > 0;
  const stockAgotado = stock != null && enCarrito >= stock;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingCart) return;

    const token = store.token || localStorage.getItem("token");

    if (!token) {
      setToast({ type: "auth" });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    if (stock != null && enCarrito >= stock) {
      setToast({ type: "sin_stock" });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setClicked(true);
    setTimeout(() => setClicked(false), 300);

    setLoadingCart(true);
    const [, error] = await orderService.addProductToCart(token, id, 1);
    setLoadingCart(false);

    if (error) return;

    dispatch({ type: "cart_add", payload: { id, quantity: 1 } });
    setToast({ type: "success" });
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 text-white dark:text-stone-900 text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in ${
            toast.type === "auth" || toast.type === "sin_stock"
              ? "bg-red-600 dark:bg-red-500"
              : "bg-stone-900 dark:bg-stone-100"
          }`}
        >
          {toast.type === "auth" || toast.type === "sin_stock" ? (
            <X size={15} />
          ) : (
            <ShoppingCart size={15} />
          )}
          {toast.type === "auth"
            ? t("product.loginRequired")
            : toast.type === "sin_stock"
              ? t("product.noStock")
              : t("product.addedToCart")}
        </div>
      )}

      <Link to={`/product/${id}`} className="block">
        <div className="cursor-pointer p-1">
          <div className="relative overflow-hidden">
            <img
              src={image_url || "https://placehold.co/300x300?text=Sin+imagen"}
              alt={name}
              className="w-full h-40 sm:h-44 md:h-64 lg:h-80 object-cover"
              onError={(e) =>
                (e.target.src = "https://placehold.co/300x300?text=Sin+imagen")
              }
            />
            <ProductBadges
              discount={discount}
              lowStock={low_stock}
              condition={condition}
              className="absolute top-2 left-2"
            />
            <FavoriteButton
              product={product}
              className="absolute top-3 right-3"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm pt-3 text-main">{name}</p>
              <ProductPrice
                price={price}
                discount={discount}
                className="pb-3"
              />
              {Review > 0 && (
                <div className="flex items-center gap-1">
                  <StarRating rating={rating} />
                  <span className="text-xs text-stone-400">({Review})</span>
                </div>
              )}
            </div>

            {!inStock || stockAgotado ? (
              <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                <X size={13} />
                {t("product.noStock")}
              </span>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={loadingCart}
                className={`text-white transition-all flex items-center justify-center p-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  clicked
                    ? "bg-violet-600 scale-75"
                    : "bg-stone-800 hover:bg-stone-600 dark:bg-stone-200 dark:hover:bg-stone-400 dark:text-stone-900 scale-100"
                }`}
              >
                <ShoppingCart size={16} />
              </button>
            )}
          </div>
        </div>
      </Link>
    </>
  );
};