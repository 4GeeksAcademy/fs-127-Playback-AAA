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
                        <Link
                            to={`/PageDetailProduct/${p.id}`}
                            key={p.id}
                            className="btn btn-sm btn-outline-warning btn-more fw-bold block"
                        >
                            <div className="cursor-pointer p-1">
                                <div className="relative overflow-hidden">
                                    <img
                                        src={p.image_url || "https://placehold.co/300x300?text=Sin+imagen"}
                                        alt={p.name}
                                        className="w-full h-40 sm:h-44 md:h-64 lg:h-80 object-cover"
                                        onError={(e) => (e.target.src = "https://placehold.co/300x300?text=Sin+imagen")}
                                    />
                                    <FavoriteButton product={p} className="absolute top-3 right-3" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm pt-3">{p.name}</p>
                                        <p className="text-sm font-medium pb-3">{p.price}€</p>
                                    </div>
                                    <button className="bg-stone-800 hover:bg-stone-500 text-white transition-all flex items-center justify-center p-2">
                                        <ShoppingCart size={16} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};