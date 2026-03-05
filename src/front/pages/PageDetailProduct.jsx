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

export const PageDetailProduct = () => {

  const { store, dispatch } = useGlobalReducer();

  const [hasBought, setHasBought] = useState(false);
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {

    productServices.getProduct(id).then(([data, error]) => {
      if (error) return console.error(error);
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

  if (!product)
    return (
      <div className="flex items-center justify-center h-96 text-stone-400 text-sm tracking-widest uppercase">
        {t("product.noFound")}
      </div>
    );

  const inStock = product.stock == null ? true : product.stock > 0;

  // 🔥 Añadir producto al carrito
  const handleAddToCart = async () => {

    try {

      const token = store.token || localStorage.getItem("token");

      if (!token) {
        alert("Debes iniciar sesión para añadir productos al carrito");
        return;
      }

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/add-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      });

      // 🔥 Actualiza el store para el contador del carrito
      dispatch({
        type: "cart_add",
        payload: {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1
        }
      });

      console.log("Producto añadido al carrito:", product);

    } catch (error) {
      console.error("Error añadiendo producto al carrito:", error);
    }
  };

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
      <div className="flex flex-col lg:flex-row gap-10">

        {/* Imagen */}
        <div className="flex flex-col gap-3 lg:w-1/2">
          <div className="relative overflow-hidden bg-stone-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-[420px] md:h-[560px] object-cover"
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

        {/* Información */}
        <div className="lg:w-1/2 flex flex-col gap-4 pt-2">

          <p className="text-xs text-stone-400 uppercase tracking-widest">
            {product.category || ""}
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900">
            {product.name}
          </h1>

          <p className="text-sm text-stone-500">
            {product.description || "Sin descripción disponible."}
          </p>

          <span className="text-2xl font-semibold text-stone-900">
            {product.price} €
          </span>

          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={product.rating} />
              <span className="text-xs text-stone-400">
                ({product.Review})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">

            {inStock ? (
              <>
                <Check size={15} className="text-emerald-600" />
                <span className="text-emerald-700 font-medium">
                  {t("product.inStock")}
                </span>
              </>
            ) : (
              <>
                <X size={15} className="text-red-500" />
                <span className="text-red-500 font-medium">
                  {t("product.outOfStock")}
                </span>
              </>
            )}

          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`flex items-center justify-center gap-3 w-full py-4 text-sm font-medium tracking-widest uppercase ${
              inStock
                ? "bg-violet-600 hover:bg-violet-700 text-white"
                : "bg-stone-200 text-stone-400"
            }`}
          >
            <ShoppingCart size={16} />
            {t("product.addToCart")}
          </button>

        </div>
      </div>

      <Accordion items={accordionItems} />
      <ReviewRating product={product} />

      {hasBought && (
        <ReviewForm productId={id} orderId={orderId} />
      )}

    </div>
  );
};