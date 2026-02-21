import { useState } from "react";



//Para instalar cloudinari en otra pagina pondremos el import 
//import { CloudinaryBotonProduct } from "../components/CloudinaryBotonProduct";
//y pasaremos tambien el input y lo que queremos modificar 
//<CloudinaryBotonProduct onProductoCreado={(p) => setProducts(prev => [...prev, p])} />
export const CloudinaryBotonProduct = ({ onProductoCreado }) => {



    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: "", price: "", description: "" });
    const [imagenFile, setImagenFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [subiendo, setSubiendo] = useState(false);
    const [mensajeForm, setMensajeForm] = useState("");

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        setImagenFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmitProducto = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price) {
            setMensajeForm("Nombre y precio son obligatorios");
            return;
        }

        const data = new FormData();
        data.append("name", formData.name);
        data.append("price", formData.price);
        data.append("description", formData.description);
        data.append("category_id", 5);
        if (imagenFile) data.append("imagen", imagenFile);

        try {
            setSubiendo(true);
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/productos`, {
                method: "POST",
                body: data
            });
            if (!res.ok) throw new Error("Error al crear producto");
            const nuevoProducto = await res.json();
            if (onProductoCreado) onProductoCreado(nuevoProducto); // 👈 avisa al padre
            setMensajeForm("✅ Producto subido con éxito");
            setFormData({ name: "", price: "", description: "" });
            setImagenFile(null);
            setPreview(null);
            setShowForm(false);
        } catch (err) {
            setMensajeForm("❌ Error al subir el producto");
        } finally {
            setSubiendo(false);
        }
    };


    return (
        <>
            {/* BOTÓN FLOTANTE PARA ABRIR FORMULARIO */}
            < button
                onClick={() => setShowForm(!showForm)}
                className="fixed bottom-8 right-8 bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-3 rounded-full shadow-lg z-50 transition-all"
            >
                {showForm ? "✕ Cerrar" : "+ Subir producto"}
            </button >

            {/* FORMULARIO */}
            {
                showForm && (
                    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center px-4">
                        <div className="bg-white p-6 w-full max-w-md rounded-xl shadow-xl">
                            <h3 className="text-lg font-bold mb-4">Subir nuevo producto</h3>
                            <form onSubmit={handleSubmitProducto} className="flex flex-col gap-3">
                                <input
                                    type="text"
                                    placeholder="Nombre del producto"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Precio (€)"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                                <textarea
                                    placeholder="Descripción (opcional)"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                                    rows={3}
                                />
                                <input type="file" accept="image/*" onChange={handleImagenChange} className="text-sm" />
                                {preview && <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-lg" />}
                                {mensajeForm && <p className="text-sm text-center">{mensajeForm}</p>}
                                <button
                                    type="submit"
                                    disabled={subiendo}
                                    className="bg-stone-800 hover:bg-stone-700 text-white font-bold py-2 rounded-lg text-sm transition-all"
                                >
                                    {subiendo ? "Subiendo..." : "Publicar producto"}
                                </button>
                            </form>
                        </div>
                    </div>

                )
            }

        </>
    );
};

