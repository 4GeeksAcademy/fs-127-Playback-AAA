import { useEffect, useState } from "react";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const STATUS_CONFIG = {
  open: { label: "Abierta", bg: "#FAEEDA", color: "#633806" },
  in_progress: { label: "En progreso", bg: "#E6F1FB", color: "#185FA5" },
  resolved: { label: "Resuelta", bg: "#EAF3DE", color: "#3B6D11" },
  rejected: { label: "Rechazada", bg: "#FCEBEB", color: "#A32D2D" },
};

const ProfileIncidents = () => {
  const { store } = useGlobalReducer();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = store.token || localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/incidences/my`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => {
        setIncidents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <p className="text-center text-sm text-muted mt-10 animate-pulse">
        Cargando incidencias…
      </p>
    );

  if (incidents.length === 0)
    return (
      <div className="bg-main rounded-xl border border-main p-10 text-center">
        <p className="text-muted text-sm">No tienes incidencias abiertas</p>
      </div>
    );

  return (
    <div className="space-y-3">
      {incidents.map((incident) => {
        const cfg = STATUS_CONFIG[incident.status] || {
          label: incident.status,
          bg: "#F1EFE8",
          color: "#5F5E5A",
        };
        const date = new Date(incident.created_at).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        return (
          <div
            key={incident.id}
            className="bg-main rounded-xl border border-main overflow-hidden"
          >
            <div className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--color-text-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    {incident.title}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--color-muted)",
                      lineHeight: "1.5",
                    }}
                  >
                    {incident.description}
                  </p>
                </div>
                <span
                  style={{
                    background: cfg.bg,
                    color: cfg.color,
                    fontSize: "11px",
                    padding: "2px 7px",
                    borderRadius: "20px",
                    fontWeight: "500",
                    flexShrink: 0,
                  }}
                >
                  {cfg.label}
                </span>
              </div>

              <div
                className="flex items-center justify-between mt-3"
                style={{ fontSize: "11px", color: "var(--color-muted)" }}
              >
                <span>
                  Pedido{" "}
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: "600",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    #{incident.order_id}
                  </span>
                </span>
                <span>{date}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileIncidents;
