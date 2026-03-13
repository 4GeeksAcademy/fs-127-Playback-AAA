import { useProductSearch } from "../hooks/useProductSearch";
import { SearchHeader } from "../components/Search/SearchHeader";
import { SearchToolbar } from "../components/Search/SearchToolbar";
import { ProductGrid } from "../components/Search/ProductGrid";

export const SearchPage = () => {
  const { loading, results, paginated, totalPages, currentPage, setCurrentPage, categoryName, subcategoryName, itemName, } = useProductSearch();

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
      <SearchHeader loading={loading} resultsCount={results.length} categoryName={categoryName} subcategoryName={subcategoryName} itemName={itemName} />
      <SearchToolbar />
      <ProductGrid loading={loading} products={paginated} totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
};
