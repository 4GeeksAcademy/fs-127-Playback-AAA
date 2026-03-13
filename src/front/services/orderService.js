
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

async function getCart(token) {
    const response = await fetch(`${backendUrl}/api/order/cart`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al cargar carrito"];
    return [data, null];
}

async function checkout(token, shippingAddressId, billingAddressId) {
    const response = await fetch(`${backendUrl}/api/order/checkout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            shipping_address_id: shippingAddressId,
            billing_address_id: billingAddressId,
            payment_method: "credit_card"
        })
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al procesar el pedido"];
    return [data, null];
}

const orderServices = { hasBought, createReview, checkout, getCart };

export default orderServices;


