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

async function checkout(token, shippingAddressId, billingAddressId, couponCode = null) {
    const response = await fetch(`${backendUrl}/api/order/checkout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            shipping_address_id: shippingAddressId,
            billing_address_id: billingAddressId,
            payment_method: "credit_card",
            coupon_code: couponCode
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

// extraData permite pasar campos adicionales al body (p.ej. tracking_code y carrier_name
// cuando se avanza a "shipped"). Por defecto es un objeto vacío para no romper
// los usos existentes que solo pasan token, orderId y status.
async function updateOrderStatus(token, orderId, status, extraData = {}) {
       console.log("token:", token); 
    console.log("orderId:", orderId, "status:", status);
    const response = await fetch(`${backendUrl}/api/order/seller-orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, ...extraData })
    });
    const data = await response.json();
        console.log("respuesta backend:", response.status, data); 

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

async function applyCoupon(token, code) {
    const response = await fetch(`${backendUrl}/api/order/apply-coupon`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code })
    });
    const data = await response.json();
    if (!response.ok) return [null, data.msg || "Código inválido"];
    return [data, null];
}

// El comprador confirma la entrega de todo el pedido
async function buyerConfirmDelivery(token, orderId) {
    const response = await fetch(`${backendUrl}/api/order/my-orders/${orderId}/delivered`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al confirmar entrega"];
    return [data, null];
}

// El comprador confirma la entrega de un envío concreto (un vendedor dentro del pedido)
async function buyerConfirmShipmentDelivery(token, orderId, sellerOrderId) {
    const response = await fetch(
        `${backendUrl}/api/order/my-orders/${orderId}/seller-orders/${sellerOrderId}/delivered`,
        {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
        }
    );
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al confirmar entrega parcial"];
    return [data, null];
}

async function validateStock(token) {
    const response = await fetch(`${backendUrl}/api/order/cart/validate-stock`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al validar stock"];
    return [data, null];
}


const orderService = {
    hasBought,
    createReview,
    checkout,
    getCart,
    addProductToCart,
    getSellerOrders,
    updateOrderStatus,
    getMyOrders,
    removeProductFromCart,
    applyCoupon,
    buyerConfirmDelivery,
    buyerConfirmShipmentDelivery,
    validateStock,
};

export default orderService;