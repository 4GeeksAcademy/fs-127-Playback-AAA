import productServices from "../services/productService";
import { useState, useEffect } from "react";
import { Heart, ShoppingCart } from 'lucide-react';
import { Pagination } from "../components/Pagination";


export const PageProducts = () => {

    const [products, setProducts] = useState([]);
    useEffect(() => {
        productServices.getAllProducts().then(data => setProducts(data));
    }, []);

    const categorias =
    {
        nombre: "Vinilos",
        subcategoria: "Música y Coleccionismo",
        image: "https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=400"
    };
    const [currentPage, setCurrentPage] = useState(1);
    const productosPorPagina = 8;
    const totalPages = Math.ceil(products.length / productosPorPagina);
    const productosPaginados = products.slice(
        (currentPage - 1) * productosPorPagina,
        currentPage * productosPorPagina
    );

    return (
        <div>

            <section className="w-full px-20 max-w-screen-2xl mx-auto ">
                <div className="py-5">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{categorias.subcategoria}</p>
                    <p className="text-2xl font-semibold mt-1 pb-3">{categorias.nombre}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                    {productosPaginados.map(p => (
                        <div key={p.id} className="cursor-pointer  p-1">
                            <div className="relative overflow-hidden">
                                <img
                                    src={p.image_url || "https://placehold.co/300x300?text=Sin+imagen"}
                                    alt={p.name}
                                    className="w-full h-40 sm:h-44 md:h-64 lg:h-80 object-cover"
                                    onError={(e) => e.target.src = "https://placehold.co/300x300?text=Sin+imagen"} />
                                <button className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 p-2 rounded-full transition-all">
                                    <Heart size={16} strokeWidth={2.5} className="text-white" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between ">
                                <div>
                                    <p className="text-sm  pt-3">{p.name}</p>
                                    <p className="text-sm font-medium pb-3">{p.price + "€"}</p>
                                </div>

                                <button className="bg-stone-800 hover:bg-stone-500 text-white transition-all flex items-center justify-center p-2">
                                    <ShoppingCart size={16} />

                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center mt-6">


                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </section>


        </div>
    )
}