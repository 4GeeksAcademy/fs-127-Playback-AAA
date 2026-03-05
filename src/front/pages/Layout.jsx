import { Outlet } from "react-router-dom";
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