import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const Success = () => {

  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("token");

    fetch(`/api/order/${orderId}/confirm`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(() => {
        console.log("Pedido confirmado");
      })
      .catch(err => console.error(err));

  }, [orderId]);

  return (

    <div className="max-w-xl mx-auto text-center py-20">

      <h1 className="text-2xl font-semibold mb-4">
        ¡Pago realizado con éxito!
      </h1>

      <p className="text-gray-500 mb-6">
        Tu pedido #{orderId} ha sido confirmado.
      </p>

      <button
        onClick={() => navigate("/profile?tab=orders")}
        className="px-5 py-2 bg-purple-600 text-white rounded-lg"
      >
        Ver mis pedidos
      </button>

    </div>

  );

};