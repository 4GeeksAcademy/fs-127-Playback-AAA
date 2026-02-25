import i18n from "../i18n/index"; // ajusta el path a tu archivo de configuración de i18n

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const getLocale = () => i18n.language?.split("-")[0] || "es";

// Obtiene todos los productos
async function getAllProducts() {
  const response = await fetch(
    `${backendUrl}/api/product?locale=${getLocale()}`,
  );
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al cargar los productos"];
  return [data, null];
}

// Obtiene un producto por id
async function getProduct(id) {
  const response = await fetch(
    `${backendUrl}/api/product/${id}?locale=${getLocale()}`,
  );
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al cargar el producto"];
  return [data, null];
}

// Obtiene los 10 productos más vendidos por cantidad total en pedidos
async function getTopSales() {
  const response = await fetch(
    `${backendUrl}/api/product/top-sales?locale=${getLocale()}`,
  );
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al cargar el top ventas"];
  return [data, null];
}

// Crea un nuevo producto — soporta JSON y multipart/form-data
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

// Actualiza un producto por id
async function updateProduct(id, body) {
  const response = await fetch(`${backendUrl}/api/product/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al actualizar el producto"];
  return [data, null];
}

// Elimina un producto por id
async function deleteProduct(id) {
  const response = await fetch(`${backendUrl}/api/product/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al eliminar el producto"];
  return [data, null];
}

const productServices = {
  getAllProducts,
  getProduct,
  getTopSales,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productServices;
