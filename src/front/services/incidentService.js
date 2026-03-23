const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Crear incidencia sobre un seller_order concreto
async function createIncident(sellerOrderId, body, token) {
    const response = await fetch(`${backendUrl}/api/seller-orders/${sellerOrderId}/incidences`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al crear la incidencia"];
    return [data, null];
}

async function getMyIncidents(token) {
    const response = await fetch(`${backendUrl}/api/incidences/my`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al cargar incidencias"];
    return [data, null];
}

async function getIncidentMessages(incidentId, token) {
    const response = await fetch(`${backendUrl}/api/incidences/${incidentId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al cargar mensajes"];
    return [data, null];
}

async function sendIncidentMessage(incidentId, body, token) {
    const isFormData = body instanceof FormData;

    const response = await fetch(`${backendUrl}/api/incidences/${incidentId}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            ...(!isFormData && { "Content-Type": "application/json" }),
        },
        body: isFormData ? body : JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al enviar mensaje"];
    return [data, null];
}

async function closeIncident(incidentId, token) {
    const response = await fetch(`${backendUrl}/api/incidences/${incidentId}/close`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) return [null, data.description || "Error al cerrar la incidencia"];
    return [data, null];
}

const incidentService = {
    createIncident,
    getMyIncidents,
    getIncidentMessages,
    sendIncidentMessage,
    closeIncident,
};

export default incidentService;