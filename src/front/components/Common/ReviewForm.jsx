import { useState } from "react";
import { useTranslation } from "react-i18next";
import orderServices from "../../services/orderService";
import { Star, CheckCircle } from "lucide-react";

export const ReviewForm = ({ productId, orderId, onDone }) => {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setError(t("review.ratingRequired"));
    setLoading(true);
    const token = localStorage.getItem("token");
    const [, err] = await orderServices.createReview(
      {
        product_id: parseInt(productId),
        order_id: orderId,
        rating,
        title,
        comment,
      },
      token,
    );
    setLoading(false);
    if (err) {
      setError(
        err.includes("Ya has valorado")
          ? "Ya has valorado este producto en este pedido"
          : err,
      );
      return;
    }
    setSuccess(true);
    if (onDone) setTimeout(onDone, 2000);
  };

  if (success)
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "#EAF3DE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle size={24} color="#3B6D11" />
        </div>
        <p style={{ fontWeight: "500", color: "#3B6D11" }}>
          {t("review.successTitle")}
        </p>
        <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>
          {t("review.successMsg")}
        </p>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p
          style={{
            fontSize: "12px",
            color: "#A32D2D",
            background: "#FCEBEB",
            padding: "8px 12px",
            borderRadius: "8px",
          }}
        >
          {error}
        </p>
      )}

      {/* Estrellas */}
      <div>
        <label
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--color-muted)",
            display: "block",
            marginBottom: "8px",
          }}
        >
          {t("review.rating")}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <Star
                size={28}
                style={{
                  fill: star <= (hover || rating) ? "#F59E0B" : "transparent",
                  color: star <= (hover || rating) ? "#F59E0B" : "#D1D5DB",
                  transition: "all 0.1s ease",
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Título */}
      <div>
        <label
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--color-muted)",
            display: "block",
            marginBottom: "6px",
          }}
        >
          {t("review.titleLabel")}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("review.titlePlaceholder")}
          className="input focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Comentario */}
      <div>
        <label
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--color-muted)",
            display: "block",
            marginBottom: "6px",
          }}
        >
          {t("review.commentLabel")}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("review.commentPlaceholder")}
          rows={3}
          className="input resize-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        {loading ? t("review.sending") : t("review.submit")}
      </button>
    </form>
  );
};
