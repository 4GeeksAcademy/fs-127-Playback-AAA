import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const ProfileOrders = () => {

  const { store } = useGlobalReducer();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {

    const token = store.token || localStorage.getItem("token");

    if (!token) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/order/my-orders`, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => setOrders(data));

  }, []);

  const handleSubmit = async (e) => {

    e.preventDefault();

    const token = store.token || localStorage.getItem("token");

    if (!title || !description) {
      alert("Completa todos los campos");
      return;
    }

    try {

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${selectedOrder}/incidences`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({
            title,
            description
          })
        }
      );

      if (!res.ok) throw new Error("Error");

      alert("Incidencia creada");

      setSelectedOrder(null);
      setTitle("");
      setDescription("");

    } catch (error) {

      console.error(error);
      alert("Error creando incidencia");

    }

  };

  return (

    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-2xl font-semibold mb-8">
        Historial de pedidos
      </h1>

      <div className="space-y-10">

        {orders.map(order => (

          <div
            key={order.id}
            className="border rounded-xl bg-white shadow-sm"
          >

            {/* HEADER */}

            <div className="flex justify-between p-6 border-b bg-gray-50">

              <div>
                <p className="text-sm text-gray-500">Pedido</p>
                <p className="font-semibold">#{order.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <p className="font-semibold capitalize">
                  {order.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-semibold">
                  {order.total_price} €
                </p>
              </div>

            </div>

            {/* PRODUCTOS */}

            <div className="p-6 space-y-6">

              {order.products.map(product => (

                <div
                  key={product.id}
                  className="flex gap-4 items-center"
                >

                  <img
                    src={product.image_url}
                    alt={product.name?.es}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div className="flex-1">

                    <p className="font-medium">
                      {product.name?.es}
                    </p>

                    <p className="text-sm text-gray-500">
                      Cantidad: {product.quantity}
                    </p>

                  </div>

                  <p className="font-semibold">
                    {product.price} €
                  </p>

                </div>

              ))}

            </div>

            {/* BOTÓN INCIDENCIA */}

            {order.status === "delivered" && (

              <div className="p-6 border-t">

                <button
                  onClick={() => setSelectedOrder(order.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Abrir incidencia
                </button>

              </div>

            )}

          </div>

        ))}

      </div>

      {/* MODAL */}

      {selectedOrder && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-lg rounded-xl p-8 shadow-xl">

            <h2 className="text-xl font-semibold mb-6">
              Abrir incidencia
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <input
                type="text"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded"
              />

              <textarea
                placeholder="Describe el problema"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 rounded"
                rows="4"
              />

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Enviar
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

};