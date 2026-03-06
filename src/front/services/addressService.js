const backendUrl = import.meta.env.VITE_BACKEND_URL;

async function getAddresses(token) {

  const response = await fetch(`${backendUrl}/api/address`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) return [null, data.description || "Error cargando direcciones"];

  return [data, null];
}

const addressService = {
  getAddresses
};

export default addressService;