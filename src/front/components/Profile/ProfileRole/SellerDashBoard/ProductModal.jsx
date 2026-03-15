import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import productServices from '../../../../services/productService';

const CONDITIONS = ['new', 'used', 'refurbished', 'broken'];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  size: '',
  weight: '',
  discount: '',
  condition: 'new',
  item_id: '',
};

const ProductModal = ({ product, token, onClose, onSaved }) => {
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState(
    product
      ? {
          ...product,
          name:
            typeof product.name === 'object'
              ? product.name?.es || ''
              : product.name || '',
          description:
            typeof product.description === 'object'
              ? product.description?.es || ''
              : product.description || '',
          size: product.size || '',
          weight: product.weight || '',
          discount: product.discount ?? 0,
          image_url: product.image_url || '',
          item_id: product.item_id ? String(product.item_id) : '',
        }
      : EMPTY_FORM,
  );

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.image_url || null);
  const [imageError, setImageError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSub, setSelectedSub] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!product || !categories.length) return;
    for (const cat of categories) {
      for (const sub of cat.subcategories || []) {
        const item = (sub.items || []).find((i) => i.slug === product.item);
        if (item) {
          setSelectedCat(String(cat.id));
          setSelectedSub(String(sub.id));
          setForm((prev) => ({ ...prev, item_id: String(item.id) }));
          return;
        }
      }
    }
  }, [categories]);

  const catSeleccionada = categories.find(
    (c) => c.id === parseInt(selectedCat),
  );
  const subcategories = catSeleccionada?.subcategories || [];
  const subSeleccionada = subcategories.find(
    (s) => s.id === parseInt(selectedSub),
  );
  const items = subSeleccionada?.items || [];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      return setImageError(t('dashboard.products.modal.formatError'));
    if (file.size > 2 * 1024 * 1024)
      return setImageError(t('dashboard.products.modal.sizeError'));
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ── Construye el FormData con los campos comunes
  const buildFormData = () => {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    fd.append('price', form.price);
    fd.append('stock', form.stock);
    fd.append('item_id', form.item_id);
    fd.append('condition', form.condition);
    fd.append('discount', form.discount || 0);
    if (form.size) fd.append('size', form.size);
    if (form.weight) fd.append('weight', form.weight);
    if (imageFile) fd.append('imagen', imageFile);
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let err;

    if (product) {
      // Editar — si hay imagen nueva usamos FormData, si no JSON
      if (imageFile) {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/product/${product.id}`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: buildFormData(),
          },
        );
        const data = await res.json();
        err = res.ok ? null : data.description || 'Error al actualizar';
      } else {
        const [, error] = await productServices.updateProduct(
          product.id,
          {
            name: form.name,
            description: form.description,
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
            size: form.size,
            weight: parseFloat(form.weight) || null,
            discount: parseFloat(form.discount) || 0,
            condition: form.condition,
            item_id: parseInt(form.item_id),
            image_url: form.image_url,
          },
          token,
        );
        err = error;
      }
    } else {
      // Crear
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/product`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: buildFormData(),
        },
      );
      const data = await res.json();
      err = res.ok ? null : data.description || 'Error al crear producto';
    }

    setSaving(false);
    if (err) return setError(err);
    onSaved();
  };

  // Respeta el idioma activo con fallback
  const nameOf = (val) =>
    typeof val === 'object' ? val?.[i18n.language] || val?.es || val?.en : val;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-main rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-main">
            {product
              ? t('dashboard.products.modal.editTitle')
              : t('dashboard.products.modal.newTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-faint hover:text-main text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col items-center space-y-2">
            {preview && (
              <img
                src={preview}
                className="w-24 h-24 rounded-xl object-cover border border-main"
              />
            )}
            <label className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer transition text-sm">
              {preview
                ? t('dashboard.products.modal.changeImage')
                : t('dashboard.products.modal.uploadImage')}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            {imageError && <p className="text-xs text-red-500">{imageError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-faint mb-1">
                {t('dashboard.products.modal.name')}
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-faint mb-1">
                {t('dashboard.products.modal.category')}
              </label>
              <select
                value={selectedCat}
                onChange={(e) => {
                  setSelectedCat(e.target.value);
                  setSelectedSub('');
                  setForm({ ...form, item_id: '' });
                }}
                className="input"
              >
                <option value="">
                  {t('dashboard.products.modal.selectCategory')}
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {nameOf(c.name)}
                  </option>
                ))}
              </select>
            </div>

            {selectedCat && (
              <div className="col-span-2">
                <label className="block text-xs text-faint mb-1">
                  {t('dashboard.products.modal.subcategory')}
                </label>
                <select
                  value={selectedSub}
                  onChange={(e) => {
                    setSelectedSub(e.target.value);
                    setForm({ ...form, item_id: '' });
                  }}
                  className="input"
                >
                  <option value="">
                    {t('dashboard.products.modal.selectSubcategory')}
                  </option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {nameOf(s.name)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedSub && (
              <div className="col-span-2">
                <label className="block text-xs text-faint mb-1">
                  {t('dashboard.products.modal.item')}
                </label>
                <select
                  name="item_id"
                  value={form.item_id}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">
                    {t('dashboard.products.modal.selectItem')}
                  </option>
                  {items.map((i) => (
                    <option key={i.id} value={String(i.id)}>
                      {nameOf(i.name)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-faint mb-1">
                {t('dashboard.products.modal.price')}
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs text-faint mb-1">
                {t('dashboard.products.modal.stock')}
              </label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs text-faint mb-1">
                {t('dashboard.products.modal.discount')}
              </label>
              <input
                name="discount"
                type="number"
                step="0.01"
                value={form.discount}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs text-faint mb-1">
                {t('dashboard.products.modal.size')}
              </label>
              <input
                name="size"
                value={form.size}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs text-faint mb-1">
                {t('dashboard.products.modal.weight')}
              </label>
              <input
                name="weight"
                type="number"
                step="0.01"
                value={form.weight}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs text-faint mb-1">
                {t('dashboard.products.modal.condition')}
              </label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="input"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {t(`enums.productCondition.${c}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-faint mb-1">
                {t('dashboard.products.modal.description')}
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="input resize-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">❌ {error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2 px-4 text-sm"
            >
              {t('seller.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary py-2 px-5 text-sm"
            >
              {saving
                ? t('dashboard.products.modal.saving')
                : t('dashboard.products.modal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
