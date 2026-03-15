import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, X } from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";
import { ProductBadges } from "./Common/ProductBadges";
import { ProductPrice } from "./Common/ProductPrice";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { StarRating } from "./StarRating";
import orderService from "../services/orderService";

export const CardProduct = ({ product }) => {
  const { store, dispatch } = useGlobalReducer();
  const { id, name, price, image_url, discount, low_stock, condition, rating, Review, stock } = product;
  const [toast, setToast] = useState(false);

  const enCarrito = store.cart?.find(item => item.id === id)?.quantity || 0;
  const inStock = stock == null ? true : stock > 0;
  const stockAgotado = stock != null && enCarrito >= stock;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = store.token || localStorage.getItem("token");

    if (enCarrito >= stock) {
      setToast("sin_stock");
      setTimeout(() => setToast(false), 2000);
      return;
    }

    const [data, err] = await orderService.addProductToCart(token, id);
    if (err) return;

    dispatch({ type: "cart_add", payload: { id, quantity: 1 } });
    setToast("añadido");
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <>
      {toast && (
        <div className={`fixed bottom-6 right-6 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${toast === "sin_stock" ? "bg-red-600" : "bg-stone-900"}`}>
          {toast === "sin_stock" ? <X size={15} /> : <ShoppingCart size={15} />}
          {toast === "sin_stock" ? "No hay más stock disponible" : "Producto añadido a tu cesta"}
        </div>
      )}

      <Link to={`/product/${id}`} className="block">
        <div className="cursor-pointer p-1">
          <div className="relative overflow-hidden">
            <img
              src={image_url || 'https://placehold.co/300x300?text=Sin+imagen'}
              alt={name}
              className="w-full h-40 sm:h-44 md:h-64 lg:h-80 object-cover"
              onError={(e) => (e.target.src = 'https://placehold.co/300x300?text=Sin+imagen')}
            />
            <ProductBadges discount={discount} lowStock={low_stock} condition={condition} className="absolute top-2 left-2" />
            <FavoriteButton product={product} className="absolute top-3 right-3" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm pt-3">{name}</p>
              <ProductPrice price={price} discount={discount} className="pb-3" />
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
                Sin stock
              </span>
            ) : (
              <button
                onClick={handleAddToCart}
                className="bg-stone-800 hover:bg-stone-500 text-white transition-all flex items-center justify-center p-2"
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