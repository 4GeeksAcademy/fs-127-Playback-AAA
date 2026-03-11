const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const createSellerProfileService = async (token, data) => {
  const response = await fetch(`${BACKEND_URL}/api/seller/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok)
    throw new Error(json.description || json.msg || 'Error al crear perfil');
  return json;
};

export const getSellerProfileService = async (token) => {
  const response = await fetch(`${BACKEND_URL}/api/seller/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await response.json();
  if (!response.ok)
    throw new Error(json.description || json.msg || 'Error al obtener perfil');
  return json;
};

export const updateSellerProfileService = async (token, data) => {
  const response = await fetch(`${BACKEND_URL}/api/seller/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  if (!response.ok)
    throw new Error(json.description || json.msg || 'Error al actualizar');
  return json;
};

export const deleteSellerProfileService = async (token) => {
  const response = await fetch(`${BACKEND_URL}/api/seller/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.description || json.msg || 'Error al cancelar');
  return json;
};

export const getMyProductsService = async (token) => {
  const response = await fetch(`${BACKEND_URL}/api/seller/me/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.description || "Error al cargar productos");
  return json;
};