import { useState } from "react";
import { CheckCircle, Mail, MessageSquare, User } from "lucide-react";

const TOPICS = [
  "Problema con un pedido",
  "Devolución o reembolso",
  "Problema con un producto",
  "Cuenta o acceso",
  "Conviértete en vendedor",
  "Otro",
];

const ContactPage = () => {
  const [form, setForm]       = useState({ name: "", email: "", topic: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "El nombre es obligatorio";
    if (!form.email.trim())   e.email   = "El email es obligatorio";
    if (!form.topic)          e.topic   = "Selecciona un motivo";
    if (!form.message.trim()) e.message = "Escribe tu mensaje";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // TODO: conectar con backend/email
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  };

  if (success) return (
    <div className="min-h-screen bg-subtle flex items-center justify-center px-4">
      <div className="bg-main rounded-2xl border border-main p-10 text-center max-w-md w-full">
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#EAF3DE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle size={28} color="#3B6D11" />
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "8px" }}>
          Mensaje enviado
        </h2>
        <p style={{ fontSize: "13px", color: "var(--color-muted)", marginBottom: "24px" }}>
          Hemos recibido tu mensaje. Te responderemos en un plazo de 24-48 horas laborables.
        </p>
        <a href="/"
          style={{ background: "#534AB7", color: "white", padding: "9px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: "500", textDecoration: "none", display: "inline-block" }}>
          Volver al inicio
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-subtle">

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #534AB7 0%, #7F77DD 100%)", padding: "48px 16px" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "10px" }}>
            Contacta con nosotros
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)" }}>
            Estamos aquí para ayudarte con cualquier duda
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-3 gap-6 mb-8">

          {/* Info cards */}
          {[
            { icon: <Mail size={20} color="#534AB7" />, title: "Email", desc: "soporte@playback.com", sub: "Respuesta en 24-48h" },
            { icon: <MessageSquare size={20} color="#534AB7" />, title: "Chat", desc: "Lunes a Viernes", sub: "9:00 - 18:00h" },
            { icon: <User size={20} color="#534AB7" />, title: "Vendedores", desc: "vendedores@playback.com", sub: "Para consultas de tienda" },
          ].map((card, i) => (
            <div key={i} className="bg-main rounded-xl border border-main p-4 flex items-start gap-3">
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "2px" }}>{card.title}</p>
                <p style={{ fontSize: "12px", color: "#534AB7", marginBottom: "1px" }}>{card.desc}</p>
                <p style={{ fontSize: "11px", color: "var(--color-muted)" }}>{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario */}
        <div className="bg-main rounded-xl border border-main p-6">
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "20px" }}>
            Envíanos un mensaje
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted)", display: "block", marginBottom: "6px" }}>
                  Nombre
                </label>
                <input
                  name="name" value={form.name} onChange={handleChange}
                  placeholder="Tu nombre"
                  className="input focus:ring-2 focus:ring-purple-500"
                />
                {errors.name && <p style={{ fontSize: "11px", color: "#A32D2D", marginTop: "4px" }}>{errors.name}</p>}
              </div>
              <div>
                <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted)", display: "block", marginBottom: "6px" }}>
                  Email
                </label>
                <input
                  name="email" value={form.email} onChange={handleChange}
                  placeholder="tu@email.com" type="email"
                  className="input focus:ring-2 focus:ring-purple-500"
                />
                {errors.email && <p style={{ fontSize: "11px", color: "#A32D2D", marginTop: "4px" }}>{errors.email}</p>}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted)", display: "block", marginBottom: "6px" }}>
                Motivo de contacto
              </label>
              <select
                name="topic" value={form.topic} onChange={handleChange}
                className="input focus:ring-2 focus:ring-purple-500"
                style={{ appearance: "none" }}
              >
                <option value="">Selecciona un motivo...</option>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.topic && <p style={{ fontSize: "11px", color: "#A32D2D", marginTop: "4px" }}>{errors.topic}</p>}
            </div>

            <div>
              <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted)", display: "block", marginBottom: "6px" }}>
                Mensaje
              </label>
              <textarea
                name="message" value={form.message} onChange={handleChange}
                placeholder="Cuéntanos cómo podemos ayudarte..."
                rows={5}
                className="input resize-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.message && <p style={{ fontSize: "11px", color: "#A32D2D", marginTop: "4px" }}>{errors.message}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </button>

            <p style={{ fontSize: "11px", color: "var(--color-muted)", textAlign: "center" }}>
              Al enviar este formulario aceptas nuestra política de privacidad.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;