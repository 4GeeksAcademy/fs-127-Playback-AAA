import { ArrowRight, ArrowLeft} from 'lucide-react';


const VISIBLE_PAGES = 6;

const getPageNumbers = (currentPage, totalPages) => {
  const start = Math.max(1, Math.min(currentPage - Math.floor(VISIBLE_PAGES / 2), totalPages - VISIBLE_PAGES + 1));
  return Array.from({ length: Math.min(VISIBLE_PAGES, totalPages) }, (_, i) => start + i);
};
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 my-8">
      
      {/* Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-gray-200 bg-theme-bg text-theme-text hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ArrowLeft size={16} />
      </button>

      {/* Números */}
           {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 text-sm font-medium border transition-all
            ${page === currentPage
              ? "bg-gray-950 text-white border-gray-950 dark:bg-violet-500 dark:text-white dark:border-violet-500"
              : "border-theme-border hover:border-gray-400 bg-theme-bg text-theme-text"
            }`}
        >
          {page}
        </button>
    
      ))}

      {/* Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border border-gray-200 bg-theme-bg text-theme-text hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ArrowRight size={16} />
      </button>

    </div>
  );
};