import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Check } from "lucide-react";
import useGlobalReducer from "../../../../hooks/useGlobalReducer";
import productServices from "../../../../services/productService";
import { getMyProductsService } from "../../../../services/sellerService";
import ProductModal from "./ProductModal";

const ProductsTab = () => {
  const { store } = useGlobalReducer();
  const { t } = useTranslation();
  const token = store.token;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [updatingStock, setUpdatingStock] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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
    if (!confirm(t("dashboard.products.confirmDelete"))) return;
    setDeleting(id);
    await productServices.deleteProduct(id);
    setDeleting(null);
    loadProducts();
    showToast(t("dashboard.products.deleted"));
  };

  const handleStockChange = async (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    if (newStock === product.stock) return;

    setUpdatingStock(product.id);

    const [, error] = await productServices.updateProduct(
      product.id,
      { stock: newStock },
      token
    );

    if (error) {
      showToast(t("dashboard.products.stockError"), "error");
    } else {
      setProducts(products.map((p) =>
        p.id === product.id ? { ...p, stock: newStock } : p
      ));
    }

    setUpdatingStock(null);
  };

  if (loading)
    return (
      <p className="text-center text-sm text-faint mt-10 animate-pulse">
        {t("dashboard.products.loading")}
      </p>
    );

  return (
    <div className="pt-6 space-y-4">

      {toast && (
        <div
          className={`fixed bottom-6 right-6 text-white text-sm px-5 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-600 dark:bg-red-500"
              : "bg-stone-900 dark:bg-stone-100 dark:text-stone-900"
          }`}
        >
          {toast.type === "error" ? <AlertCircle size={15} /> : <Check size={15} />}
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted">
          {products.length} {t("dashboard.products.count")}
        </p>
        <button
          onClick={() => setModal("new")}
          className="btn-primary py-2 px-4 text-sm"
        >
          {t("dashboard.products.newProduct")}
        </button>
      </div>

      <div className="border border-main rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-subtle text-faint text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">{t("dashboard.products.table.product")}</th>
              <th className="text-right px-4 py-3">{t("dashboard.products.table.price")}</th>
              <th className="text-center px-4 py-3">{t("dashboard.products.table.stock")}</th>
              <th className="text-right px-4 py-3">{t("dashboard.products.table.condition")}</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--color-border))]">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-subtle transition">
                <td className="px-4 py-3 font-medium text-main">
                  <div className="flex items-center gap-3">
                    {p.image_url && (
                      <img src={p.image_url} className="w-8 h-8 rounded object-cover" />
                    )}
                    {p.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-main">
                  €{p.price}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleStockChange(p, -1)}
                      disabled={updatingStock === p.id || p.stock === 0}
                      className="w-6 h-6 border border-main rounded flex items-center justify-center text-muted hover:bg-subtle disabled:opacity-30 text-xs"
                    >
                      −
                    </button>
                    <span
                      className={`w-8 text-center font-medium ${
                        p.stock === 0 ? "text-red-500" : "text-main"
                      }`}
                    >
                      {updatingStock === p.id ? "…" : p.stock}
                    </span>
                    <button
                      onClick={() => handleStockChange(p, 1)}
                      disabled={updatingStock === p.id}
                      className="w-6 h-6 border border-main rounded flex items-center justify-center text-muted hover:bg-subtle disabled:opacity-30 text-xs"
                    >
                      +
                    </button>
                  </div>
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
                    {t("dashboard.products.edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-50"
                  >
                    {deleting === p.id ? "…" : t("dashboard.products.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-faint text-sm py-10">
            {t("dashboard.products.noProducts")}
          </p>
        )}
      </div>

      {modal && (
        <ProductModal
          product={modal === "new" ? null : modal}
          token={token}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            loadProducts();
            showToast(t("dashboard.products.saved"));
          }}
        />
      )}
    </div>
  );
};

export default ProductsTab;