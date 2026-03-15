const backendUrl = import.meta.env.VITE_BACKEND_URL;

const userService = {
  async updatePassword(token, form) {
    const res = await fetch(`${backendUrl}/api/user/profile/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (!res.ok) return [null, data];
    return [data, null];
  },

  async getProfile(token) {
    const res = await fetch(`${backendUrl}/api/user/profile`, {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    if (!res.ok) return [null, data.description || "Error al cargar el perfil"];
    return [data, null];
  },

  async updateProfile(token, body) {
    const res = await fetch(`${backendUrl}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return [null, data.description || "Error al actualizar el perfil"];
    return [data, null];
  },

  async updateProfileImage(token, formData) {
    const res = await fetch(`${backendUrl}/api/user/profile/image`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) return [null, data.description || "Error al subir imagen"];
    return [data, null];
  }
};

export default userService;