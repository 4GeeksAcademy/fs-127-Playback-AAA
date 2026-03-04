import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getCategoriesService } from "../../services/categoryService";
import { CategorybarDesktop } from "./CategorybarDesktop";
import { CategorybarMobile } from "./CategorybarMobile";

export const Categorybar = () => {
  const { i18n } = useTranslation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategoriesService().then(([data, error]) => {
      if (error) {
        console.error("Error cargando categorías:", error);
        return;
      }

      // Ordenar todo por position
      const sorted = data
        .sort((a, b) => a.position - b.position)
        .map((cat) => ({
          ...cat,
          subcategories: (cat.subcategories || [])
            .sort((a, b) => a.position - b.position)
            .map((sub) => ({
              ...sub,
              items: (sub.items || []).sort((a, b) => a.position - b.position),
            })),
        }));

      setCategories(sorted);
    });
  }, [i18n.language]);

  return (
    <>
      <CategorybarDesktop categories={categories} />
      <CategorybarMobile categories={categories} />
    </>
  );
};