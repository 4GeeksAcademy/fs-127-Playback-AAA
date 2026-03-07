import { useState } from "react";
import { Pagination } from "../components/Pagination";
import { CardProduct } from "../components/CardProduct";
import { useProductSearch } from "../hooks/useProductSearch";
import { SearchHeader } from "../components/Search/SearchHeader";
import { SearchToolbar } from "../components/Search/SearchToolbar";





export const PageProducts = () => {
  //Usamos el hook personalizado para obtener los productos y la info de la búsqueda
  const { loading, results, categoryName, subcategoryName, itemName, } = useProductSearch();

  //Esto es para la paginacion le decimos que empieza en la 1 que queremos que muestre 8 y las paginas que tenemos
  const [currentPage, setCurrentPage] = useState(1);
  const productosPorPagina = 8;
  const totalPages = Math.ceil(results.length / productosPorPagina);

  //Aqui decimos los productos que se van a mostrar es decir del 1 al 8 la primera
  const productosPaginados = results.slice(
    (currentPage - 1) * productosPorPagina,
    currentPage * productosPorPagina,
  );

  return (
    <div>
      <section className="w-full px-20 max-w-screen-2xl mx-auto ">
        <SearchHeader loading={loading} resultsCount={results.length} categoryName={categoryName} subcategoryName={subcategoryName} itemName={itemName} />
        <SearchToolbar />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
          {productosPaginados
            .filter((p) => p != null)
            .map((p) => (
              <CardProduct key={p.id} product={p} />
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
