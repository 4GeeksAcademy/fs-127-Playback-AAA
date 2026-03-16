import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import productServices from "../services/productService";
import { StarRating } from "../components/StarRating";
import { ShoppingCart, Check, X } from "lucide-react";
import { Accordion } from "../components/Accordion";
import { FavoriteButton } from "../components/FavoriteButton";
import { ReviewRating } from "../components/ReviewRating";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../hooks/useGlobalReducer";
import orderServices from "../services/orderService";
import { ReviewForm } from "../components/ReviewForm";
import { ProductPrice } from "../components/Common/ProductPrice";

export const PageDetailProduct = () => {
  const { store, dispatch } = useGlobalReducer();
  const [hasBought, setHasBought] = useState(false);
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [toast, setToast] = useState(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    productServices.getProduct(id).then(([data, error]) => {
      if (error) return console.error(error);
       console.log("product.reviews:", data.reviews);
      setProduct(data);
    });

    const token = store.token || localStorage.getItem("token");
    if (token) {
      orderServices.hasBought(id, token).then(([bought]) => {
        if (bought && bought.has_bought) {
          setHasBought(true);
          setOrderId(bought.order_id);
        }
      });
    }
  }, [id, i18n.language]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2000);
  };

  const [loadingCart, setLoadingCart] = useState(false); // ← añade esto

  const handleAddToCart = async () => {
    if (loadingCart) return; // ← cortocircuito

    const token = store.token || localStorage.getItem("token");

    if (!token) {
      showToast(t("product.loginRequired"), "error");
      return;
    }

    if (stockAgotado) {
      showToast(t("product.noStock"), "error");
      return;
    }

    setClicked(true);
    setTimeout(() => setClicked(false), 300);

    setLoadingCart(true); // ← bloquea
    const [, error] = await orderServices.addProductToCart(
      token,
      product.id,
      1,
    );
    setLoadingCart(false); // ← desbloquea

    if (error) {
      showToast(t("product.cartError"), "error");
      return;
    }

    dispatch({ type: "cart_add", payload: { id: product.id, quantity: 1 } });
    showToast(t("product.addedToCart"));
  };

  if (!product)
    return (
      <div className="flex items-center justify-center h-96 text-muted text-sm tracking-widest uppercase">
        {t("product.noFound")}
      </div>
    );

  const enCarrito =
    store.cart?.find((item) => item.id === product?.id)?.quantity || 0;
  const inStock = product.stock == null ? true : product.stock > 0;
  const stockAgotado = product.stock != null && enCarrito >= product.stock;

  const accordionItems = [
    {
      label: t("product.descriptionLabel"),
      content: product.description || t("product.description"),
    },
    {
      label: t("product.featuresLabel"),
      content: product.features || t("product.features"),
    },
    {
      label: t("product.shippingLabel"),
      content: product.shipping || t("product.shipping"),
    },
  ];

  return (
    <div className="w-full px-6 md:px-20 max-w-screen-2xl mx-auto py-10">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 text-white dark:text-stone-900 text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-600 dark:bg-red-500"
              : "bg-stone-900 dark:bg-stone-100"
          }`}
        >
          {toast.type === "error" ? (
            <X size={15} />
          ) : (
            <ShoppingCart size={15} />
          )}
          {toast.msg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex flex-col gap-3 lg:w-1/2">
          <div className="relative overflow-hidden bg-subtle">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-[420px] md:h-[560px] object-cover transition-all duration-500"
              onError={(e) =>
                (e.target.src = "https://placehold.co/600x700?text=Sin+imagen")
              }
            />
            <FavoriteButton
              product={product}
              className="absolute top-2 right-2"
            />
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col gap-4 pt-2">
          <p className="text-xs text-faint uppercase tracking-widest">
            {product.category || ""}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-main leading-tight">
            {product.name}
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            {product.description || t("product.description")}
          </p>
          <span className="text-2xl font-semibold text-main">
            <ProductPrice
              price={product.price}
              discount={product.discount}
              className="[&_span]:text-2xl"
            />
          </span>

          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={product.rating} />
              <span className="text-xs text-faint">({product.Review})</span>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {inStock && !stockAgotado ? (
              <>
                <Check size={15} className="text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  {t("product.inStock")}
                </span>
                {product.stock != null && (
                  <span className="text-faint">
                    ({product.stock} {t("product.available")})
                  </span>
                )}
              </>
            ) : (
              <>
                <X size={15} className="text-red-500" />
                <span className="text-red-500 font-medium">
                  {!inStock ? t("product.outOfStock") : t("product.noStock")}
                </span>
              </>
            )}
          </div>

          {/* Botón añadir al carrito */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || stockAgotado || loadingCart}
            className={`flex items-center justify-center gap-3 w-full py-4 text-sm font-medium tracking-widest uppercase transition-all duration-300 ${
              !inStock || stockAgotado
                ? "bg-muted text-faint cursor-not-allowed"
                : clicked
                  ? "bg-violet-600 text-white scale-95"
                  : "bg-stone-900 hover:bg-stone-700 dark:bg-stone-100 dark:hover:bg-stone-300 dark:text-stone-900 text-white"
            }`}
          >
            <ShoppingCart size={16} />
            {t("product.addToCart")}
          </button>
        </div>
      </div>

      <Accordion items={accordionItems} />
      <ReviewRating product={product} />
      {hasBought && <ReviewForm productId={id} orderId={orderId} />}
    </div>
  );
};
