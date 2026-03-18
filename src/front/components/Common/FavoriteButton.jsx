import { Heart } from "lucide-react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import favoriteServices from "../../services/favoriteService";

export const FavoriteButton = ({ product, className = "" }) => {
  const { store, dispatch } = useGlobalReducer();
  const isLoggedIn = !!(store.token || localStorage.getItem("token"));
  if (!isLoggedIn) return null;

  const isFavorite = store.favorites?.find((fav) => fav.id === product.id);
  const toggle = async (e) => {
    e.preventDefault();
    const token = store.token || localStorage.getItem("token");
    const isLoggedIn = !!(store.token || localStorage.getItem("token"));

    if (isFavorite) {
      // Borrar del store
      dispatch({ type: "fav_delete", payload: product });
      // Si está logueado, borrar de la DB también
      if (isLoggedIn) {
        await favoriteServices.deleteFavorite(product.id, token);
      }
    } else {
      // Añadir al store
      dispatch({ type: "fav_add", payload: product });
      // Si está logueado, guardar en la DB también
      if (isLoggedIn) {
        await favoriteServices.addFavorite(product.id, token);
      }
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
