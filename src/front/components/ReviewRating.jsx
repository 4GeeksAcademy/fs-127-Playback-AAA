import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { StarRating } from "./StarRating";
 
// ─── Barra de distribución ────────────────────────────────────────────────────
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs text-faint">
      <span className="w-3 text-right">{star}</span>
      <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-main/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-4 text-right">{count}</span>
    </div>
  );
};
 
// ─── Componente principal ─────────────────────────────────────────────────────
export const ReviewRating = ({ product }) => {
  const { t } = useTranslation();
  const reviews = product.reviews || [];
  const total = reviews.length;
 
  const avg = total
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / total
    : 0;
 
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
 
  return (
    <section className="mt-12 pt-8 border-t border-main">
      <h3 className="text-base font-semibold text-main mb-6">
        {t("product.reviews")}
      </h3>
 
      {total === 0 ? (
        <p className="text-sm text-muted">{t("product.noReviews")}</p>
      ) : (
        <>
          {/* ── Resumen superior ─────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-8 mb-8">
 
            {/* Puntuación global */}
            <div className="flex flex-col items-center justify-center gap-1 min-w-[100px]">
              <span className="text-5xl font-bold text-main leading-none">
                {avg.toFixed(1)}
              </span>
              <StarRating rating={avg} />
              <span className="text-xs text-faint mt-1">
                {total} {t("product.reviewsCount")}
              </span>
            </div>
 
            {/* Barras de distribución */}
            <div className="flex-1 flex flex-col justify-center gap-1.5 max-w-sm">
              {dist.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={total} />
              ))}
            </div>
          </div>
 
          {/* ── Lista de reseñas ─────────────────────────────────────────── */}
          <div className="space-y-5 max-w-lg">
            {reviews.map((r) => (
              <div key={r.id} className="flex gap-4">
 
                {/* Avatar inicial */}
                <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-sm font-semibold text-violet-600 dark:text-violet-400 shrink-0">
                  {r.user?.[0]?.toUpperCase() || "?"}
                </div>
 
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-main">{r.user}</span>
                      <StarRating rating={r.rating} />
                    </div>
                    <span className="text-xs text-faint">
                      {new Date(r.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </div>
 
                  {r.title && (
                    <p className="text-sm font-semibold text-main mt-1">{r.title}</p>
                  )}
                  {r.comment && (
                    <p className="text-sm text-muted mt-0.5 leading-relaxed">{r.comment}</p>
                  )}
                </div>
 
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};