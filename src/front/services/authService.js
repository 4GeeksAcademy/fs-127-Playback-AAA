const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const signupService = async ({ name, last_name, email, password }) => {
    try {
        const response = await fetch(`${backendUrl}/api/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, last_name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            return [null, data.description || data.message || "Error al registrarse"];
        }
        return [data, null];
    } catch (err) {
        return [null, err.message];
    }
};

export const loginService = async ({ email, password }) => {
    try {
        const response = await fetch(`${backendUrl}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            return [null, data.description || data.message || "Error al iniciar sesión"];
        }
        // Se espera que el backend devuelva { token, user: {...} }
        // Guardamos el token en localStorage para persistencia
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        return [data, null];
    } catch (err) {
        return [null, err.message];
    }
};

export const getMeService = async (token) => {
    try {
        const response = await fetch(`${backendUrl}/api/protected`, {
            headers: { "Authorization": "Bearer " + token },
        });
        if (!response.ok) {
            return [null, "Token inválido o expirado"];
        }
        const data = await response.json();
        return [data, null];
    } catch (err) {
        return [null, err.message];
    }
};

export const logoutService = () => {
    localStorage.removeItem("token");
};