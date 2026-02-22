import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import productServices from "../services/productService";
import { StarRating } from "../components/StarRating";
import { ShoppingCart, Check, X } from "lucide-react";
import { Accordion } from "../components/Accordion";
import { FavoriteButton } from "../components/FavoriteButton";

export const PageDetailProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => {
    productServices.getProduct(id).then(([data, error]) => {
      if (error) {
        console.error(error);
        return;
      }
      setProduct(data);
    });
  }, [id]);

  if (!product)
    return (
      <div className="flex items-center justify-center h-96 text-stone-400 text-sm tracking-widest uppercase">
        No se han encontrado productos
      </div>
    );
  const inStock = product.stock == null ? true : product.stock > 0;

  const accordionItems = [
    {
      label: "Descripción",
      content: product.description || "Sin descripción disponible.",
    },
    {
      label: "Características",
      content: product.features || "Sin características especificadas.",
    },
    {
      label: "Envío & Devoluciones",
      content:
        "Envío gratuito en pedidos superiores a 50 €. Devoluciones aceptadas durante 30 días.",
    },
  ];

  return (
    <div className="w-full px-6 md:px-20 max-w-screen-2xl mx-auto py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* div Imagen  */}
        <div className="flex flex-col gap-3 lg:w-1/2">
          <div className="relative overflow-hidden bg-stone-100">
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

        {/*Div informacion derecha */}
        <div className="lg:w-1/2 flex flex-col gap-4 pt-2">
          <p className="text-xs text-stone-400 uppercase tracking-widest">
            {product.category || ""}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-stone-900 leading-tight">
            {product.name}
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed">
            {product.description || "Sin descripción disponible."}
          </p>
          <span className="text-2xl font-semibold text-stone-900">
            {product.price} €
          </span>

          {/* Rating directo del producto, igual que en la lista */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={product.rating} />
              <span className="text-xs text-stone-400">({product.Review})</span>
            </div>
          )}

          {/* Comprobamos si hay stock para mostrarlo de una manera o otra */}
          <div className="flex items-center gap-2 text-sm">
            {inStock ? (
              <>
                <Check size={15} className="text-emerald-600" />
                <span className="text-emerald-700 font-medium">En stock</span>
                {product.stock != null && (
                  <span className="text-stone-400">
                    ({product.stock} disponibles)
                  </span>
                )}
              </>
            ) : (
              <>
                <X size={15} className="text-red-500" />
                <span className="text-red-500 font-medium">Sin stock</span>
              </>
            )}
          </div>
          <button
            disabled={!inStock}
            className={`flex items-center justify-center gap-3 w-full py-4 text-sm font-medium tracking-widest uppercase transition-all duration-300 ${
              inStock
                ? "bg-stone-900 hover:bg-stone-700 text-white"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }`}
          >
            <ShoppingCart size={16} />
            Añadir a la cesta
          </button>
        </div>
      </div>

      <Accordion items={accordionItems} />
    </div>
  );
};
