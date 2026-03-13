const backendUrl = import.meta.env.VITE_BACKEND_URL;

async function getAddresses(token) {
  const response = await fetch(`${backendUrl}/api/address`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error cargando direcciones"];
  return [data, null];
}

async function createAddress(token, body) {
  const response = await fetch(`${backendUrl}/api/address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al guardar la dirección"];
  return [data, null];
}

async function updateAddress(token, addressId, body) {
  const response = await fetch(`${backendUrl}/api/address/${addressId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al actualizar la dirección"];
  return [data, null];
}

async function deleteAddress(token, addressId) {
  const response = await fetch(`${backendUrl}/api/address/${addressId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok)
    return [null, data.description || "Error al eliminar la dirección"];
  return [data, null];
}

const addressService = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};

export default addressService;