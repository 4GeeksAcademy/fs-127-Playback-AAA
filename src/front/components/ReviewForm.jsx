import { useState } from "react";
import { useTranslation } from "react-i18next";
import orderServices from "../services/orderService";
import { Star } from "lucide-react";

export const ReviewForm = ({ productId, orderId, onDone }) => {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) return setError(t("review.ratingRequired"));

    setLoading(true);
    const token = localStorage.getItem("token");

    const [data, err] = await orderServices.createReview(
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
      if (err.includes("Ya has valorado")) {
        setError("Ya has valorado este producto en este pedido");
      } else {
        setError(err);
      }
      return;
    }

    setSuccess(true);
    if (onDone) setTimeout(onDone, 3000);
  };

  if (success)
    return (
      <div className="mt-10 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-6 text-center">
        <p className="text-emerald-700 dark:text-emerald-400 font-medium tracking-wide">
          {t("review.successTitle")}
        </p>
        <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">
          {t("review.successMsg")}
        </p>
      </div>
    );

  return (
    <div className="">


      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-4 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
        <div>
          <label className="text-xs uppercase tracking-widest text-faint mb-2 block">
            {t("review.rating")}
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)}>
                <Star
                  size={28}
                  className={
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-faint"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-faint mb-2 block">
            {t("review.titleLabel")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("review.titlePlaceholder")}
            className="input focus:border-[rgb(var(--color-border-focus))]"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-faint mb-2 block">
            {t("review.commentLabel")}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("review.commentPlaceholder")}
            rows={4}
            className="input resize-none focus:border-[rgb(var(--color-border-focus))]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 hover:bg-stone-700 dark:bg-stone-100 dark:hover:bg-stone-300 dark:text-stone-900 text-white py-3 text-sm font-medium tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("review.sending") : t("review.submit")}
        </button>
      </form>
    </div>
  );
};