import i18n from "../i18n/index"; // ajusta el path a tu archivo de configuración de i18n

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const getLocale = () => i18n.language?.split("-")[0] || "es";

async function getAllProducts() {
    const response = await fetch(`${backendUrl}/api/product?locale=${getLocale()}`);
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al cargar los productos"];
    return [data, null];
}

async function getProduct(id) {
    const response = await fetch(`${backendUrl}/api/product/${id}?locale=${getLocale()}`);
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al cargar el producto"];
    return [data, null];
}

async function getTopSales() {
    const response = await fetch(`${backendUrl}/api/product/top-sales?locale=${getLocale()}`);
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al cargar el top ventas"];
    return [data, null];
}

// POST, PUT y DELETE no cambian
async function createProduct(body) {
    const response = await fetch(`${backendUrl}/api/product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al crear el producto"];
    return [data, null];
}

async function updateProduct(id, body) {
    const response = await fetch(`${backendUrl}/api/product/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al actualizar el producto"];
    return [data, null];
}

async function deleteProduct(id) {
    const response = await fetch(`${backendUrl}/api/product/${id}`, {
        method: "DELETE"
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al eliminar el producto"];
    return [data, null];
}

const productServices = { getAllProducts, getProduct, getTopSales, createProduct, updateProduct, deleteProduct };
export default productServices;