import { Outlet } from "react-router-dom/dist";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Categorybar } from "../components/Categorybar";
import { Footer } from "../components/Footer";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getMeService } from "../services/authService";
import { useEffect } from "react";
import favoriteServices from "../services/favoriteService";

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    //obtiene el token y si lo encuentra lo busca en localstorage( el token es para saber si estas registrado o no )
    const token = store.token || localStorage.getItem("token");
    if (!token) return;
    const loadFavorites = async () => {
      const [data] = await favoriteServices.getFavorites(token);
      if (data) dispatch({ type: "set_favorites", payload: data });
    };

    getMeService(store.token).then(([data, error]) => {
      if (error) {
        dispatch({ type: "logout" });
        return;
      }
      dispatch({ type: "set_user", payload: data });
    });
    loadFavorites();
  }, []);

  return (
    <ScrollToTop>
      <Navbar />
      <Categorybar />
      <Outlet />
      <Footer />
    </ScrollToTop>
  );
};
