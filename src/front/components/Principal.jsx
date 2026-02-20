import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useState, useEffect } from "react";
import productServices from "../services/productService";


export const Principal = () => {
  const [products, setProducts] = useState([]);
useEffect(() => {
  productServices.getAllProducts().then(data => setProducts(data));
}, []);
  const featuredCategories = [
    { name: "Ropa", icon: "👗", color: "from-rose-100 to-pink-50" },
    { name: "Tecnología", icon: "💻", color: "from-blue-100 to-cyan-50" },
    { name: "Hogar", icon: "🏠", color: "from-amber-100 to-yellow-50" },
    { name: "Ropa", icon: "👗", color: "from-rose-100 to-pink-50" },
    { name: "Tecnología", icon: "💻", color: "from-blue-100 to-cyan-50" },
    { name: "Hogar", icon: "🏠", color: "from-amber-100 to-yellow-50" },
    { name: "Ropa", icon: "👗", color: "from-rose-100 to-pink-50" },
    { name: "Tecnología", icon: "💻", color: "from-blue-100 to-cyan-50" },
    { name: "Hogar", icon: "🏠", color: "from-amber-100 to-yellow-50" },
  ];

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
    <div>
      <section>
        <div className="w-full px-4  max-w-screen-2xl w-full mx-auto my-6">
          <div className="relative rounded-2xl overflow-hidden bg-primary text-white p-8 l justify-between min-h-48 cursor-pointer">
            <div>
              <span className="inline-block bg-amber-400 text-stone-900 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">Oferta Especial</span>
              <h3 className="text-3xl font-bold leading-tight" >Hasta 50% OFF</h3>
              <p className="text-stone-300 mt-1 text-sm">En productos seleccionados. ¡Solo por hoy!</p>
            </div>
            <button className="self-start mt-6 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-all group-hover:scale-105 transform">
              Ver ofertas →
            </button>
          </div>
        </div>

      </section>
      <section>

    
        <h2 className="text-lg font-semibold m-4 ">Categorías Destacadas</h2>
        <div className="grid grid-cols-4 gap-4 mx-64">
          {featuredCategories.slice(0, 8).map(cat => (
            <div key={cat.name} className="cursor-pointer group">
              {/* aspect-square max-w-[300px] es para el tamaño de las imagenes*/}
              <div className={`w-full aspect-square max-w-[300px] rounded-md bg-gradient-to-br ${cat.color} flex items-center justify-center text-4xl`}>
                {cat.icon}
              </div>
              <p className="text-xs font-semibold uppercase mt-2 text-gray-700">
                {cat.name}
              </p>
            </div>
          ))}
        </div>

      </section >

      <section>

        <div className="flex items-center justify-between m-4">
          <h2 className="text-lg font-semibold tracking-tight">Productos Favoritos</h2>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">Ver todos →</button>
        </div>
        <div className="mx-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => (
            <div
              key={p.id}
              className="border rounded-2xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1">

              <div className="aspect-square flex items-center justify-center text-5xl bg-gray-50 group-hover:scale-105 transition-transform duration-300">
                {p.image_url}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{p.name}</p>
                <p className="text-amber-600 font-bold mt-0.5">{p.price}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <StarRating rating={p.rating} />                 
                  <span className="text-xs text-gray-500">({p.Review})</span>
                </div>

                <button
                  className="mt-3 w-full bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div >
  );
};