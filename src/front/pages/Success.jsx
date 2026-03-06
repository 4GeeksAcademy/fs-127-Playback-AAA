import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const Success = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/order/${orderId}/confirm`, { method: 'PUT' })
      .then(() => console.log("Pedido confirmado"));
  }, []);

  return (
    <div>
      <h1>¡Pago realizado con éxito!</h1>
      <p>Tu pedido #{orderId} ha sido confirmado.</p>
      <button onClick={() => navigate('/')}>Volver al inicio</button>
    </div>
  );
};