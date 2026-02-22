import productServices from "../services/productService";
import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Pagination } from "../components/Pagination";
import { Link, useParams } from "react-router-dom";
import { FavoriteButton } from "../components/FavoriteButton";

export const PageProducts = () => {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productServices.getAllProducts().then(([data]) => {
       //cogemos la categoria y la subcategoria
      const cat = category?.toLowerCase();
      const subcat = subcategory?.toLowerCase();
      //Revisamos que haya categoria en la url y revisamos que coincidan categoria y sub
      //y los ponemos en minusculas para que no hayan errores 
      const filtrados = cat
        ? (data ?? []).filter(
            (p) =>
              p.category?.toLowerCase() === cat &&
              (!subcat ||
                p.subcategory?.toLowerCase() === subcat ||
                p.item?.toLowerCase() === subcat),
          )
        : (data ?? []);
      setProducts(filtrados);
    });
  }, [category, subcategory]);

  //Esto es para la paginacion le decimos que empieza en la 1 que queremos que muestre 8 y las paginas que tenemos
  const [currentPage, setCurrentPage] = useState(1);
  const productosPorPagina = 8;
  const totalPages = Math.ceil(products.length / productosPorPagina);

  //Aqui decimos los productos que se van a mostrar es decir del 1 al 8 la primera 
  const productosPaginados = products.slice(
    (currentPage - 1) * productosPorPagina,
    currentPage * productosPorPagina,
  );


  return (
    <div>
      <section className="w-full px-20 max-w-screen-2xl mx-auto ">
        <div className="py-5">
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            {subcategory || "No tenemos sub"}
          </p>
          <p className="text-2xl font-semibold mt-1 pb-3">{category || "No tiene cat"}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
          {productosPaginados
            .filter((p) => p != null)
            .map((p) => (
              <Link
                to={`/PageDetailProduct/${p.id}`}
                key={p.id}
                className="btn btn-sm btn-outline-warning btn-more fw-bold block"
              >
                <div className="cursor-pointer  p-1">
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        p.image_url ||
                        "https://placehold.co/300x300?text=Sin+imagen"
                      }
                      alt={p.name}
                      className="w-full h-40 sm:h-44 md:h-64 lg:h-80 object-cover"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/300x300?text=Sin+imagen")
                      }
                    />
                    <FavoriteButton
                      product={p}
                      className="absolute top-3 right-3"
                    />
                  </div>
                  <div className="flex items-center justify-between ">
                    <div>
                      <p className="text-sm  pt-3">{p.name}</p>
                      <p className="text-sm font-medium pb-3">
                        {p.price + "€"}
                      </p>
                    </div>

                    <button className="bg-stone-800 hover:bg-stone-500 text-white transition-all flex items-center justify-center p-2">
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </Link>
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
  );
};
