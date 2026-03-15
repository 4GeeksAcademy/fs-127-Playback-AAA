import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, ShoppingCart } from "lucide-react";
import { StarRating } from "./StarRating";
import productServices from "../services/productService";
import { Link } from "react-router-dom";
import { FavoriteButton } from "../components/FavoriteButton";
import { useTranslation } from "react-i18next";
import { useFavorites } from "../hooks/useFavorites";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const TopSales = () => {
  const { store, dispatch } = useGlobalReducer();

const [toast, setToast] = useState(null); 

const handleAddToCart = async (e, productId) => {
  e.preventDefault();
  e.stopPropagation();
  const token = store.token || localStorage.getItem("token");

  // Sin token → aviso de login, sin llamar a la API
  if (!token) {
    setToast({ type: "auth" });
    setTimeout(() => setToast(null), 2500);
    return;
  }

 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/add-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ product_id: productId, quantity: 1 })
  });

  if (!res.ok) { // si falla, no muestra el toast ni actualiza
    if (res.status === 401 || res.status === 403) {
      setToast({ type: "auth" });
      setTimeout(() => setToast(null), 2500);
    }
    return;
  }

  dispatch({ type: "cart_add", payload: { id: productId, quantity: 1 } });
  setToast({ type: "success" });
  setTimeout(() => setToast(null), 2000);
};
  const { t } = useTranslation();
  useFavorites();
  const carouselRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga los productos más vendidos al montar el componente
  useEffect(() => {
    productServices.getTopSales().then(([data, error]) => {
      if (data) setProducts(data);
      setLoading(false);
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
          <h2 className="text-lg font-semibold tracking-tight text-theme-text">
            {t("product.outOfStock")}{" "}
          </h2>
        </div>
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 flex-none animate-pulse"
            >
              <div className="h-[200px] w-full bg-theme-muted" />
              <div className="p-3 flex flex-col gap-2">
                <div className="h-3 bg-theme-muted rounded" />
                <div className="h-3 bg-theme-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );

  // Si no hay productos no renderiza nada
  if (!products.length) return null;

  return (
    <section className="mt-8">
     {toast && (
  <div className={`fixed bottom-6 right-6 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in ${
    toast.type === "auth" ? "bg-red-600" : "bg-stone-900"
  }`}>
    <ShoppingCart size={15} />
    {toast.type === "auth"
      ? "Debes iniciar sesión para añadir al carrito"
      : "Producto añadido a tu cesta"}
  </div>
)}
      <div className="flex items-center justify-between my-4">
        <h2 className="text-lg font-semibold tracking-tight text-theme-text">
          {t("home.topSales")}
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
              className="w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] flex-none border border-theme-border bg-theme-bg overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200"
            >
              <div className="w-full">
                {/* Imagen del producto con botón de favorito */}
                <div className="h-[200px] w-full bg-theme-subtle overflow-hidden relative">
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
                  <p className="text-sm text-theme-text">{p.name}</p>
                  <p className="text-sm font-medium text-theme-text">
                    {p.price}€
                  </p>
                  <div className="flex items-center justify-between transition-all duration-200 opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-1">
                      {p.rating > 0 && (
                        <>
                          <StarRating rating={p.rating} />
                          <span className="text-xs text-theme-muted">
                            ({p.Review})
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, p.id)}
                      className="bg-stone-800 hover:bg-stone-500 text-white transition-all flex items-center justify-center p-2"
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
