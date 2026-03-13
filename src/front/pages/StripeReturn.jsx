import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStripeAccountStatusService } from '../services/sellerService';
import useGlobalReducer from '../hooks/useGlobalReducer';

export const StripeReturn = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = store.token || localStorage.getItem("token");

        // Si no hay token la sesión expiró durante el onboarding
        if (!token) {
            navigate("/login", { state: { returnTo: "/profile" } });
            return;
        }

        getStripeAccountStatusService(token)
            .then(data => {
                if (data.connected) {
                    navigate("/profile", { state: { stripeSuccess: true } });
                } else {
                    setError("Tu registro en Stripe no está completo. Vuelve al perfil e inténtalo de nuevo.");
                }
            })
            .catch(err => {
                // Token expirado — el backend devuelve 401
                if (err.message?.includes("401") || err.message?.includes("token")) {
                    navigate("/login", { state: { returnTo: "/profile" } });
                } else {
                    setError("Error al verificar tu cuenta de Stripe.");
                }
            });
    }, []);

    if (error) return (
        <div className="max-w-md mx-auto mt-20 text-center space-y-4">
            <p className="text-red-500 text-sm">{error}</p>
            <button
                onClick={() => navigate("/profile")}
                className="text-purple-600 text-sm underline"
            >
                Volver al perfil
            </button>
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-screen gap-2 text-theme-muted text-sm">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            Verificando tu cuenta de Stripe...
        </div>
    );
};