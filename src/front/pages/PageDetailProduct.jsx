
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import productServices from "../services/productService";

export const PageDetailProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    productServices.getProduct(id).then(data => setProduct(data));
  }, [id]);

  if (!product) return <p>Cargando...</p>;

  return (
    <div>
      <h2>{product.name}</h2>
      <h5>{product.price}€</h5>
    </div>
  );
}


// import productServices from "../services/productService";
// import useGlobalReducer from "../hooks/useGlobalReducer";


// export const PageDetailProduct = ({product}) => {
//   const { store, dispatch } = useGlobalReducer()
// //   const isFavorite = store.favCharacterList.find(fav => fav.id === character.id);
// //  function boton() {
// //     if (isFavorite) {
// //       dispatch({ type: 'fav_character_delete', payload: character })
// //     } else {
// //       dispatch({ type: 'fav_character_add', payload: character })
// //     }
// //   }


