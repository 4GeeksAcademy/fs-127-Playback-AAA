const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Obtiene todas las categorías con sus subcategorías e ítems anidados
export const getCategoriesService = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/categories`);
    const data = await response.json();
    if (!response.ok) {
      return [
        null,
        data.description || data.message || "Error al cargar las categorías",
      ];
    }
    return [data, null];
  } catch (err) {
    return [null, err.message];
  }
};

// Obtiene la subcategoría con más productos en oferta para el HeroBanner
// Si no hay ofertas devuelve la subcategoría con slug "ofertas"
export const getFeaturedSubcategoryBannerService = async () => {
  try {
    const response = await fetch(
      `${backendUrl}/api/subcategories/top-discount`,
    );
    const data = await response.json();
    if (!response.ok) {
      return [
        null,
        data.description || data.message || "Error al cargar el banner",
      ];
    }
    return [data, null];
  } catch (err) {
    return [null, err.message];
  }
};

// Obtiene las 5 subcategorías con mejor valoración media y más productos
// para mostrar en la sección de Categorías Destacadas de la home
export const getTopRatedSubcategoriesService = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/subcategories/top-rated`);
    const data = await response.json();
    if (!response.ok) {
      return [
        null,
        data.description ||
          data.message ||
          "Error al cargar subcategorías destacadas",
      ];
    }
    return [data, null];
  } catch (err) {
    return [null, err.message];
  }
};
