import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { HeroBanner } from "../components/Home/HeroBanner";
import { TopRatedSubcategories } from "../components/Home/TopRatedSubcategories";
import { TopSales } from "../components/Home/TopSales";

export const Home = () => {
  const { dispatch } = useGlobalReducer();

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file");
        const response = await fetch(backendUrl + "/api/hello");
        const data = await response.json();
        if (response.ok) dispatch({ type: "set_hello", payload: data.message });
      } catch (error) {
        console.error("Could not fetch the message from the backend.", error);
      }
    };

    loadMessage();
  }, []);

  return (
    <div className="bg-main ">
      <HeroBanner />
      <div className="w-full px-4  max-w-screen-2xl mx-auto">
        <TopRatedSubcategories />
        <TopSales />
      </div>
    </div>
  );
};