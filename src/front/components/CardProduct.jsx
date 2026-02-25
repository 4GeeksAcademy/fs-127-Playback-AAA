import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";

export const CardProduct = ({ product }) => {
    const { id, name, price, image_url } = product;

    return (
        <Link to={`/PageDetailProduct/${id}`} className="block">
            <div className="cursor-pointer p-1">
                <div className="relative overflow-hidden">
                    <img
                        src={image_url || "https://placehold.co/300x300?text=Sin+imagen"}
                        alt={name}
                        className="w-full h-40 sm:h-44 md:h-64 lg:h-80 object-cover"
                        onError={(e) => (e.target.src = "https://placehold.co/300x300?text=Sin+imagen")}
                    />
                    <FavoriteButton product={product} className="absolute top-3 right-3" />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm pt-3">{name}</p>
                        <p className="text-sm font-medium pb-3">{price}€</p>
                    </div>
                    <button className="bg-stone-800 hover:bg-stone-500 text-white transition-all flex items-center justify-center p-2">
                        <ShoppingCart size={16} />
                    </button>
                </div>
            </div>
        </Link>
    );
};