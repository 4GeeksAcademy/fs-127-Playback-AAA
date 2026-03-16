import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const ProfileSellerIncidents = () => {

  const { store } = useGlobalReducer();
  const [incidents, setIncidents] = useState([]);

  const token = store.token || localStorage.getItem("token");

  useEffect(() => {

    if (!token) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/incidences`, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => setIncidents(data))
      .catch(err => console.error(err));

  }, []);

  const updateStatus = async (id, status) => {

    try {

      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/incidences/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ status })
      });

      setIncidents(prev =>
        prev.map(i =>
          i.id === id ? { ...i, status } : i
        )
      );

    } catch (err) {
      console.error(err);
    }

  };

  return (

    <div className="max-w-6xl mx-auto">

      <h1 className="text-2xl font-semibold mb-8">
        Gestión de incidencias
      </h1>

      {incidents.length === 0 && (
        <p className="text-gray-500">
          No hay incidencias registradas
        </p>
      )}

      <div className="space-y-6">

        {incidents.map(incident => (

          <div
            key={incident.id}
            className="bg-white border rounded-xl p-6 shadow-sm"
          >

            <div className="flex justify-between mb-3">

              <div>

                <h3 className="font-semibold text-lg">
                  {incident.title}
                </h3>

                <p className="text-sm text-gray-500">
                  Pedido #{incident.order_id}
                </p>

                <p className="text-sm font-medium mt-1">
                  Estado actual: <span className="capitalize">{incident.status}</span>
                </p>

              </div>

              <span className="text-sm text-gray-400">
                {new Date(incident.created_at).toLocaleDateString()}
              </span>

            </div>

            <p className="text-gray-600 mb-4">
              {incident.description}
            </p>

            <div className="flex gap-2">

              <button
                onClick={() => updateStatus(incident.id, "in_progress")}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                En progreso
              </button>

              <button
                onClick={() => updateStatus(incident.id, "resolved")}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                Resolver
              </button>

              <button
                onClick={() => updateStatus(incident.id, "rejected")}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Rechazar
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default ProfileSellerIncidents;