import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Check } from "lucide-react";
import userService from "../../services/userService";

const ProfileSecurity = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const [, error] = await userService.updatePassword(token, form);

    if (error) {
      showToast(error.description || t("profile.security.error"), "error");
      return;
    }

    showToast(t("profile.security.updated"));
    setForm({ current_password: "", new_password: "", confirm_password: "" });
  };

  return (
    <>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 text-white dark:text-stone-900 text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-600 dark:bg-red-500"
              : "bg-stone-900 dark:bg-stone-100"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={15} />
          ) : (
            <Check size={15} />
          )}
          {toast.msg}
        </div>
      )}

      <div className="bg-main p-6 rounded-xl shadow border border-main max-w-xl">
        <h2 className="text-lg font-semibold mb-6 text-main">
          {t("profile.security.title")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="current_password"
            placeholder={t("profile.security.currentPassword")}
            value={form.current_password}
            onChange={handleChange}
            className="input"
          />
          <input
            type="password"
            name="new_password"
            placeholder={t("navbar.newPasswordPlaceholder")}
            value={form.new_password}
            onChange={handleChange}
            className="input"
          />
          <input
            type="password"
            name="confirm_password"
            placeholder={t("navbar.confirmPasswordPlaceholder")}
            value={form.confirm_password}
            onChange={handleChange}
            className="input"
          />

          <button className="btn-primary w-full">
            {t("profile.security.update")}
          </button>
        </form>
      </div>
    </>
  );
};

export default ProfileSecurity;
