import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { FavoriteButton } from "../components/FavoriteButton";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const PageFavorites = () => {
  const { store } = useGlobalReducer();
  const favorites = store.favorites || [];

  if (favorites.length === 0)
    return (
      <div className="flex items-center justify-center h-96 text-stone-400 text-sm tracking-widest uppercase">
        No tienes favoritos todavía
      </div>
    );

  return (
    <div>
      <section className="w-full px-20 max-w-screen-2xl mx-auto">
        <div className="py-5">
          <p className="text-2xl font-semibold mt-1 pb-3">Tus favoritos</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};
