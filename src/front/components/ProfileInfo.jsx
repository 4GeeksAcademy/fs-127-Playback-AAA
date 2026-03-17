import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import userService from "../services/userService";

const ROLE_LABELS = {
  buyer:  { label: "Comprador",      color: "#185FA5", bg: "#E6F1FB" },
  seller: { label: "Vendedor",       color: "#3B6D11", bg: "#EAF3DE" },
  admin:  { label: "Administrador",  color: "#A32D2D", bg: "#FCEBEB" },
};

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: "11px", color: "var(--color-muted, #6b7280)", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {label}
    </p>
    <p style={{ fontSize: "14px", color: "var(--color-text-primary)", fontWeight: "400" }}>
      {value || "—"}
    </p>
  </div>
);

const ProfileInfo = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({ name: "", last_name: "", email: "", image_url: "", created_at: "", role: "" });
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageSuccess, setImageSuccess] = useState(false);

  useEffect(() => {
    userService.getProfile(token).then(([data, error]) => {
      if (error) return console.error(error);
      setUser(data);
    });
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!user.name?.trim())      newErrors.name      = t("profile.info.nameRequired");
    if (!user.last_name?.trim()) newErrors.last_name = t("profile.info.lastNameRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setShowConfirm(true);
  };

  const confirmUpdate = async () => {
    setShowConfirm(false);
    setLoading(true);
    const [, error] = await userService.updateProfile(token, { name: user.name, last_name: user.last_name });
    setLoading(false);
    if (!error) setShowSuccess(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError("");
    setImageSuccess(false);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setImageError(t("profile.info.imageFormat")); return; }
    if (file.size > 2 * 1024 * 1024) { setImageError(t("profile.info.imageSize")); return; }
    setImageLoading(true);
    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("image", file);
    const [data, error] = await userService.updateProfileImage(token, formData);
    if (error) { setImageError(error); setImageLoading(false); return; }
    setUser(prev => ({ ...prev, image_url: data.image_url }));
    setImageSuccess(true);
    setImageLoading(false);
  };

  const roleInfo = ROLE_LABELS[user.role] || null;

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  };

  const getInitials = () => {
    const f = user.name?.[0] || "";
    const l = user.last_name?.[0] || "";
    return (f + l).toUpperCase() || "?";
  };

  return (
    <div className="space-y-5">

      {/* ── Información actual ── */}
      <div className="bg-main rounded-xl border border-main p-6">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-5">
          {t("profile.info.currentInfo")}
        </h2>

       
        {/* Campos de info */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Nombre"       value={user.name} />
          <Field label="Apellido"     value={user.last_name} />
          <Field label="Email"        value={user.email} />
          <Field label="Miembro desde" value={formatDate(user.created_at)} />
        </div>
      </div>

      {/* ── Editar información ── */}
      <div className="bg-main rounded-xl border border-main p-6">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-5">
          {t("profile.info.editInfo")}
        </h2>

        {/* Foto */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-main">
          <div className="flex-shrink-0">
            {(preview || user.image_url) ? (
              <img
                className="w-14 h-14 rounded-full object-cover border-2 border-[rgb(var(--color-border))]"
                src={preview || user.image_url}
                alt=""
                onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
              />
            ) : (
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "#EEEDFE", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "16px", fontWeight: "500", color: "#534AB7",
              }}>
                {getInitials()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-main mb-1">Foto de perfil</p>
            <p className="text-xs text-muted mb-2">JPG, PNG o WEBP · máx. 2MB</p>
            <label className="inline-block bg-purple-600 text-white px-3 py-1.5 rounded-lg cursor-pointer hover:bg-purple-700 transition text-xs">
              {imageLoading ? t("profile.info.uploading") : t("profile.info.changeImage")}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            {imageError   && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
            {imageSuccess && <p className="text-xs text-emerald-600 mt-1">{t("profile.info.imageUpdated")}</p>}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-muted mb-1">Nombre</label>
              <input name="name" value={user.name} onChange={handleChange}
                placeholder={t("navbar.namePlaceholder")}
                className="input focus:ring-2 focus:ring-purple-500" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Apellido</label>
              <input name="last_name" value={user.last_name} onChange={handleChange}
                placeholder={t("navbar.lastNamePlaceholder")}
                className="input focus:ring-2 focus:ring-purple-500" />
              {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
            </div>
          </div>

          {/* Email — solo lectura */}
          <div className="mb-5">
            <label className="block text-xs text-muted mb-1">Email</label>
            <input
              value={user.email}
              disabled
              className="input opacity-60 cursor-not-allowed"
              style={{ background: "var(--color-background-secondary)" }}
            />
            <p className="text-xs text-muted mt-1">El email no se puede modificar</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t("profile.info.saving") : t("profile.info.saveChanges")}
          </button>
        </form>
      </div>

      {/* ── Modal confirmación ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-main rounded-xl p-6 shadow-lg w-80 border border-main">
            <p className="mb-6 text-sm text-main">{t("profile.info.confirmChanges")}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary py-2 px-4 text-sm">{t("seller.cancel")}</button>
              <button onClick={confirmUpdate} className="btn-primary py-2 px-4 text-sm">{t("profile.info.confirm")}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal éxito ── */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-main rounded-xl p-6 shadow-lg w-80 text-center border border-main">
            <p className="text-emerald-600 font-medium mb-6">{t("profile.info.profileUpdated")}</p>
            <button onClick={() => setShowSuccess(false)} className="btn-primary py-2 px-4 text-sm">{t("profile.info.close")}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;