import i18n from "../i18n"; // ajusta la ruta a tu instancia de i18n

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const getLocale = () => i18n.language || "es";

export const getCategoriesService = async () => {
  try {
    const response = await fetch(
      `${backendUrl}/api/categories?locale=${getLocale()}`
    );
    const data = await response.json();
    if (!response.ok) {
      return [null, data.description || data.message || "Error al cargar las categorías"];
    }
    return [data, null];
  } catch (err) {
    return [null, err.message];
  }
};

export const getFeaturedSubcategoryBannerService = async () => {
  try {
    const response = await fetch(
      `${backendUrl}/api/subcategories/top-discount?locale=${getLocale()}`
    );
    const data = await response.json();
    if (!response.ok) {
      return [null, data.description || data.message || "Error al cargar el banner"];
    }
    return [data, null];
  } catch (err) {
    return [null, err.message];
  }
};

export const getTopRatedSubcategoriesService = async () => {
  try {
    const response = await fetch(
      `${backendUrl}/api/subcategories/top-rated?locale=${getLocale()}`
    );
    const data = await response.json();
    if (!response.ok) {
      return [null, data.description || data.message || "Error al cargar subcategorías destacadas"];
    }
    return [data, null];
  } catch (err) {
    return [null, err.message];
  }
};