import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback, useThrottledCallback } from 'use-debounce';
import productServices from '../../services/productService';

export const SearchBar = ({ placeholder = '', className = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ── Llama a la API con debounce 300ms (evita llamadas en cada tecla)
  const fetchResults = useDebouncedCallback(async (q) => {
    if (!q || q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [data] = await productServices.searchProducts({ q });
    setResults(data || []);
    setLoading(false);
    setOpen(true);
  }, 300);

  // ── Actualiza el estado visual del input con throttle 50ms (siempre fluido)
  const handleChange = useThrottledCallback((value) => {
    setInputValue(value);
    if (!value) {
      setResults([]);
      setOpen(false);
      setLoading(false);
    } else {
      setLoading(true);
      fetchResults(value);
    }
  }, 50);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setOpen(false);
      navigate(`/products?q=${encodeURIComponent(inputValue.trim())}`);
    }
    if (e.key === 'Escape') setOpen(false);
  };

  const handleSelect = (product) => {
    setOpen(false);
    setInputValue('');
    navigate(`/product/${product.id}`);
  };
  const handleClear = () => {
    setInputValue('');
    setResults([]);
    setOpen(false);
    setLoading(false);
  };

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 text-muted" />
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full h-10 pl-10 pr-9 rounded-full border border-main bg-[rgb(var(--color-bg-input))] text-main placeholder:text-faint text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
        />
        {/* Spinner o botón limpiar */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-muted animate-spin" />
          ) : inputValue ? (
            <button
              onClick={handleClear}
              className="text-muted hover:text-main transition"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown de resultados */}
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-main border border-main rounded-2xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.length === 0 && !loading ? (
            <p className="text-sm text-muted text-center py-4">
              {t('search.noResults')} "{inputValue}"
            </p>
          ) : (
            <>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition text-left"
                >
                  {/* Miniatura */}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-main"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-muted flex-shrink-0" />
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-main truncate">
                      {product.name}
                    </p>
                    {/* Breadcrumb: Categoría > Subcategoría > Item */}
                    <p className="text-xs text-muted truncate">
                      {[
                        product.category_name,
                        product.subcategory_name,
                        product.item_name,
                      ]
                        .filter(Boolean)
                        .join(' › ')}
                    </p>
                  </div>
                  {/* Precio */}
                  <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 flex-shrink-0">
                    {product.discount > 0 ? (
                      <span className="flex flex-col items-end">
                        <span className="line-through text-xs text-muted font-normal">
                          {product.price.toFixed(2)}€
                        </span>
                        {(product.price * (1 - product.discount / 100)).toFixed(
                          2,
                        )}
                        €
                      </span>
                    ) : (
                      `${product.price.toFixed(2)}€`
                    )}
                  </span>
                </button>
              ))}

              {/* Pie: ver todos los resultados */}
              <button
                onClick={() => {
                  setOpen(false);
                  navigate(
                    `/products?q=${encodeURIComponent(inputValue.trim())}`,
                  );
                }}
                className="w-full text-center text-xs text-violet-600 dark:text-violet-400 font-semibold py-2.5 border-t border-main hover:bg-muted transition"
              >
                {t('search.seeAll', { query: inputValue })}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
