import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ProfileInfo = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    name: "",
    last_name: "",
    email: "",
    image_url: ""
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageError, setImageError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageSuccess, setImageSuccess] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!user.name.trim())      newErrors.name      = t("profile.info.nameRequired");
    if (!user.last_name.trim()) newErrors.last_name = t("profile.info.lastNameRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setShowConfirm(true);
  };

  const confirmUpdate = async () => {
    setShowConfirm(false);
    setLoading(true);

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ name: user.name, last_name: user.last_name })
      }
    );

    setLoading(false);
    if (response.ok) setShowSuccess(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageError("");
    setImageSuccess(false);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setImageError(t("profile.info.imageFormat"));
      return;
    }
    if (file.size > maxSize) {
      setImageError(t("profile.info.imageSize"));
      return;
    }

    setImageLoading(true);
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/profile/image`,
        {
          method: "PUT",
          headers: { Authorization: "Bearer " + token },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setImageError(data.description || t("profile.info.imageUploadError"));
        setImageLoading(false);
        return;
      }

      setUser(prev => ({ ...prev, image_url: data.image_url }));
      setImageSuccess(true);

    } catch {
      setImageError(t("profile.info.connectionError"));
    }

    setImageLoading(false);
  };

  return (
    <div className="space-y-12 max-w-3xl mx-auto px-4">

      {/* INFORMACIÓN ACTUAL */}
      <div className="bg-main p-8 rounded-2xl shadow-sm border border-main">
        <h2 className="text-lg font-semibold mb-6 text-main">{t("profile.info.currentInfo")}</h2>

        <div className="flex items-center gap-6">
          <img
            className="w-24 h-24 rounded-full object-cover border-4 border-[rgb(var(--color-border))]"
            src={preview || user.image_url}
            alt={user.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vmini.png`;
            }}
          />
          <div>
            <p className="text-xl font-medium text-main">
              {user.name} {user.last_name}
            </p>
            <p className="text-muted text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      {/* EDITAR */}
      <div className="bg-main p-8 rounded-2xl shadow-sm border border-main">
        <h2 className="text-lg font-semibold mb-6 text-main">{t("profile.info.editInfo")}</h2>

        <div className="flex flex-col items-center mb-6 space-y-3">
          <label className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition text-sm">
            {imageLoading ? t("profile.info.uploading") : t("profile.info.changeImage")}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>

          {imageError   && <p className="text-sm text-red-500">{imageError}</p>}
          {imageSuccess && <p className="text-sm text-emerald-600">{t("profile.info.imageUpdated")}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="name"
              value={user.name}
              onChange={handleChange}
              placeholder={t("navbar.namePlaceholder")}
              className="input focus:ring-2 focus:ring-purple-500"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              name="last_name"
              value={user.last_name}
              onChange={handleChange}
              placeholder={t("navbar.lastNamePlaceholder")}
              className="input focus:ring-2 focus:ring-purple-500"
            />
            {errors.last_name && <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t("profile.info.saving") : t("profile.info.saveChanges")}
          </button>
        </form>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-main rounded-xl p-6 shadow-lg w-80 border border-main">
            <p className="mb-6 text-sm text-main">{t("profile.info.confirmChanges")}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary py-2 px-4 text-sm">
                {t("seller.cancel")}
              </button>
              <button onClick={confirmUpdate} className="btn-primary py-2 px-4 text-sm">
                {t("profile.info.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-main rounded-xl p-6 shadow-lg w-80 text-center border border-main">
            <p className="text-emerald-600 font-medium mb-6">{t("profile.info.profileUpdated")}</p>
            <button onClick={() => setShowSuccess(false)} className="btn-primary py-2 px-4 text-sm">
              {t("profile.info.close")}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileInfo;