import { useNavigate } from "react-router-dom";

export const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="w-full px-4 max-w-screen-2xl mx-auto my-6">
        <div
          className="relative overflow-hidden min-h-48 sm:min-h-60 md:min-h-72 flex items-center justify-center"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1983038/pexels-photo-1983038.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 bg-black/70 text-white px-5 py-5 sm:px-8 sm:py-8 flex flex-col items-center text-center w-11/12 sm:w-80 md:w-96 m-4">
            <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Captura el momento</h4>
            <span className="text-xs font-bold uppercase mb-2">¡Oferta especial!</span>
            <p className="text-stone-300 text-xs sm:text-sm mb-4 sm:mb-6">
              Toda nuestra colección de cámaras analógicas con descuento. ¡Solo por tiempo limitado!
            </p>
            <button
              onClick={() => navigate("/products?category=camaras")}
              className="bg-stone-800 hover:bg-stone-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs sm:text-sm transition-all w-full"
            >
              Ver ofertas
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};