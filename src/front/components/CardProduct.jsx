import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";
import { ProductBadges } from "./Common/ProductBadges";
import { ProductPrice } from "./Common/ProductPrice";

export const CardProduct = ({ product }) => {
  const { id, name, price, image_url, discount, low_stock, condition } = product;

  return (
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
          <ProductBadges discount={discount} lowStock={low_stock} condition={condition} className="absolute top-2 left-2" />
          <FavoriteButton
            product={product}
            className="absolute top-3 right-3"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm pt-3">{name}</p>
            <ProductPrice price={price} discount={discount} className="pb-3" />
          </div>
          <button className="bg-stone-800 hover:bg-stone-500 text-white transition-all flex items-center justify-center p-2">
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
};
