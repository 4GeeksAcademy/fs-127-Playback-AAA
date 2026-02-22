import { useRef } from "react";
import { ArrowRight, ArrowLeft, ShoppingCart, Heart } from "lucide-react";
import { StarRating } from "./StarRating";

export const TopSales = ({ products }) => {
  const carouselRef = useRef(null);

  const scroll = (dir) => {
    carouselRef.current?.scrollBy({ left: dir === "right" ? 400 : -400, behavior: "smooth" });
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between my-4">
        <h2 className="text-lg font-semibold tracking-tight">Top Ventas</h2>
        <div>
          <button onClick={() => scroll("left")} className="text-amber-600 hover:text-amber-700"><ArrowLeft /></button>
          <button onClick={() => scroll("right")} className="text-amber-600 hover:text-amber-700"><ArrowRight /></button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div ref={carouselRef} className="flex gap-3 overflow-x-hidden">
          {products.map((p) => (
            <div
              key={p.id}
              className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 flex-none border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200"
            >
              <div className="h-[200px] w-full bg-gray-50 overflow-hidden relative">
                <img
                  src={p.image_url || "https://placehold.co/300x300?text=Sin+imagen"}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = "https://placehold.co/300x300?text=Sin+imagen")}
                />
                <button className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all">
                  <Heart size={16} className="text-white" strokeWidth={2.5} />
                </button>
              </div>
              <div className="p-3 flex flex-col gap-1">
                <p className="text-sm">{p.name}</p>
                <p className="text-sm font-medium">{p.price}€</p>
                <div className="flex items-center justify-between transition-all duration-200 opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-1">
                    {p.rating > 0 && (
                      <>
                        <StarRating rating={p.rating} />
                        <span className="text-xs text-gray-400">({p.Review})</span>
                      </>
                    )}
                  </div>
                  <button className="bg-stone-800 hover:bg-stone-500 text-white transition-all flex items-center justify-center p-2">
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};