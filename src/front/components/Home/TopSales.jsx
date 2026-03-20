import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, ShoppingCart, X } from "lucide-react";
import { StarRating } from "../Common/StarRating";
import productServices from "../../services/productService";
import { Link } from "react-router-dom";
import { FavoriteButton } from "../Common/FavoriteButton";
import { useTranslation } from "react-i18next";
import { useFavorites } from "../../hooks/useFavorites";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { ProductPrice } from "../Common/ProductPrice";
import orderService from "../../services/orderService";

export const TopSales = () => {
  const { store, dispatch } = useGlobalReducer();
  const { t } = useTranslation();
  useFavorites();

  const carouselRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRandom, setIsRandom] = useState(false);
  const [toast, setToast] = useState(null);
  const [clicked, setClicked] = useState(null);

  const [loadingCart, setLoadingCart] = useState({}); // ← cambia de null a {}

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingCart[product.id]) return; // ← cortocircuito

    const token = store.token || localStorage.getItem("token");

    if (!token) {
      setToast({ type: "auth" });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const enCarrito =
      store.cart?.find((item) => item.id === product.id)?.quantity || 0;
    if (enCarrito >= product.stock) {
      setToast({ type: "sin_stock" });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setClicked(product.id);
    setTimeout(() => setClicked(null), 300);

    setLoadingCart((prev) => ({ ...prev, [product.id]: true })); // ← bloquea
    const [, error] = await orderService.addProductToCart(token, product.id, 1);
    setLoadingCart((prev) => ({ ...prev, [product.id]: false })); // ← desbloquea

    if (error) {
      if (error.status === 401 || error.status === 403) {
        setToast({ type: "auth" });
        setTimeout(() => setToast(null), 2500);
      }
      return;
    }

    dispatch({ type: "cart_add", payload: { id: product.id, quantity: 1 } });
    setToast({ type: "success" });
    setTimeout(() => setToast(null), 2000);
  };

  // Carga los productos más vendidos al montar el componente
  // Si no hay, carga productos aleatorios como fallback
  useEffect(() => {
    productServices.getTopSales().then(([data, error]) => {
      if (data && data.length > 5) {
        setProducts(
          [...data].sort((a, b) => (a.stock === 0) - (b.stock === 0)),
        );
        setLoading(false);
      } else {
        // Fallback — productos aleatorios
        productServices.getAllProducts().then(([randomData]) => {
          if (randomData?.length) {
            const shuffled = [...randomData]
              .sort(() => Math.random() - 0.5)
              .slice(0, 10);
            setProducts(
              [...shuffled].sort((a, b) => (a.stock === 0) - (b.stock === 0)),
            );
            setIsRandom(true);
          }
          setLoading(false);
        });
      }
    });
  }, []);

  const scroll = (dir) => {
    carouselRef.current?.scrollBy({
      left: dir === "right" ? 400 : -400,
      behavior: "smooth",
    });
  };

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
          {products.map((p) => {
            const enCarrito =
              store.cart?.find((item) => item.id === p.id)?.quantity || 0;
            const inStock = p.stock == null ? true : p.stock > 0;
            const stockAgotado = p.stock != null && enCarrito >= p.stock;

            return (
              <Link
                to={`/product/${p.id}`}
                key={p.id}
                className="w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] flex-none border border-main bg-main overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200"
              >
                <div className="w-full">
                  {/* Imagen del producto con botón de favorito */}
                  <div className="h-[200px] w-full bg-subtle overflow-hidden relative">
                    <img
                      src={
                        p.image_url ||
                        "https://placehold.co/300x300?text=Sin+imagen"
                      }
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/300x300?text=Sin+imagen")
                      }
                    />
                    <FavoriteButton
                      product={p}
                      className="absolute top-3 right-3"
                    />
                  </div>

                  {/* Info del producto — rating y carrito aparecen al hacer hover */}
                  <div className="p-3 flex flex-col gap-1">
                    <p className="text-sm text-main">{p.name}</p>
                    <ProductPrice
                      price={parseFloat(p.price)}
                      discount={p.discount || 0}
                    />
                    <div className="flex items-center justify-between transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-1">
                        {p.Review > 0 && (
                          <>
                            <StarRating rating={p.rating} />
                            <span className="text-xs text-muted">
                              ({p.Review})
                            </span>
                          </>
                        )}
                      </div>

                      {!inStock || stockAgotado ? (
                        <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                          <X size={13} />
                          {t("product.noStock")}
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(e, p)}
                          disabled={loadingCart[p.id]} // ← añade esto
                          className={`text-white transition-all flex items-center justify-center p-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            clicked === p.id
                              ? "bg-violet-600 scale-75"
                              : "bg-stone-800 hover:bg-stone-600 dark:bg-stone-200 dark:hover:bg-stone-400 dark:text-stone-900 scale-100"
                          }`}
                        >
                          <ShoppingCart size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
