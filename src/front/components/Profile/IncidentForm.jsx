import { useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const IncidentForm = ({ orderId, onClose }) => {
  const { store } = useGlobalReducer();

  const [title, setTitle] = useState(""); // se mantiene por backend
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = store.token || localStorage.getItem("token");

    if (!description) {
      alert("La descripción es obligatoria");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/incidences`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            title: "Incidencia pedido #" + orderId,
            description,
          }),
        },
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      
      {/* Modal */}
      <div className="bg-white p-6 rounded-xl w-96 shadow-xl transform transition-all duration-300 scale-95 opacity-0 animate-fadeIn">

        <h2 className="text-lg font-semibold mb-4">Abrir incidencia</h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <textarea
            placeholder="Cuéntanos qué ha pasado con tu pedido..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded resize-none"
            rows={4}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border rounded hover:bg-gray-100 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-500 transition"
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
