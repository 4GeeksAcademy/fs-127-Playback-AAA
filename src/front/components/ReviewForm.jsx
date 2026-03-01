import { useState } from "react";
import orderServices from "../services/orderService";
import { Star } from "lucide-react";

export const ReviewForm = ({ productId, orderId }) => {
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    //Evita que recargue la pagina al enviar el formulario
    e.preventDefault();

    if (rating === 0) return setError("Por favor selecciona una puntuación.");
    //Lo usamos para que el usuario no pueda pulsar 2 veces el boton de enviar y entonces lo desabilitamos hasta que se envia
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
    if (err) return setError(err);
    setSuccess(true);
  };

  if (success)
    return (
      <div className="mt-10 border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-emerald-700 font-medium tracking-wide">
          Reseña enviada con éxito
        </p>
        <p className="text-sm text-emerald-600 mt-1">
          Gracias por compartir tu opinión.
        </p>
      </div>
    );

  return (
    <div className="mt-10 border-t border-stone-200 pt-10">
      <h3 className="text-lg font-semibold text-stone-900 tracking-tight mb-6">
        Escribe tu reseña
      </h3>

      {error && (
        <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 px-4 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
        <div>
          <label className="text-xs uppercase tracking-widest text-stone-400 mb-2 block">
            Puntuación
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)}>
                <Star
                  size={28}
                  className={
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-stone-300"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-stone-400 mb-2 block">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resume tu experiencia"
            className="w-full border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-stone-50 focus:outline-none focus:border-stone-400 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-stone-400 mb-2 block">
            Comentario
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia con el producto..."
            rows={4}
            className="w-full border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-stone-50 focus:outline-none focus:border-stone-400 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 hover:bg-stone-700 text-white py-3 text-sm font-medium tracking-widest uppercase transition-all duration-300 disabled:bg-stone-300 disabled:cursor-not-allowed"
        >
          {loading ? "Enviando..." : "Enviar reseña"}
        </button>
      </form>
    </div>
  );
};
