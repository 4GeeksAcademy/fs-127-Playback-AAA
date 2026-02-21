import { ArrowRight, ArrowLeft} from 'lucide-react';


export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center gap-1 my-8">
      
      {/* Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-gray-200 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ArrowLeft size={16} />
      </button>

      {/* Números */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 text-sm font-medium border transition-all
            ${page === currentPage
              ? "bg-stone-800 text-white border-stone-800"
              : "border-gray-200 hover:border-gray-400"
            }`}
        >
          {page}
        </button>
      ))}

      {/* Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border border-gray-200 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ArrowRight size={16} />
      </button>

    </div>
  );
};