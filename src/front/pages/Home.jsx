import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import productServices from "../services/productService";
import { HeroBanner } from "../components/HeroBanner";
import { FeaturedCategories } from "../components/FeaturedCategories";
import { TopSales } from "../components/TopSales";

export const Home = () => {
  const { dispatch } = useGlobalReducer();
  const [products, setProducts] = useState([]);

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
    productServices.getAllProducts().then(setProducts);
  }, []);

  return (
    <div>
      <HeroBanner />
      <div className="w-full px-4 max-w-screen-2xl mx-auto">
        <FeaturedCategories />
        <TopSales products={products} />
      </div>
    </div>
  );
};