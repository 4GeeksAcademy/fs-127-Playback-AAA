import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, ShoppingCart } from "lucide-react";
import { StarRating } from "./StarRating";
import productServices from "../services/productService";
import { Link } from "react-router-dom";
import { FavoriteButton } from "../components/FavoriteButton";
import { useTranslation } from "react-i18next";
import { useFavorites } from "../hooks/useFavorites";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { ProductPrice } from "../components/Common/ProductPrice";

export const TopSales = () => {
  const { store, dispatch } = useGlobalReducer();
  const { t } = useTranslation();
  useFavorites();

  const [toast, setToast] = useState(null);
  const [clicked, setClicked] = useState(null);
  const carouselRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRandom, setIsRandom] = useState(false);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    const token = store.token || localStorage.getItem("token");

    setClicked(productId);
    setTimeout(() => setClicked(null), 300);

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/add-product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ product_id: productId, quantity: 1 })
    });

    if (!res.ok) return;

    dispatch({ type: "cart_add", payload: { id: productId, quantity: 1 } });
    setToast(productId);
    setTimeout(() => setToast(null), 2000);
  };

  // Carga los productos más vendidos al montar el componente
  // Si no hay, carga productos aleatorios como fallback
  useEffect(() => {
    productServices.getTopSales().then(([data, error]) => {
      if (data && data.length > 5) {
        setProducts(data);
        setLoading(false);
      } else {
        // Fallback — productos aleatorios
        productServices.getAllProducts().then(([randomData]) => {
          if (randomData?.length) {
            const shuffled = [...randomData].sort(() => Math.random() - 0.5).slice(0, 10);
            setProducts(shuffled);
            setIsRandom(true);
          }
          setLoading(false);
        });
      }
    });
  }, []);

  // Mueve el carrusel a izquierda o derecha
  const scroll = (dir) => {
    carouselRef.current?.scrollBy({
      left: dir === "right" ? 400 : -400,
      behavior: "smooth",
    });
  };

  // Skeleton mientras cargan los productos
  if (loading)
    return (
      <section className="mt-8">
        <div className="flex items-center justify-between my-4">
          <h2 className="text-lg font-semibold tracking-tight text-main">
            {t("home.topSales")}
          </h2>
        </div>
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 flex-none animate-pulse"
            >
              <div className="h-[200px] w-full bg-muted" />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );

  if (!products.length) return null;

  return (
    <section className="mt-8">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <ShoppingCart size={15} />
          {t("product.addedToCart")}
        </div>
      )}
      <div className="flex items-center justify-between my-4">
        <h2 className="text-lg font-semibold tracking-tight text-main">
          {isRandom ? t("home.featuredProducts") : t("home.topSales")}
        </h2>
        <div>
          <button
            onClick={() => scroll("left")}
            className="text-amber-600 hover:text-amber-700"
          >
            <ArrowLeft />
          </button>
          <button
            onClick={() => scroll("right")}
            className="text-amber-600 hover:text-amber-700"
          >
            <ArrowRight />
          </button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div ref={carouselRef} className="flex gap-4 overflow-x-hidden">
          {products.map((p) => (
            <Link
              to={`/product/${p.id}`}
              key={p.id}
              className="w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] flex-none border border-main bg-main overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200"
            >
              <div className="w-full">
                {/* Imagen del producto con botón de favorito */}
                <div className="h-[200px] w-full bg-subtle overflow-hidden relative">
                  <img
                    src={p.image_url || "https://placehold.co/300x300?text=Sin+imagen"}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "https://placehold.co/300x300?text=Sin+imagen")}
                  />
                  <FavoriteButton
                    product={p}
                    className="absolute top-3 right-3"
                  />
                </div>

                {/* Info del producto — rating y carrito aparecen al hacer hover */}
                <div className="p-3 flex flex-col gap-1">
                  <p className="text-sm text-main">{p.name}</p>
                  <ProductPrice price={parseFloat(p.price)} discount={p.discount || 0} />
                  <div className="flex items-center justify-between transition-all duration-200 opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-1">
                      {p.rating > 0 && (
                        <>
                          <StarRating rating={p.rating} />
                          <span className="text-xs text-muted">({p.Review})</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, p.id)}
                      className={`text-white transition-all flex items-center justify-center p-2
                        ${clicked === p.id
                          ? "bg-violet-600 scale-75"
                          : "bg-stone-800 hover:bg-stone-600 dark:bg-stone-200 dark:hover:bg-stone-400 dark:text-stone-900 scale-100"
                        }`}
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};