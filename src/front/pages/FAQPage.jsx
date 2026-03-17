import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQS = [
  {
    category: "Envíos",
    items: [
      {
        q: "¿Cuánto tarda en llegar mi pedido?",
        a: "Los pedidos se procesan en 1-2 días laborables. El envío estándar tarda entre 3-5 días laborables en la península. Para Canarias, Baleares y Ceuta puede tardar entre 5-8 días.",
      },
      {
        q: "¿Cuánto cuesta el envío?",
        a: "El envío estándar tiene un coste de 3,99€. Los pedidos superiores a 50€ tienen envío gratuito. Para envíos urgentes (24-48h) el coste es de 6,99€.",
      },
      {
        q: "¿Envían a toda España?",
        a: "Sí, enviamos a toda España incluyendo Canarias, Baleares, Ceuta y Melilla. También realizamos envíos internacionales a países de la UE.",
      },
      {
        q: "¿Puedo hacer seguimiento de mi pedido?",
        a: "Sí, una vez que tu pedido sea enviado recibirás un email con el número de seguimiento y un enlace para rastrear tu paquete en tiempo real.",
      },
    ],
  },
  {
    category: "Devoluciones",
    items: [
      {
        q: "¿Puedo devolver un producto?",
        a: "Aceptamos devoluciones en los 14 días siguientes a la recepción del pedido. El producto debe estar en el mismo estado en que fue recibido, con su embalaje original.",
      },
      {
        q: "¿Cómo proceso una devolución?",
        a: "Accede a tu perfil → Pedidos, selecciona el pedido y pulsa 'Incidencia'. Nuestro equipo te contactará en 24-48h para gestionar la devolución.",
      },
      {
        q: "¿Cuándo recibiré el reembolso?",
        a: "Una vez recibamos el producto devuelto y confirmemos su estado, procesaremos el reembolso en 3-5 días laborables. El tiempo hasta tu cuenta depende de tu banco.",
      },
    ],
  },
  {
    category: "Productos",
    items: [
      {
        q: "¿Los productos son originales?",
        a: "Sí, todos nuestros productos son originales y auténticos. Cada vendedor está verificado y los productos pasan por nuestro proceso de validación antes de publicarse.",
      },
      {
        q: "¿Qué significa 'Reacondicionado'?",
        a: "Los productos reacondicionados han sido revisados, reparados y probados para garantizar su correcto funcionamiento. Se incluye descripción detallada de su estado.",
      },
      {
        q: "¿Puedo vender mis productos en Playback?",
        a: "¡Claro! Puedes convertirte en vendedor desde tu perfil. El proceso de verificación tarda entre 24-48h. Una vez aprobado podrás publicar tus productos retro.",
      },
    ],
  },
  {
    category: "Pagos",
    items: [
      {
        q: "¿Qué métodos de pago aceptáis?",
        a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) y pagos a través de Stripe. Todos los pagos son seguros y están cifrados.",
      },
      {
        q: "¿Es seguro pagar en Playback?",
        a: "Sí. Utilizamos Stripe como pasarela de pago, que cumple con los más altos estándares de seguridad PCI DSS. Nunca almacenamos datos de tu tarjeta.",
      },
    ],
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-main"
      style={{ borderBottom: "0.5px solid var(--border-main, #e5e7eb)" }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-left py-4 gap-4"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--color-text-primary)" }}>
          {q}
        </span>
        {open
          ? <ChevronUp size={16} style={{ color: "#534AB7", flexShrink: 0 }} />
          : <ChevronDown size={16} style={{ color: "var(--color-muted)", flexShrink: 0 }} />
        }
      </button>
      {open && (
        <p style={{ fontSize: "13px", color: "var(--color-muted)", paddingBottom: "16px", lineHeight: "1.65" }}>
          {a}
        </p>
      )}
    </div>
  );
};

const FAQPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-subtle">

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #534AB7 0%, #7F77DD 100%)", padding: "48px 16px" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "10px" }}>
            Preguntas frecuentes
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)" }}>
            Todo lo que necesitas saber sobre Playback
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {FAQS.map(section => (
          <div key={section.category} className="bg-main rounded-xl border border-main overflow-hidden">
            <div style={{ padding: "14px 20px", borderBottom: "0.5px solid var(--border-main, #e5e7eb)", background: "#EEEDFE" }}>
              <h2 style={{ fontSize: "13px", fontWeight: "600", color: "#534AB7", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                {section.category}
              </h2>
            </div>
            <div style={{ padding: "0 20px" }}>
              {section.items.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* CTA contacto */}
        <div className="bg-main rounded-xl border border-main p-6 text-center">
          <p style={{ fontSize: "14px", color: "var(--color-text-primary)", marginBottom: "4px", fontWeight: "500" }}>
            ¿No encuentras lo que buscas?
          </p>
          <p style={{ fontSize: "13px", color: "var(--color-muted)", marginBottom: "16px" }}>
            Nuestro equipo está aquí para ayudarte
          </p>
          <a
            href="/contact"
            style={{ background: "#534AB7", color: "white", padding: "9px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: "500", textDecoration: "none", display: "inline-block" }}
          >
            Contactar con soporte
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;