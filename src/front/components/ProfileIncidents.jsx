import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const IncidentForm = ({ orderId, onClose }) => {

  const { store } = useGlobalReducer();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = store.token || localStorage.getItem("token");

    setLoading(true);

    try {

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/incidences`,
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

      if (!res.ok) throw new Error("Error creando incidencia");

      alert("Incidencia creada correctamente");

      onClose();

    } catch (error) {
      console.error(error);
      alert("Error al crear incidencia");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">

      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">

        <h2 className="text-lg font-semibold mb-2">
          Abrir incidencia
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Pedido #{orderId}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm font-medium">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1 h-28"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white"
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default IncidentForm;