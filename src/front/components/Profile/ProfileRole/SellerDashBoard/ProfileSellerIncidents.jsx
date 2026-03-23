import { useEffect, useState, useRef } from "react";
import {
  ChevronDown, ChevronUp, X, Send, Paperclip,
  AlertCircle, Package, CheckCircle, User,
} from "lucide-react";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import incidentService from "../../../../services/incidentService";

const STATUS_CONFIG = {
  open:        { label: "Abierta",     bg: "#FAEEDA", color: "#633806", dot: "#F59E0B" },
  in_progress: { label: "En progreso", bg: "#E6F1FB", color: "#185FA5", dot: "#3B82F6" },
  resolved:    { label: "Resuelta",    bg: "#EAF3DE", color: "#3B6D11", dot: "#22C55E" },
  rejected:    { label: "Rechazada",   bg: "#FCEBEB", color: "#A32D2D", dot: "#EF4444" },
};

// ── Burbuja de mensaje ────────────────────────────────────────────────────────
const MessageBubble = ({ message, currentUserId }) => {
  const isOwn = message.user_id === currentUserId;
  const date  = new Date(message.created_at).toLocaleString("es-ES", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start", marginBottom: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px", flexDirection: isOwn ? "row-reverse" : "row" }}>
        {message.user?.image_url ? (
          <img src={message.user.image_url} alt="" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: isOwn ? "#534AB7" : "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: isOwn ? "white" : "var(--color-muted)", fontWeight: "700", flexShrink: 0 }}>
            {message.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <span style={{ fontSize: "10px", color: "var(--color-muted)" }}>
          {message.user?.name}
          {message.user?.role === "admin"  && <span style={{ marginLeft: "4px", background: "#0f0f0f", color: "#d4af37", fontSize: "7px", padding: "1px 5px", borderRadius: "3px", letterSpacing: "1px" }}>ADMIN</span>}
          {message.user?.role === "buyer"  && <span style={{ marginLeft: "4px", background: "#F3F4F6", color: "#6B7280", fontSize: "7px", padding: "1px 5px", borderRadius: "3px", letterSpacing: "1px" }}>COMPRADOR</span>}
          {message.user?.role === "seller" && <span style={{ marginLeft: "4px", background: "#EEEDFE", color: "#534AB7", fontSize: "7px", padding: "1px 5px", borderRadius: "3px", letterSpacing: "1px" }}>YO</span>}
        </span>
      </div>
      <div style={{
        maxWidth: "76%",
        background: isOwn ? "#534AB7" : "var(--color-background-main)",
        color: isOwn ? "white" : "var(--color-text-primary)",
        borderRadius: isOwn ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
        padding: message.image_url && !message.body ? "4px" : "9px 13px",
        border: isOwn ? "none" : "1px solid var(--color-border)",
      }}>
        {message.body && (
          <p style={{ fontSize: "13px", margin: 0, lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{message.body}</p>
        )}
        {message.image_url && (
          <a href={message.image_url} target="_blank" rel="noopener noreferrer">
            <img src={message.image_url} alt="adjunto" style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: message.body ? "8px" : "10px", marginTop: message.body ? "8px" : "0", display: "block", cursor: "zoom-in" }} />
          </a>
        )}
      </div>
      <span style={{ fontSize: "9px", color: "var(--color-muted)", marginTop: "3px", opacity: 0.7 }}>{date}</span>
    </div>
  );
};

// ── Input de mensaje ──────────────────────────────────────────────────────────
const MessageInput = ({ onSend, sending, error }) => {
  const fileRef = useRef(null);
  const [text,    setText]    = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [imgPrev, setImgPrev] = useState(null);
  const [imgErr,  setImgErr]  = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setImgErr("Solo JPG, PNG o WEBP"); return; }
    if (file.size > 2 * 1024 * 1024) { setImgErr("Máx. 2 MB"); return; }
    setImgFile(file);
    setImgPrev(URL.createObjectURL(file));
    setImgErr("");
    e.target.value = "";
  };

  const removeImg = () => {
    if (imgPrev) URL.revokeObjectURL(imgPrev);
    setImgFile(null);
    setImgPrev(null);
  };

  const submit = () => {
    if (!text.trim() && !imgFile) return;
    let payload;
    if (imgFile) {
      payload = new FormData();
      if (text.trim()) payload.append("body", text.trim());
      payload.append("image", imgFile);
    } else {
      payload = { body: text.trim() };
    }
    onSend(payload);
    setText("");
    removeImg();
  };

  const canSend = !sending && (text.trim().length > 0 || !!imgFile);

  return (
    <div style={{ padding: "10px 14px 12px", borderTop: "1px solid var(--color-border)", background: "var(--color-background-main)" }}>
      {imgPrev && (
        <div style={{ position: "relative", display: "inline-block", marginBottom: "8px" }}>
          <img src={imgPrev} alt="" style={{ height: "56px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--color-border)" }} />
          <button onClick={removeImg} style={{ position: "absolute", top: "-5px", right: "-5px", background: "#A32D2D", color: "white", border: "none", borderRadius: "50%", width: "15px", height: "15px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
            <X size={8} />
          </button>
        </div>
      )}
      {(imgErr || error) && <p style={{ fontSize: "10px", color: "#A32D2D", marginBottom: "5px" }}>{imgErr || error}</p>}
      <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
        <textarea
          placeholder="Responde al comprador…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          rows={2}
          className="input"
          style={{ flex: 1, resize: "none", fontSize: "13px", lineHeight: "1.45" }}
        />
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFile} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{ width: "34px", height: "34px", borderRadius: "8px", background: "var(--color-background-secondary)", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <Paperclip size={18} />
        </button>
        <button
          onClick={submit}
          disabled={!canSend}
          style={{ width: "34px", height: "34px", borderRadius: "8px", background: canSend ? "#534AB7" : "var(--color-background-secondary)", border: canSend ? "none" : "1px solid var(--color-border)", color: canSend ? "white" : "var(--color-muted)", display: "flex", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "not-allowed", flexShrink: 0, transition: "background 0.15s, color 0.15s" }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const ProfileSellerIncidents = () => {
  const { store } = useGlobalReducer();

  const [incidents,    setIncidents]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [expanded,     setExpanded]     = useState({});
  const [messages,     setMessages]     = useState({});
  const [msgLoading,   setMsgLoading]   = useState({});
  const [msgSending,   setMsgSending]   = useState({});
  const [msgError,     setMsgError]     = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [updating,     setUpdating]     = useState({});
  const [confirmAction, setConfirmAction] = useState({}); // { incidentId: 'resolved' | 'rejected' | null }

  const bottomRefs = useRef({});
  const token  = store.token || localStorage.getItem("token");
  const userId = store.user?.id;

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/incidences`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => { setIncidents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setError("Error al cargar incidencias"); setLoading(false); });
  }, []);

  const toggleExpand = async (incident) => {
    const id      = incident.id;
    const opening = !expanded[id];
    setExpanded((prev) => ({ ...prev, [id]: opening }));
    if (opening && !messages[id]) {
      setMsgLoading((prev) => ({ ...prev, [id]: true }));
      const [data, err] = await incidentService.getIncidentMessages(id, token);
      setMsgLoading((prev) => ({ ...prev, [id]: false }));
      if (!err && data) setMessages((prev) => ({ ...prev, [id]: data }));
    }
  };

  useEffect(() => {
    Object.keys(expanded).forEach((id) => {
      if (expanded[id] && bottomRefs.current[id]) {
        bottomRefs.current[id].scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [messages]);

  const handleSend = async (incidentId, payload) => {
    setMsgSending((prev) => ({ ...prev, [incidentId]: true }));
    setMsgError((prev) => ({ ...prev, [incidentId]: null }));
    const [data, err] = await incidentService.sendIncidentMessage(incidentId, payload, token);
    setMsgSending((prev) => ({ ...prev, [incidentId]: false }));
    if (err) { setMsgError((prev) => ({ ...prev, [incidentId]: err })); return; }
    setMessages((prev) => ({ ...prev, [incidentId]: [...(prev[incidentId] || []), data] }));
    setTimeout(() => bottomRefs.current[incidentId]?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleUpdateStatus = async (incidentId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [incidentId]: newStatus }));
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/incidences/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setIncidents((prev) => prev.map((i) => i.id === incidentId ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating((prev) => ({ ...prev, [incidentId]: null }));
    }
  };

  const filtered = statusFilter === "all" ? incidents : incidents.filter((i) => i.status === statusFilter);
  const counts   = incidents.reduce((acc, inc) => { acc[inc.status] = (acc[inc.status] || 0) + 1; return acc; }, {});

  if (loading) return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <p style={{ fontSize: "13px", color: "var(--color-muted)" }} className="animate-pulse">Cargando incidencias…</p>
    </div>
  );

  if (error) return (
    <div className="bg-main rounded-xl border border-main p-10 text-center">
      <AlertCircle size={24} style={{ margin: "0 auto 8px", color: "#A32D2D" }} />
      <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>{error}</p>
    </div>
  );

  if (incidents.length === 0) return (
    <div className="bg-main rounded-xl border border-main p-12 text-center">
      <AlertCircle size={26} style={{ margin: "0 auto 10px", color: "var(--color-muted)", opacity: 0.5 }} />
      <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>No tienes incidencias registradas.</p>
    </div>
  );

  return (
    <div className="space-y-3">

      {/* Filtros */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <button
          onClick={() => setStatusFilter("all")}
          style={{ background: statusFilter === "all" ? "#0f0f0f" : "var(--color-background-secondary)", color: statusFilter === "all" ? "#d4af37" : "var(--color-muted)", border: "1px solid var(--color-border)", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
          Todas · {incidents.length}
        </button>
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          if (!counts[status]) return null;
          const active = statusFilter === status;
          return (
            <button key={status} onClick={() => setStatusFilter(active ? "all" : status)}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: active ? cfg.bg : "var(--color-background-secondary)", color: active ? cfg.color : "var(--color-muted)", border: `1px solid ${active ? cfg.dot + "88" : "var(--color-border)"}`, borderRadius: "20px", padding: "3px 9px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: cfg.dot }} />
              {cfg.label} · {counts[status]}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-main rounded-xl border border-main p-8 text-center">
          <p style={{ fontSize: "12px", color: "var(--color-muted)" }}>No hay incidencias con este estado.</p>
        </div>
      )}

      {filtered.map((incident) => {
        const cfg      = STATUS_CONFIG[incident.status] || { label: incident.status, bg: "#F1EFE8", color: "#5F5E5A", dot: "#999" };
        const isOpen   = expanded[incident.id];
        const isClosed = ["resolved", "rejected"].includes(incident.status);
        const date     = new Date(incident.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
        const msgs     = messages[incident.id] || [];

        return (
          <div key={incident.id} className="bg-main rounded-xl border border-main overflow-hidden">

            {/* Cabecera */}
            <div onClick={() => toggleExpand(incident)} style={{ cursor: "pointer", padding: "13px 16px", userSelect: "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cfg.dot, flexShrink: 0, marginTop: "5px" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap", marginBottom: "3px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {incident.title}
                    </span>
                    <span style={{ background: cfg.bg, color: cfg.color, fontSize: "10px", padding: "1px 7px", borderRadius: "20px", fontWeight: "600", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--color-muted)", margin: 0, lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: isOpen ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {incident.description}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "7px", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", color: "var(--color-muted)" }}>
                      <Package size={9} />
                      Pedido <strong style={{ color: "var(--color-text-primary)", fontFamily: "monospace", marginLeft: "2px" }}>#{incident.order_id}</strong>
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--color-muted)" }}>
                      {incident.buyer_image ? (
                        <img src={incident.buyer_image} alt="" style={{ width: "14px", height: "14px", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <User size={9} />
                      )}
                      {incident.buyer_name || `ID #${incident.user_id}`}
                    </span>
                    {isOpen && msgs.length > 0 && (
                      <span style={{ fontSize: "10px", background: "#EEEDFE", color: "#534AB7", padding: "1px 6px", borderRadius: "10px", fontWeight: "600" }}>
                        {msgs.length} msg
                      </span>
                    )}
                    <span style={{ fontSize: "10px", color: "var(--color-muted)", marginLeft: "auto" }}>{date}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0, marginTop: "2px" }}>
                  {isOpen ? <ChevronUp size={14} color="var(--color-muted)" /> : <ChevronDown size={14} color="var(--color-muted)" />}
                </div>
              </div>
            </div>

            {/* Hilo */}
            {isOpen && (
              <div style={{ borderTop: "1px solid var(--color-border)" }}>

                {/* Botones estado — con confirmación */}
                {!isClosed && (
                  <div style={{ padding: "8px 14px", background: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
                    {confirmAction[incident.id] ? (
                      <>
                        <span style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: "500" }}>
                          ¿{confirmAction[incident.id] === "resolved" ? "Resolver" : "Rechazar"} esta incidencia?
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(incident.id, confirmAction[incident.id]); setConfirmAction((p) => ({ ...p, [incident.id]: null })); }}
                          style={{ background: confirmAction[incident.id] === "resolved" ? "#EAF3DE" : "#FCEBEB", color: confirmAction[incident.id] === "resolved" ? "#3B6D11" : "#A32D2D", border: `1px solid ${confirmAction[incident.id] === "resolved" ? "#86EFAC" : "#FCA5A5"}`, borderRadius: "8px", padding: "3px 12px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                          Confirmar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmAction((p) => ({ ...p, [incident.id]: null })); }}
                          style={{ background: "var(--color-background-main)", color: "var(--color-muted)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", cursor: "pointer" }}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: "10px", color: "var(--color-muted)", fontWeight: "500" }}>Cambiar estado:</span>
                        {incident.status !== "in_progress" && (
                          <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(incident.id, "in_progress"); }} disabled={!!updating[incident.id]}
                            style={{ background: "#E6F1FB", color: "#185FA5", border: "1px solid #93C5FD", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", fontWeight: "600", cursor: "pointer", opacity: updating[incident.id] ? 0.5 : 1 }}>
                            En progreso
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setConfirmAction((p) => ({ ...p, [incident.id]: "resolved" })); }} disabled={!!updating[incident.id]}
                          style={{ background: "#EAF3DE", color: "#3B6D11", border: "1px solid #86EFAC", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", fontWeight: "600", cursor: "pointer", opacity: updating[incident.id] ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle size={10} /> Resolver
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmAction((p) => ({ ...p, [incident.id]: "rejected" })); }} disabled={!!updating[incident.id]}
                          style={{ background: "#FCEBEB", color: "#A32D2D", border: "1px solid #FCA5A5", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", fontWeight: "600", cursor: "pointer", opacity: updating[incident.id] ? 0.5 : 1 }}>
                          Rechazar
                        </button>
                        {updating[incident.id] && <span style={{ fontSize: "10px", color: "var(--color-muted)", fontStyle: "italic" }}>Actualizando…</span>}
                      </>
                    )}
                  </div>
                )}

                {/* Mensajes */}
                <div style={{ padding: "14px 16px", maxHeight: "360px", overflowY: "auto", background: "var(--color-background-secondary)" }}>
                  {msgLoading[incident.id] ? (
                    <p style={{ fontSize: "11px", color: "var(--color-muted)", textAlign: "center", padding: "16px 0" }} className="animate-pulse">Cargando…</p>
                  ) : (
                    msgs.map((msg) => <MessageBubble key={msg.id} message={msg} currentUserId={userId} />)
                  )}
                  <div ref={(el) => (bottomRefs.current[incident.id] = el)} />
                </div>

                {!isClosed ? (
                  <MessageInput
                    onSend={(payload) => handleSend(incident.id, payload)}
                    sending={!!msgSending[incident.id]}
                    error={msgError[incident.id]}
                  />
                ) : (
                  <div style={{ padding: "12px 16px", background: "var(--color-background-main)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <CheckCircle size={12} style={{ color: incident.status === "resolved" ? "#3B6D11" : "#A32D2D" }} />
                    <p style={{ fontSize: "12px", color: "var(--color-muted)", margin: 0 }}>
                      {incident.status === "resolved" ? "Incidencia resuelta." : "Incidencia rechazada."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProfileSellerIncidents;