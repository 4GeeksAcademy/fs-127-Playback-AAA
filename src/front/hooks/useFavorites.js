import { useEffect } from "react";
import useGlobalReducer from "./useGlobalReducer";
import favoriteServices from "../services/favoriteService";

export const useFavorites = () => {
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    const token = store.token || localStorage.getItem("token");
    if (!token) return;

    const load = async () => {
      const [data] = await favoriteServices.getFavorites(token);
      if (data) dispatch({ type: "set_favorites", payload: data });
    };

    load();
  }, []);
};