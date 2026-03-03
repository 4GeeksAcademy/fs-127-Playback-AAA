import useGlobalReducer from "../hooks/useGlobalReducer";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PageCart = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const handleRemove = (product) => {
    dispatch({
      type: "cart_remove",
      payload: product,
    });
  };

  const handleIncrease = (product) => {
    dispatch({
      type: "cart_add",
      payload: product,
    });
  };

  const handleDecrease = (product) => {
    if (product.quantity === 1) {
      handleRemove(product);
    } else {
      dispatch({
        type: "cart_decrease",
        payload: product,
      });
    }
  };

  const total = store.cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (store.cart.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-stone-400">
        Tu carrito está vacío
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-12">
      <h1 className="text-3xl font-semibold mb-10">Tu Carrito</h1>

      <div className="flex flex-col gap-6">
        {store.cart.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row items-start md:items-center gap-6 border-b pb-6"
          >
            <img
              src={item.image_url || "https://placehold.co/120x120"}
              alt={item.name}
              className="w-32 h-32 object-cover rounded-xl"
            />

            <div className="flex-1">
              <h2 className="text-lg font-medium">{item.name}</h2>
              <p className="text-sm text-stone-500 mt-1">
                {item.price}€ unidad
              </p>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => handleDecrease(item)}
                  className="p-2 border rounded-md hover:bg-stone-100"
                >
                  <Minus size={16} />
                </button>

                <span className="font-medium text-lg">
                  {item.quantity}
                </span>

                <button
                  onClick={() => handleIncrease(item)}
                  className="p-2 border rounded-md hover:bg-stone-100"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <p className="text-lg font-semibold">
                {(item.price * item.quantity).toFixed(2)}€
              </p>

              <button
                onClick={() => handleRemove(item)}
                className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="mt-12 max-w-md ml-auto border rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between mb-4 text-sm text-stone-500">
          <span>Subtotal</span>
          <span>{total.toFixed(2)}€</span>
        </div>

        <div className="flex justify-between text-lg font-semibold mb-6">
          <span>Total</span>
          <span>{total.toFixed(2)}€</span>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="w-full py-3 rounded-xl font-medium text-white
          bg-gradient-to-r from-violet-500 to-purple-600
          hover:from-violet-600 hover:to-purple-700
          shadow-md shadow-violet-200 dark:shadow-violet-900/30
          transition"
        >
          Continuar compra
        </button>
      </div>
    </div>
  );
};