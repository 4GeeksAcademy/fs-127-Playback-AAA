import { Heart } from "lucide-react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const FavoriteButton = ({ product, className = "" }) => {


    //Esta programado en store.js 
    const { store, dispatch } = useGlobalReducer();
    const isFavorite = store.favorites?.find(fav => fav.id === product.id);
    const toggle = (e) => {
        e.preventDefault(); 
        if (isFavorite) {
            dispatch({ type: "fav_delete", payload: product });
        } else {
            dispatch({ type: "fav_add", payload: product });
        }
    };

    return (
        <button
            onClick={toggle}
            className={`bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all ${className}`}
        >
            <Heart
                size={16}
                strokeWidth={2.5}
                className={isFavorite ? "fill-red-500 text-red-500" : "text-white"}
            />
        </button>
    );
};