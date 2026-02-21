import { useState, useEffect } from "react";
import productServices from "../services/productService";
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useRef } from "react";




export const Principal = () => {
  // Es para poder controlar el carrousel
  const carouselRef = useRef(null);
  // Aqui le decimos cuanto queremos que se mueva el carrousel el  behavior: "smooth" es una animacion
  const scroll = (dir) => {
    carouselRef.current?.scrollBy({ left: dir === "right" ? 400 : -400, behavior: "smooth" });
  };
  const [products, setProducts] = useState([]);
  useEffect(() => {
    productServices.getAllProducts().then(data => setProducts(data));
  }, []);




  const featuredCategories = [
    { name: "Vinilos", image: "https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Consolas", image: "https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Libros", image: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Cámaras", image: "https://images.pexels.com/photos/1983038/pexels-photo-1983038.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Cassettes", image: "https://images.pexels.com/photos/3811082/pexels-photo-3811082.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Arcade", image: "https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Guitarras", image: "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Relojes", image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Posters", image: "https://images.pexels.com/photos/1070345/pexels-photo-1070345.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Radios", image: "https://images.pexels.com/photos/4495755/pexels-photo-4495755.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Juguetes", image: "https://images.pexels.com/photos/163036/mario-luigi-yoshi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { name: "Monedas", image: "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400" },
  ];

  // Necessitamos usar el sort para que no coincidan las categorias que queremos mostrar
  const categoriasAleatorias = [...featuredCategories]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);


  // Esto es una funcion para que cree las estrellas
  function StarRating({ rating }) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  }

  return (
    <div >


      <section>
        {/* Es importante el w-full y el max-w-screen-2xl para que ocupe el maximo posible y que no se deforme la imagen maximo 1536 px*/}
        <div className="w-full px-4 max-w-screen-2xl mx-auto my-6">
          <div className="relative  overflow-hidden min-h-48 sm:min-h-60 md:min-h-72 flex items-center justify-center"
            style={{
              backgroundImage: "url('https://images.pexels.com/photos/1983038/pexels-photo-1983038.jpeg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Ponemos un fondo un poco mas oscuro encima de la imagen? o lo quitamos?*/}
            <div className="absolute inset-0 bg-black/20" />

            {/* Cuadro de texto negro encima de la imagen */}
            <div className="relative z-10 bg-black/70 text-white px-5 py-5 sm:px-8 sm:py-8 flex flex-col items-center text-center w-11/12 sm:w-80 md:w-96 m-4">
              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3"> Captura el momento</h4>
              <span className="text-xs font-bold uppercase mb-2">¡Oferta especial!</span>
              <p className="text-stone-300 text-xs sm:text-sm mb-4 sm:mb-6">
                Toda nuestra colección de cámaras analógicas con descuento.
                ¡Solo por tiempo limitado!
              </p>

              {/* Programar boton para que al hacer click vaya a la pagina de la oferta */}
              <button className="bg-stone-800 hover:bg-stone-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs sm:text-sm  transition-all w-full">
                Ver ofertas
              </button>
            </div>
          </div>
        </div>
      </section>



      {/* -------------------------------CATEGORIAS DESTACADAS */}
      <div className="w-full px-4 max-w-screen-2xl mx-auto">
        <section>
          <h2 className="text-lg font-semibold my-4 ">Categorías Destacadas</h2>

          {/* Preguntar como mostrar el hover si con sombra o que cambie de color o que se agrande luego el titulo */}
          {/* Preguntas los anchos.. */}


         <div className="">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categoriasAleatorias.map(cat => (
          <div key={cat.name} className="cursor-pointer group hover:shadow-md transition-all duration-200">
            <img src={cat.image} alt={cat.name} className="w-full h-40 sm:h-44 md:h-48 object-cover" />
            <p className="text-center text-xs font-semibold uppercase py-2">{cat.name}</p>
          </div>
        ))}
      </div>
    </div>
        </section >



        {/* -----------------Mejor Valorados */}
        <section className="mt-8">
          <div className="flex items-center justify-between my-4 ">
          <h2 className="text-lg font-semibold tracking-tight">Top Ventas</h2>
      <div>
        <button onClick={() => scroll("left")} className="text-amber-600 hover:text-amber-700"><ArrowLeft /></button>
        <button onClick={() => scroll("right")} className="text-amber-600 hover:text-amber-700"><ArrowRight /></button>
      </div>
    </div>
          {/* grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4  */}
          <div className="overflow-hidden">
      <div ref={carouselRef} className="flex gap-3 overflow-x-hidden">
        {products.map(p => (
          <div
            key={p.id}
            className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 flex-none border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200"
          >
            <div className="h-[200px] w-full bg-gray-50 overflow-hidden relative">
              <img
                src={p.image_url || "https://placehold.co/300x300?text=Sin+imagen"}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = "https://placehold.co/300x300?text=Sin+imagen"}
              />
              <button className="absolute bottom-3 left-3 right-3 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold py-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                Añadir al carrito
              </button>
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm truncate">{p.name}</p>
              <p className="text-amber-600 font-bold mt-0.5 text-sm">{p.price}€</p>
              <div className="flex items-center gap-1.5 mt-1">
                {p.rating > 0 && (
                  <>
                    <StarRating rating={p.rating} />
                    <span className="text-xs text-gray-400">({p.Review})</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>

</div>

    </div>
  );
};
