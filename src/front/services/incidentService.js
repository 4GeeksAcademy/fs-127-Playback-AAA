const createIncident = async (orderId, data, token) => {

  try {

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/incidences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    return [result, null];

  } catch (error) {

    return [null, error];

  }

};

export default {
  createIncident
};