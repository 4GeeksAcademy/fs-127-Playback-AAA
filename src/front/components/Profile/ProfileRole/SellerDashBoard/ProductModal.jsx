import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import productServices from "../../../../services/productService";

// ─── Opciones de condición ────────────────────────────────────────────────────
const CONDITIONS = ["new", "used", "refurbished", "broken"];

// ─── Formulario vacío por defecto ─────────────────────────────────────────────
const EMPTY_FORM = {
  name: "",
  description: "",
  characteristics: "",
  price: "",
  stock: "",
  height: "",
  width: "",
  length: "",
  weight: "",
  discount: "",
  condition: "new",
  item_id: "",
};

const ProductModal = ({ product, token, onClose, onSaved }) => {
  const { t, i18n } = useTranslation();

  // ─── Estado del formulario ──────────────────────────────────────────────────
  const [form, setForm] = useState(
    product
      ? {
          ...product,
          name:
            typeof product.name === "object"
              ? product.name?.es || ""
              : product.name || "",
          description:
            typeof product.description === "object"
              ? product.description?.es || ""
              : product.description || "",
          characteristics:
            typeof product.characteristics === "object"
              ? product.characteristics?.es || ""
              : product.characteristics || "",
          height: product.height || "",
          width:  product.width  || "",
          length: product.length || "",
          weight: product.weight || "",
          discount: product.discount ?? 0,
          image_url: product.image_url || "",
          item_id: product.item_id ? String(product.item_id) : "",
        }
      : EMPTY_FORM,
  );

  // ─── Estado de imagen principal ─────────────────────────────────────────────
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.image_url || null);
  const [imageError, setImageError] = useState("");

  // ─── Estado de imágenes adicionales ────────────────────────────────────────
  const [otherImageFiles, setOtherImageFiles] = useState([]);
  const [otherPreviews, setOtherPreviews] = useState(product?.other_image_url || []);
  const [otherImageError, setOtherImageError] = useState("");

  // ─── Estado de carga y errores ──────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ─── Estado de categorías ───────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedSub, setSelectedSub] = useState("");

  useEffect(() => {
    productServices.getCategories().then(([data, err]) => {
      if (!err) setCategories(data);
    });
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

  const catSeleccionada = categories.find((c) => c.id === parseInt(selectedCat));
  const subcategories = catSeleccionada?.subcategories || [];
  const subSeleccionada = subcategories.find((s) => s.id === parseInt(selectedSub));
  const items = subSeleccionada?.items || [];

  const nameOf = (val) =>
    typeof val === "object" ? val?.[i18n.language] || val?.es || val?.en : val;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return setImageError(t("dashboard.products.modal.formatError"));
    if (file.size > 2 * 1024 * 1024)
      return setImageError(t("dashboard.products.modal.sizeError"));
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleOtherImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setOtherImageError("");
    const invalid = files.find(
      (f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    if (invalid) return setOtherImageError(t("dashboard.products.modal.formatError"));
    const tooBig = files.find((f) => f.size > 2 * 1024 * 1024);
    if (tooBig) return setOtherImageError(t("dashboard.products.modal.sizeError"));
    setOtherImageFiles(files);
    setOtherPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeOtherImage = (index) => {
    setOtherImageFiles((prev) => prev.filter((_, i) => i !== index));
    setOtherPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name",            form.name);
    fd.append("description",     form.description);
    fd.append("characteristics", form.characteristics);
    fd.append("price",           form.price);
    fd.append("stock",           form.stock);
    fd.append("item_id",         form.item_id);
    fd.append("condition",       form.condition);
    fd.append("discount",        form.discount || 0);
    if (form.height) fd.append("height", form.height);
    if (form.width)  fd.append("width",  form.width);
    if (form.length) fd.append("length", form.length);
    if (form.weight) fd.append("weight", form.weight);
    if (imageFile)   fd.append("imagen", imageFile);
    otherImageFiles.forEach((img) => fd.append("other_images", img));
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile && !preview) {
      setImageError(t("dashboard.products.modal.imageRequired"));
      return;
    }

    if (!selectedCat || !selectedSub || !form.item_id) {
      setError(t("dashboard.products.modal.selectItem"));
      return;
    }

    setSaving(true);
    setError(null);

    const [, err] = product
      ? await productServices.updateProduct(product.id, buildFormData(), token)
      : await productServices.createProduct(buildFormData(), token);

    setSaving(false);
    if (err) return setError(err);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-main rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">

        {/* Cabecera */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-main">
            {product
              ? t("dashboard.products.modal.editTitle")
              : t("dashboard.products.modal.newTitle")}
          </h2>
          <button onClick={onClose} className="text-faint hover:text-main text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* ── Imagen principal ── */}
          <div className="flex flex-col items-center space-y-2">
            {preview ? (
              <img src={preview} className="w-24 h-24 rounded-xl object-cover border border-main" />
            ) : (
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-main flex items-center justify-center text-xs text-faint">
                {t("dashboard.products.modal.noImage")}
              </div>
            )}
            <label className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer transition text-sm">
              {preview
                ? t("dashboard.products.modal.changeImage")
                : t("dashboard.products.modal.uploadImage")}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            {imageError && <p className="text-xs text-red-500">{imageError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">

            {/* Nombre */}
            <div className="col-span-2">
              <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.name")}</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input" />
            </div>

            {/* Categoría */}
            <div className="col-span-2">
              <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.category")}</label>
              <select
                value={selectedCat}
                onChange={(e) => { setSelectedCat(e.target.value); setSelectedSub(""); setForm({ ...form, item_id: "" }); }}
                required className="input"
              >
                <option value="">{t("dashboard.products.modal.selectCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>{nameOf(c.name)}</option>
                ))}
              </select>
            </div>

            {/* Subcategoría */}
            {selectedCat && (
              <div className="col-span-2">
                <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.subcategory")}</label>
                <select
                  value={selectedSub}
                  onChange={(e) => { setSelectedSub(e.target.value); setForm({ ...form, item_id: "" }); }}
                  required className="input"
                >
                  <option value="">{t("dashboard.products.modal.selectSubcategory")}</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={String(s.id)}>{nameOf(s.name)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Item */}
            {selectedSub && (
              <div className="col-span-2">
                <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.item")}</label>
                <select name="item_id" value={form.item_id} onChange={handleChange} required className="input">
                  <option value="">{t("dashboard.products.modal.selectItem")}</option>
                  {items.map((i) => (
                    <option key={i.id} value={String(i.id)}>{nameOf(i.name)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Precio */}
            <div>
              <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.price")}</label>
              <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required className="input" />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.stock")}</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} required className="input" />
            </div>

            {/* Descuento */}
            <div>
              <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.discount")}</label>
              <input name="discount" type="number" step="0.01" value={form.discount} onChange={handleChange} className="input" />
            </div>

            {/* Peso */}
            <div>
              <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.weight")}</label>
              <input name="weight" type="number" step="0.01" value={form.weight} onChange={handleChange} required className="input" />
            </div>

            {/* Condición */}
            <div className="col-span-2">
              <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.condition")}</label>
              <select name="condition" value={form.condition} onChange={handleChange} className="input">
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{t(`enums.productCondition.${c}`)}</option>
                ))}
              </select>
            </div>

            {/* ── Dimensiones (cm) ── */}
            <div className="col-span-2">
              <label className="block text-xs text-faint mb-2">
                {t("dashboard.products.modal.dimensions")} <span className="text-faint/60">(cm)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.height")}</label>
                  <input name="height" type="number" step="0.1" value={form.height} onChange={handleChange} required className="input" />
                </div>
                <div>
                  <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.width")}</label>
                  <input name="width" type="number" step="0.1" value={form.width} onChange={handleChange} required className="input" />
                </div>
                <div>
                  <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.length")}</label>
                  <input name="length" type="number" step="0.1" value={form.length} onChange={handleChange} required className="input" />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="col-span-2">
              <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.description")}</label>
              <textarea
                name="description" rows={3} value={form.description}
                onChange={handleChange} required className="input resize-none"
              />
            </div>

            {/* Características */}
            <div className="col-span-2">
              <label className="block text-xs text-faint mb-1">{t("dashboard.products.modal.characteristics")}</label>
              <textarea
                name="characteristics" rows={3} value={form.characteristics}
                onChange={handleChange} required className="input resize-none"
              />
            </div>

          </div>

          {/* ── Imágenes adicionales ── */}
          <div className="rounded-xl border border-main p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-main">{t("dashboard.products.modal.otherImages")}</p>
                <p className="text-xs text-faint mt-0.5">
                  {t("dashboard.products.modal.optional")} · JPG, PNG, WEBP · máx. 2 MB
                </p>
              </div>
              <label className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg cursor-pointer transition text-xs font-medium shrink-0">
                + {t("dashboard.products.modal.addImages")}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleOtherImagesChange} />
              </label>
            </div>

            {otherPreviews.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {otherPreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={src} className="w-full h-full rounded-lg object-cover border border-main" />
                    <button
                      type="button"
                      onClick={() => removeOtherImage(i)}
                      className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg"
                    >✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-main/40 rounded-lg py-5 flex flex-col items-center justify-center gap-1 text-faint">
                <span className="text-2xl">🖼️</span>
                <p className="text-xs">{t("dashboard.products.modal.noOtherImages")}</p>
              </div>
            )}

            {otherImageError && <p className="text-xs text-red-500">{otherImageError}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary py-2 px-4 text-sm">
              {t("seller.cancel")}
            </button>
            <button type="submit" disabled={saving} className="btn-primary py-2 px-5 text-sm">
              {saving ? t("dashboard.products.modal.saving") : t("dashboard.products.modal.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;