import { useState } from "react";
import { useTranslation } from "react-i18next";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const IncidentForm = ({ orderId, onClose }) => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError(t("incidents.descriptionRequired"));
      return;
    }

    const token = store.token || localStorage.getItem("token");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/order/${orderId}/incidences`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            title: `Incidencia pedido #${orderId}`,
            description,
          }),
        },
      );

      if (!res.ok) throw new Error();
      onClose();
    } catch {
      setError(t("incidents.submitError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-main">
          {t("incidents.title")}
        </h2>

        <div className="space-y-3">
          <textarea
            placeholder={t("incidents.placeholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full resize-none"
            rows={4}
          />

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-3 py-1"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary px-3 py-1 disabled:opacity-50"
            >
              {loading ? t("common.sending") : t("common.send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentForm;
