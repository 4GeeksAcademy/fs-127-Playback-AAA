import { Outlet } from "react-router-dom/dist";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar/Navbar";
import { Categorybar } from "../components/Navbar/Categorybar";
import { Footer } from "../components/Footer";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { getMeService } from "../services/authService";
import { useEffect } from "react";

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    const token = store.token || localStorage.getItem("token");
    if (!token) return;

    getMeService(token).then(([data, error]) => {
      if (error) {
        dispatch({ type: "logout" });
        return;
      }
      dispatch({ type: "set_user", payload: data });
    });
    //Es para que revise el carrito 
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/cart`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        dispatch({ type: "set_cart", payload: data.products || [] });
      });

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