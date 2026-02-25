import productServices from "../services/productService";
import { useState, useEffect } from "react";
import { Pagination } from "../components/Pagination";
import {  useParams } from "react-router-dom";


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
          <p className="text-2xl font-semibold mt-1 pb-3">
            {category || "No tiene cat"}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
          {productosPaginados
            .filter((p) => p != null)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
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
