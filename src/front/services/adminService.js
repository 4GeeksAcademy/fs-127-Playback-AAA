const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const getSellersService = async (token, status = null) => {
  const url = status
    ? `${BACKEND_URL}/api/admin/sellers?status=${status}`
    : `${BACKEND_URL}/api/admin/sellers`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await response.json();
  if (!response.ok)
    throw new Error(
      json.description || json.msg || 'Error al obtener vendedores',
    );
  return json;
};

export const updateSellerStatusService = async (token, sellerId, status, rejectionReason = null) => {
  const response = await fetch(`${BACKEND_URL}/api/admin/sellers/${sellerId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status,
      ...(rejectionReason && { rejection_reason: rejectionReason }),
    }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.description || json.msg || 'Error al actualizar');
  return json;
};
