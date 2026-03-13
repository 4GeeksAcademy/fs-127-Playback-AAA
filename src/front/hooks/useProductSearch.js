import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import productServices from "../services/productService";

const PRODUCTS_PER_PAGE = 20;

export const useProductSearch = () => {
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);

    const conditions = (searchParams.get("condition") || "")
      .split(",")
      .filter(Boolean);

    productServices
      .searchProducts({
        q: searchParams.get("q") || "",
        category: searchParams.get("category") || "",
        subcategory: searchParams.get("subcategory") || "",
        item: searchParams.get("item") || "",
        sort: searchParams.get("sort") || "relevance",
        minPrice: searchParams.get("min_price")
          ? Number(searchParams.get("min_price"))
          : undefined,
        maxPrice: searchParams.get("max_price")
          ? Number(searchParams.get("max_price"))
          : undefined,
        inStock: searchParams.get("in_stock") === "true",
        onSale: searchParams.get("on_sale") === "true",
        lowStock: searchParams.get("low_stock") === "true",
        conditions,
      })
      .then(([data]) => {
        setResults(data || []);
        setLoading(false);
      });
  }, [searchParams.toString(), i18n.language]);

  // Nombres traducidos — vienen del primer resultado del fetch.
  // El fetch se repite al cambiar de idioma, así que siempre llegan en el idioma correcto.
  // Fallback al slug formateado mientras carga o si no hay resultados.
  const categoryName =
    results[0]?.category_name ||
    (searchParams.get("category") || "").replace(/-/g, " ");
  const subcategoryName =
    results[0]?.subcategory_name ||
    (searchParams.get("subcategory") || "").replace(/-/g, " ");
  const itemName =
    results[0]?.item_name ||
    (searchParams.get("item") || "").replace(/-/g, " ");

  // Paginación
  const totalPages = Math.ceil(results.length / PRODUCTS_PER_PAGE);
  const paginated = results.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  return {
    loading,
    results,
    paginated,
    totalPages,
    currentPage,
    setCurrentPage,
    categoryName,
    subcategoryName,
    itemName,
  };
};
