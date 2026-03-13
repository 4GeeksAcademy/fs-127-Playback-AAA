import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const ProfileIncidents = () => {

  const { store } = useGlobalReducer();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const token = store.token || localStorage.getItem("token");

    if (!token) return;

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/incidences/my`, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        setIncidents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando incidencias:", err);
        setLoading(false);
      });

  }, []);

  const statusBadge = (status) => {

    switch (status) {

      case "open":
        return "bg-yellow-100 text-yellow-700";

      case "in_progress":
        return "bg-blue-100 text-blue-700";

      case "resolved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";

    }

  };

  const statusLabel = (status) => {

    switch (status) {

      case "open":
        return "Abierta";

      case "in_progress":
        return "En progreso";

      case "resolved":
        return "Resuelta";

      case "rejected":
        return "Rechazada";

      default:
        return status;

    }

  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Cargando incidencias...
      </div>
    );
  }

  return (

    <div className="max-w-5xl mx-auto">

      <h1 className="text-2xl font-semibold mb-8">
        Mis incidencias
      </h1>

      {incidents.length === 0 && (

        <p className="text-gray-500">
          No tienes incidencias abiertas
        </p>

      )}

      <div className="space-y-6">

        {incidents.map(incident => (

          <div
            key={incident.id}
            className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition"
          >

            <div className="flex justify-between items-center mb-3">

              <h3 className="font-semibold text-lg">
                {incident.title}
              </h3>

              <span
                className={`px-3 py-1 text-xs rounded-full font-medium ${statusBadge(incident.status)}`}
              >
                {statusLabel(incident.status)}
              </span>

            </div>

            <p className="text-gray-600 mb-4">
              {incident.description}
            </p>

            <div className="text-sm text-gray-400 flex justify-between">

              <span>
                Pedido #{incident.order_id}
              </span>

              <span>
                {new Date(incident.created_at).toLocaleDateString()}
              </span>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default ProfileIncidents;