const backendUrl = import.meta.env.VITE_BACKEND_URL;

async function hasBought(productId, token) {
    const response = await fetch(`${backendUrl}/api/order/has-bought/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al comprobar compra"];
    return [data, null];
}

async function createReview(body, token) {
    const response = await fetch(`${backendUrl}/api/review`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al crear la reseña"];
    return [data, null];
}

const orderServices = { hasBought, createReview };
export default orderServices;