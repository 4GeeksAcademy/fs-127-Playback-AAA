import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useGlobalReducer from '../../../../hooks/useGlobalReducer';
import productServices from '../../../../services/productService';
import { getMyProductsService } from '../../../../services/sellerService';
import ProductModal from './ProductModal';

const ProductsTab = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const token = store.token;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadProducts = async () => {
    try {
      const data = await getMyProductsService(token);
      setProducts(data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm(t('dashboard.products.confirmDelete'))) return;
    setDeleting(id);
    await productServices.deleteProduct(id);
    setDeleting(null);
    loadProducts();
  };

  if (loading)
    return (
      <p className="text-center text-sm text-faint mt-10 animate-pulse">
        {t('dashboard.products.loading')}
      </p>
    );

  return (
    <div className="pt-6 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted">
          {products.length} {t('dashboard.products.count')}
        </p>
        <button
          onClick={() => setModal('new')}
          className="btn-primary py-2 px-4 text-sm"
        >
          {t('dashboard.products.newProduct')}
        </button>
      </div>

      <div className="border border-main rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-subtle text-faint text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">
                {t('dashboard.products.table.product')}
              </th>
              <th className="text-right px-4 py-3">
                {t('dashboard.products.table.price')}
              </th>
              <th className="text-right px-4 py-3">
                {t('dashboard.products.table.stock')}
              </th>
              <th className="text-right px-4 py-3">
                {t('dashboard.products.table.condition')}
              </th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--color-border))]">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-subtle transition">
                <td className="px-4 py-3 font-medium text-main">
                  <div className="flex items-center gap-3">
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    {p.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-main">
                  €{p.price}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      p.stock === 0 ? 'text-red-500 font-semibold' : 'text-sub'
                    }
                  >
                    {p.stock === 0 ? t('dashboard.products.noStock') : p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted border border-main">
                    {t(`enums.productCondition.${p.condition}`, {
                      defaultValue: p.condition,
                    })}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() => setModal(p)}
                    className="text-xs text-purple-500 hover:text-purple-700 font-medium"
                  >
                    {t('dashboard.products.edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-50"
                  >
                    {deleting === p.id ? '…' : t('dashboard.products.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-faint text-sm py-10">
            {t('dashboard.products.noProducts')}
          </p>
        )}
      </div>

      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          token={token}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
};

export default ProductsTab;
