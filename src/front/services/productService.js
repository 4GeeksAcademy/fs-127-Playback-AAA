import i18n from "../i18n/index";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const getLocale = () => i18n.language?.split("-")[0] || "es";

async function getAllProducts() {
  const response = await fetch(
    `${backendUrl}/api/product?locale=${getLocale()}`,
  );
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al cargar los productos"];
  return [data, null];
}

async function getProduct(id) {
  const response = await fetch(
    `${backendUrl}/api/product/${id}?locale=${getLocale()}`,
  );
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al cargar el producto"];
  return [data, null];
}

async function getTopSales() {
  const response = await fetch(
    `${backendUrl}/api/product/top-sales?locale=${getLocale()}`,
  );
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al cargar el top ventas"];
  return [data, null];
}

async function createProduct(body) {
  const response = await fetch(`${backendUrl}/api/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al crear el producto"];
  return [data, null];
}

async function updateProduct(id, body, token) {
  const response = await fetch(`${backendUrl}/api/product/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`  // ← añade esto
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al actualizar el producto"];
  return [data, null];
}
async function deleteProduct(id) {
  const response = await fetch(`${backendUrl}/api/product/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al eliminar el producto"];
  return [data, null];
}

async function searchProducts({
  q = "",
  category = "",
  subcategory = "",
  item = "",
  sort = "relevance",
  minPrice,
  maxPrice,
  inStock = false,
  onSale = false,
  lowStock = false,
  conditions = [],
} = {}) {
  const params = new URLSearchParams({ locale: getLocale() });

  if (q)                params.set("q", q);
  if (category)         params.set("category", category);
  if (subcategory)      params.set("subcategory", subcategory);
  if (item)             params.set("item", item);
  if (sort)             params.set("sort", sort);
  if (minPrice != null) params.set("min_price", minPrice);
  if (maxPrice != null) params.set("max_price", maxPrice);
  if (inStock)          params.set("in_stock", "true");
  if (onSale)           params.set("on_sale", "true");
  if (lowStock)         params.set("low_stock", "true");
  if (conditions?.length) params.set("condition", conditions.join(","));

  const response = await fetch(`${backendUrl}/api/product/search?${params}`);
  const data = await response.json();
  if (!response.ok) return [null, data.description || "Error en la búsqueda"];
  return [data, null];
}

const productServices = {
  getAllProducts,
  getProduct,
  getTopSales,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
};

export default productServices;