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

async function addProductToCart(token, productId, quantity = 1) {
    const response = await fetch(`${backendUrl}/api/order/add-product`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, quantity })
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al añadir producto"];
    return [data, null];
}

async function getSellerOrders(token) {
    const response = await fetch(`${backendUrl}/api/order/seller-orders`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al cargar pedidos"];
    return [data, null];
}

async function updateOrderStatus(token, orderId, status) {
    const response = await fetch(`${backendUrl}/api/order/seller-orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al actualizar estado"];
    return [data, null];
}

async function getMyOrders(token) {
    const response = await fetch(`${backendUrl}/api/order/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al cargar pedidos"];
    return [data, null];
}

async function removeProductFromCart(token, productId) {
    const response = await fetch(`${backendUrl}/api/order/product/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al eliminar producto"];
    return [data, null];
}
const orderService = { hasBought, createReview, checkout, getCart, addProductToCart, getSellerOrders, updateOrderStatus,getMyOrders,removeProductFromCart  };

export default orderService;