const createPaymentIntent = async (token, orderId) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ order_id: orderId })
        });
        const data = await res.json();
        if (!res.ok) return [null, data.description || "Error al iniciar el pago"];
        return [data, null];
    } catch (error) {
        return [null, error.message];
    }
};

export default { createPaymentIntent };