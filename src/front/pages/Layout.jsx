import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import useGlobalReducer from "../hooks/useGlobalReducer"
import { getMeService } from "../services/authService"
import { useEffect } from "react"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    const { store, dispatch } = useGlobalReducer();

    useEffect(() => {
        if (!store.token) return;

        getMeService(store.token).then(([data, error]) => {
            if (error) {
                dispatch({ type: "logout" });
                return;
            }
            dispatch({ type: "set_user", payload: data });
        });
    }, []);

    return (
        <ScrollToTop>
            <Navbar />
                <Outlet />
            <Footer />
        </ScrollToTop>
    )
}