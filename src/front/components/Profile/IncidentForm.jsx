import { useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const IncidentForm = ({ orderId, onClose }) => {
  const { store } = useGlobalReducer();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = store.token || localStorage.getItem("token");

    if (!title || !description) {
      alert("Todos los campos son obligatorios");
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
            title,
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-lg font-semibold mb-4">Abrir incidencia</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 border rounded"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-purple-600 text-white rounded"
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
