import { StarRating } from "../components/StarRating";
import { useTranslation } from "react-i18next";

export const ReviewRating = ({ product }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-8 pt-4">
      <h3 className="text-sm font-semibold uppercase text-stone-500 mb-4">
        {t("product.reviews")}
      </h3>
      <div className="flex flex-col gap-4">
        {product.reviews?.map((r) => (
          <div key={r.id} className="border-b pb-4">
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={r.rating} />
              <span className="text-xs text-stone-400">{r.user}</span>
            </div>
            <p className="text-sm font-medium text-stone-800">{r.title}</p>
            <p className="text-xs text-stone-500 mt-1">{r.comment}</p>
            <p className="text-xs text-stone-500 mt-1">{new Date(r.created_at).toLocaleDateString("es-ES")}</p>

          </div>
        ))}
      </div>
    </div>
  );
};