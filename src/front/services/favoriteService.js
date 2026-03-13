import i18n from "../i18n";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const getLocale = () => i18n.language?.split("-")[0] || "es";

async function getFavorites(token) {
    const response = await fetch(`${backendUrl}/api/favorite?locale=${getLocale()}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al cargar favoritos"];
    return [data, null];
}

async function addFavorite(productId, token) {
    const response = await fetch(`${backendUrl}/api/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId })
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al añadir favorito"];
    return [data, null];
}

async function deleteFavorite(productId, token) {
    const response = await fetch(`${backendUrl}/api/favorite/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al eliminar favorito"];
    return [data, null];
}

const favoriteServices = { getFavorites, addFavorite, deleteFavorite };
export default favoriteServices;