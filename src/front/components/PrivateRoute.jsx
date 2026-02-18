import { Navigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const PrivateRoute = ({ children }) => {
    const { store } = useGlobalReducer();

    if (!store.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};