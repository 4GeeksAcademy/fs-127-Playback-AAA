import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, ImagePlus, AlertCircle } from "lucide-react";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import incidentService from "../../services/incidentService";

const IncidentForm = ({ sellerOrderId, onClose, onSuccess }) => {
  const { store }  = useGlobalReducer();
  const { t }      = useTranslation();
  const fileRef    = useRef(null);

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [images,      setImages]      = useState([]);   // [{ file, preview }]
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [imgError,    setImgError]    = useState("");

  const handleFiles = (e) => {
    setImgError("");
    const files = Array.from(e.target.files || []);
    const total = images.length + files.length;

    if (total > 4) {
      setImgError("Máximo 4 imágenes.");
      e.target.value = "";
      return;
    }

    const invalid = files.find((f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type));
    if (invalid) { setImgError("Solo JPG, PNG o WEBP."); e.target.value = ""; return; }

    const tooBig = files.find((f) => f.size > 2 * 1024 * 1024);
    if (tooBig) { setImgError("Cada imagen debe ser menor de 2 MB."); e.target.value = ""; return; }

    setImages((prev) => [...prev, ...files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))]);
    e.target.value = "";
  };

  const removeImage = (i) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async () => {
    if (!title.trim())       { setError(t("incidents.subjectRequired"));     return; }
    if (!description.trim()) { setError(t("incidents.descriptionRequired")); return; }

    const token = store.token || localStorage.getItem("token");
    setLoading(true);
    setError("");

    // 1. Crear incidencia
    const [incident, err] = await incidentService.createIncident(
      sellerOrderId,
      { title, description },
      token
    );

    if (err) { setError(t("incidents.submitError")); setLoading(false); return; }

    // 2. Enviar imágenes como primer mensaje (una por llamada para evitar límites)
    if (images.length > 0) {
      for (const img of images) {
        const fd = new FormData();
        fd.append("body", "");
        fd.append("image", img.file);
        await incidentService.sendIncidentMessage(incident.id, fd, token);
      }
    }

    setLoading(false);
    if (onSuccess) onSuccess(sellerOrderId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-main rounded-2xl shadow-2xl border border-main w-full"
        style={{ maxWidth: "440px", margin: "0 16px" }}
      >
        {/* Cabecera */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F59E0B", flexShrink: 0 }} />
            <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text-primary)", margin: 0 }}>
              {t("incidents.title")}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", display: "flex", padding: "2px" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Asunto */}
          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: "500", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {t("incidents.subjectLabel")}
            </label>
            <input
              type="text"
              placeholder={t("incidents.subjectPlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input w-full"
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: "500", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {t("incidents.description")}
            </label>
            <textarea
              placeholder={t("incidents.placeholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full resize-none"
              rows={4}
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Fotos */}
          <div>
            <label style={{ fontSize: "11px", color: "var(--color-muted)", fontWeight: "500", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Fotos del problema <span style={{ opacity: 0.6, textTransform: "none", letterSpacing: 0 }}>(opcional · máx. 4)</span>
            </label>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img
                    src={img.preview}
                    alt=""
                    style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", border: "1.5px solid var(--color-border)" }}
                  />
                  <button
                    onClick={() => removeImage(i)}
                    style={{ position: "absolute", top: "-5px", right: "-5px", background: "#A32D2D", color: "white", border: "none", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
                  >
                    <X size={9} />
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <label
                  style={{ width: "64px", height: "64px", borderRadius: "8px", border: "1.5px dashed var(--color-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "3px", background: "var(--color-background-secondary)", transition: "border-color 0.15s" }}
                >
                  <ImagePlus size={16} style={{ color: "var(--color-muted)" }} />
                  <span style={{ fontSize: "9px", color: "var(--color-muted)" }}>Añadir</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                  />
                </label>
              )}
            </div>

            {imgError && (
              <p style={{ fontSize: "11px", color: "#A32D2D", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertCircle size={10} /> {imgError}
              </p>
            )}
          </div>

          {error && (
            <p style={{ fontSize: "12px", color: "#A32D2D", display: "flex", alignItems: "center", gap: "5px", margin: 0 }}>
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px 16px", display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid var(--color-border)" }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: "6px 16px", fontSize: "13px" }}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
            style={{ padding: "6px 18px", fontSize: "13px", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Enviando…" : t("common.send")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentForm;