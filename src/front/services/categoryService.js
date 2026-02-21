const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const getCategoriesService = async () => {
    try {
        const response = await fetch(backendUrl + "/api/categories");
        const data = await response.json();
        if (!response.ok) {
            return [null, data.description || data.message || "Error al cargar las categorías"];
        }
        return [data, null];
    } catch (err) {
        return [null, err.message];
    }
};