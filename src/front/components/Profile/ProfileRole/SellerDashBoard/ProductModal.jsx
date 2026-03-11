import { useState,useEffect } from "react";
import productServices from "../../../../services/productService";


const CONDITIONS = ["new", "used", "refurbished", "broken"];
const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400";

const EMPTY_FORM = {
  name: "", description: "", price: "", stock: "",
  size: "", weight: "", discount: "", condition: "new", item_id: "",
};

const ProductModal = ({ product, token, onClose, onSaved }) => {
 const [form, setForm] = useState(
  product
    ? {
        ...product,
        name:        product.name        || "",
        description: product.description || "",
        size:        product.size        || "",
        weight:      product.weight      || "",
        discount:    product.discount    ?? 0,
        image_url:   product.image_url   || "",
      }
    : EMPTY_FORM
);
  const [imageFile, setImageFile]   = useState(null);
  const [preview, setPreview]       = useState(product?.image_url || null);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);

  // ── Categorías en cascada ─────────────────────────
  const [categories, setCategories]       = useState([]);
  const [selectedCat, setSelectedCat]     = useState("");
  const [selectedSub, setSelectedSub]     = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

const catSeleccionada = categories.find((c) => c.slug === selectedCat);
const subcategories   = catSeleccionada?.subcategories || [];

const subSeleccionada = subcategories.find((s) => s.slug === selectedSub);
const items           = subSeleccionada?.items || [];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Imagen ────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return setImageError("Usa JPG, PNG o WEBP.");
    if (file.size > 2 * 1024 * 1024)
      return setImageError("Máximo 2MB.");
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ── Guardar ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let err;

  if (product) {
  const [, error] = await productServices.updateProduct(product.id, {
    name:        form.name,
    description: form.description,
    price:       parseFloat(form.price),
    stock:       parseInt(form.stock),
    size:        form.size,
    weight:      parseFloat(form.weight) || null,
    discount:    parseFloat(form.discount) || 0,
    condition:   form.condition,
    item_id:     parseInt(form.item_id),
    image_url:   form.image_url,
  });
  err = error;
} else {
      const formData = new FormData();
      formData.append("name",        form.name);
      formData.append("description", form.description);
      formData.append("price",       form.price);
      formData.append("stock",       form.stock);
      formData.append("item_id",     form.item_id);
      formData.append("condition",   form.condition);
      if (form.size)     formData.append("size",     form.size);
      if (form.weight)   formData.append("weight",   form.weight);
      if (form.discount) formData.append("discount", form.discount);
      if (imageFile)     formData.append("imagen",   imageFile);

      const res  = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/product`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      err = res.ok ? null : (data.description || "Error al crear producto");
    }

    setSaving(false);
    if (err) return setError(err);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">{product ? "Editar producto" : "Nuevo producto"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Imagen */}
          <div className="flex flex-col items-center space-y-2">
            {preview && <img src={preview} className="w-24 h-24 rounded-xl object-cover border border-gray-200" />}
            <label className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer transition text-sm">
              {preview ? "Cambiar imagen" : "Subir imagen"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            {imageError && <p className="text-xs text-red-500">{imageError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">

            {/* Nombre */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Nombre</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
            </div>

            {/* Categoría en cascada */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Categoría</label>
              <select value={selectedCat} onChange={(e) => { setSelectedCat(e.target.value); setSelectedSub(""); setForm({ ...form, item_id: "" }); }} className={inputClass}>
                <option value="">Selecciona categoría</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>

            {selectedCat && (
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Subcategoría</label>
                <select value={selectedSub} onChange={(e) => { setSelectedSub(e.target.value); setForm({ ...form, item_id: "" }); }} className={inputClass}>
                  <option value="">Selecciona subcategoría</option>
                  {subcategories.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                </select>
              </div>
            )}

            {selectedSub && (
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Item</label>
                <select name="item_id" value={form.item_id} onChange={handleChange} required className={inputClass}>
                  <option value="">Selecciona item</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            )}

            {/* Precio y stock */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Precio (€)</label>
              <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Stock</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Descuento (%)</label>
              <input name="discount" type="number" step="0.01" value={form.discount} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Talla</label>
              <input name="size" value={form.size} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Peso (kg)</label>
              <input name="weight" type="number" step="0.01" value={form.weight} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Condición</label>
              <select name="condition" value={form.condition} onChange={handleChange} className={inputClass}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Descripción */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Descripción</label>
              <textarea name="description" rows={3} value={form.description} onChange={handleChange} className={`${inputClass} resize-none`} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">❌ {error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm hover:text-gray-800 transition">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition">
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;