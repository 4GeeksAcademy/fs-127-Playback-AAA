import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStripeOnboardingLinkService } from '../services/sellerService';
import useGlobalReducer from '../hooks/useGlobalReducer';

export const StripeRefresh = () => {
    const { store } = useGlobalReducer();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = store.token || localStorage.getItem("token");

        if (!token) {
            navigate("/login", { state: { returnTo: "/profile" } });
            return;
        }

        // El link de onboarding caducó — genera uno nuevo y redirige
        getStripeOnboardingLinkService(token)
            .then(data => {
                window.location.href = data.onboarding_url;
            })
            .catch(() => {
                setError("No se pudo renovar el enlace de Stripe. Vuelve al perfil e inténtalo de nuevo.");
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
            Renovando enlace de Stripe...
        </div>
    );
};