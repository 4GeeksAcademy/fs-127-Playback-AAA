const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Registro de nuevo usuario
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

// Inicio de sesión — guarda el token en localStorage para persistencia entre recargas
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

// Comprueba si el token sigue siendo válido y devuelve los datos del usuario
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

// Cierre de sesión — solo limpia el token del localStorage (no hay llamada al backend)
export const logoutService = () => {
    localStorage.removeItem("token");
};

// Restablecimiento de contraseña — el token lo recibe el usuario por email
export const resetPasswordService = async ({ token, new_password, confirm_password }) => {
    try {
        const response = await fetch(`${backendUrl}/api/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, new_password, confirm_password }),
        });
        const data = await response.json();
        if (!response.ok) {
            return [null, data.description || data.message || "Error al restablecer la contraseña"];
        }
        return [data, null];
    } catch (err) {
        return [null, err.message];
    }
};

// Solicitud de recuperación de contraseña — envía el link al email del usuario
export const forgotPasswordService = async (email) => {
    try {
        const response = await fetch(`${backendUrl}/api/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (!response.ok) {
            return [null, data.description || data.message || "Error al enviar el email"];
        }
        return [data, null];
    } catch (err) {
        return [null, err.message];
    }
};