import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = {
  es: `Eres un asistente amable y profesional de Playback, un marketplace de segunda mano de videojuegos y coleccionismo retro.

INFORMACIÓN IMPORTANTE:
- Envíos estándar: 3-5 días laborables en península. No enviamos a las islas.
- Coste de envío: mínimo 3,99€. Gratis en pedidos superiores a 100€.
- Devoluciones: 14 días desde la recepción, producto en estado original con embalaje.
- Para abrir una incidencia o devolución: perfil → Pedidos → seleccionar pedido → pulsar 'Incidencia'.
- Para dejar una reseña: perfil → Pedidos → seleccionar pedido → pulsar 'Reseña'.
- Reembolso: 3-5 días laborables tras recibir el producto devuelto.
- Productos: todos son originales y verificados. Los reacondicionados han sido revisados y probados.
- Pagos: tarjetas Visa y Mastercard. Nunca almacenamos datos de tarjeta.
- Para vender: regístrate como vendedor desde tu perfil. Verificación en 24-48h.

REGLAS ABSOLUTAS:
1. Responde SIEMPRE en español.
2. Sé conciso: máximo 3-4 frases por respuesta.
3. NUNCA inventes productos, precios ni stock. Si no tienes datos reales, di que no tienes ese producto.
4. NUNCA menciones rutas como /contact, /products, /profile.
5. NUNCA preguntes al usuario si quiere que busques algo — tú ya tienes los resultados reales.
6. Cuando el mensaje incluya "RESULTADOS DE BÚSQUEDA EN CATÁLOGO", úsala como ÚNICA fuente de verdad. Lista exactamente lo que aparece, con nombre, precio y condición. No añadas productos que no estén en esa lista.
7. Si la búsqueda devuelve 0 resultados, di claramente que no tienes ese producto.
8. No hagas preguntas de seguimiento innecesarias si ya tienes los datos para responder.
`,
  en: `You are a friendly and professional assistant for Playback, a second-hand marketplace for retro video games and collectibles.

KEY INFORMATION:
- Standard shipping: 3–5 working days to mainland Spain. We do not ship to the islands.
- Shipping cost: from €3.99. Free on orders over €100.
- Returns: 14 days from receipt, product in original condition with packaging.
- To open a dispute or return: profile → Orders → select order → tap 'Dispute'.
- To leave a review: profile → Orders → select your order → tap 'Review'.
- Refund: 3–5 working days after we receive the returned product.
- Products: all are genuine and verified. Refurbished items have been inspected and tested.
- Payments: Visa and Mastercard. We never store card data.
- To sell: register as a seller from your profile. Verification takes 24–48h.

ABSOLUTE RULES:
1. ALWAYS reply in English.
2. Be concise: maximum 3–4 sentences per response.
3. NEVER invent products, prices or stock. If you have no real data, say you don't carry that item.
4. NEVER mention routes like /contact, /products, /profile.
5. NEVER ask the user if they want you to search — you already have the real results.
6. When the message includes "CATALOGUE SEARCH RESULTS", use it as the ONLY source of truth. List exactly what appears there, with real name, price and condition. Do not add products not in that list.
7. If the search returns 0 results, clearly say you don't have that product.
8. Do not ask unnecessary follow-up questions if you already have the data to answer.
`,
};

// Keep SYSTEM_PROMPT_BASE for backwards compat with setSystemPrompt
const SYSTEM_PROMPT_BASE = SYSTEM_PROMPT.es;

// ── Detectar si el mensaje pregunta por un producto específico ──────────────
const PRODUCT_QUERY_TRIGGERS = [
  "tienes", "tenéis", "teneis", "hay algo de", "venden", "vendéis", "vendeis",
  "buscando", "busco", "cuánto vale", "cuanto vale", "cuánto cuesta",
  "cuanto cuesta", "stock de", "en stock", "disponible",
];

const isProductQuery = (text, lang) => {
  const lower = text.toLowerCase();
  const triggers = lang === "en"
    ? PRODUCT_QUERY_TRIGGERS_EN
    : PRODUCT_QUERY_TRIGGERS;
  return triggers.some((kw) => lower.includes(kw));
};

// Extraer término de búsqueda del mensaje del usuario
const extractSearchTerm = (text) => {
  // Palabras funcionales Y palabras genéricas que no son nombres de productos
  const stopWords = new Set([
    // funcionales
    "tienes","teneis","hay","venden","vendeis","buscando","busco",
    "quiero","necesito","disponen","tienen","existe","encuentro","encontrar",
    "cuanto","vale","cuesta","stock","disponible","comprar","conseguir",
    "alguna","alguno","algun","para","con","que","hola","oye","mira","ver",
    "pues","como","algo","mas","puedo","podeis","tambien","ademas",
    "una","uno","unos","unas","los","las","del","este","esta","estos","estas",
    "nada","todo","todos","todas","tengo","tenemos","tiene","precio",
    "ref","dame","dime","muestra","cuales","cuantos","mas","hay",
    // genéricas (no son nombres de producto)
    "cosas","cosa","productos","producto","articulos","articulo","items",
    "tipo","tipos","modelo","modelos","coleccion","accion","especial",
    "especiales","antiguos","antigua","antiguos","edicion","ediciones",
    "figuras","figura","juguetes","juguete","cartas","carta","juegos","juego",
    "consolas","consola","accesorios","accesorio","libros","libro",
    "comics","comic","revistas","revista","pelicula","peliculas",
  ]);
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const words = text
    .replace(/[?\u00bf!\u00a1,;:.]/g, "")
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 3 && !stopWords.has(norm(w)));
  return words.join(" ").trim();
};
// Formatear condición del producto en español legible
const formatCondition = (condition) => {
  const map = {
    new: "Nuevo",
    used: "Usado",
    refurbished: "Reacondicionado",
    like_new: "Como nuevo",
  };
  return map[condition] || condition;
};

// Formatear precio
const formatPrice = (price, discount) => {
  if (discount > 0) {
    const final = price * (1 - discount / 100);
    return `~~${price.toFixed(2)}€~~ → **${final.toFixed(2)}€** (-${discount}%)`;
  }
  return `${price.toFixed(2)}€`;
};

// Construir contexto de productos para el prompt
const buildProductContext = (products, query) => {
  if (!products.length) {
    return `\n\n---\nRESULTADOS DE BÚSQUEDA EN CATÁLOGO para "${query}": NINGÚN producto encontrado. Di al usuario que no tienes ese producto.\n---`;
  }
  const top = products.slice(0, 5);
  const lines = top.map((p) => {
    const name = p.name || "";
    const condition = formatCondition(p.condition);
    const finalPrice = p.discount > 0
      ? (p.price * (1 - p.discount / 100)).toFixed(2)
      : p.price?.toFixed(2);
    const stockInfo = p.stock === 0
      ? "SIN STOCK"
      : p.stock <= 3
        ? `Quedan ${p.stock} unidades`
        : `En stock (${p.stock} uds.)`;
    const discount = p.discount > 0 ? ` | Descuento: ${p.discount}%` : "";
    return `• ${name} | ${condition} | ${finalPrice}€${discount} | ${stockInfo}`;
  });
  return `\n\n---\nRESULTADOS DE BÚSQUEDA EN CATÁLOGO para "${query}" (${products.length} producto${products.length !== 1 ? "s" : ""} encontrado${products.length !== 1 ? "s" : ""}):\n${lines.join("\n")}\nINSTRUCCIÓN: Lista estos productos exactamente con su nombre, precio y condición. No inventes ni añadas productos que no estén en esta lista.\n---`;
};

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const BACKEND = import.meta.env.VITE_BACKEND_URL || "";

// ── i18n ──────────────────────────────────────────────────────────────────────
const I18N = {
  es: {
    greeting: "¡Hola! 👾 ¿Qué necesitas hoy? Elige una opción o escríbeme directamente 👇",
    placeholder: "Escribe tu pregunta...",
    headerTitle: "Asistente Playback",
    online: "En línea",
    searching: "Buscando en el catálogo…",
    faqLabel: "Preguntas frecuentes",
    categoriesLabel: "Categorías",
    langBtn: "EN",
    initial: ["📦 Envíos", "↩️ Devoluciones", "🎮 Productos", "💳 Pagos", "🛒 Vender"],
    back: "← Inicio",
    backCat: "← Categorías",
    static: {
      "📦 Envíos": null,
      "↩️ Devoluciones": null,
      "🎮 Productos": null,
      "💳 Pagos": null,
      "🛒 Vender": null,
      "¿Cuánto tarda en llegar mi pedido?": "Los envíos tardan entre 3 y 5 días laborables en península.",
      "¿Cuánto cuesta el envío?": "El envío cuesta desde 3,99€ y es gratis en pedidos superiores a 100€.",
      "¿Envían a toda España?": "Enviamos a península, pero no a las islas actualmente.",
      "¿Puedo devolver un producto?": "Sí, tienes 14 días desde la recepción con el producto en su estado original.",
      "¿Cómo abro una incidencia?": "Desde tu perfil → Pedidos → selecciona el pedido → pulsa 'Incidencia'.",
      "¿Cuándo recibiré el reembolso?": "El reembolso se realiza en 3-5 días laborables tras recibir el producto.",
      "¿Cómo dejo una reseña?": "Desde perfil → Pedidos → selecciona tu pedido → pulsa 'Reseña'.",
      "¿Los productos son originales?": "Sí, todos los productos son originales y verificados.",
      "¿Qué significa 'Reacondicionado'?": "Son productos revisados y probados para garantizar su funcionamiento.",
      "¿Qué métodos de pago aceptáis?": "Aceptamos tarjetas Visa y Mastercard.",
      "¿Es seguro pagar en Playback?": "Sí, no almacenamos datos de tarjeta y el pago es seguro.",
      "¿Cómo me registro como vendedor?": "Desde tu perfil puedes registrarte como vendedor.",
      "¿Qué puedo vender en Playback?": "Videojuegos, consolas y accesorios retro.",
      "¿Cuánto tarda la verificación?": "La verificación tarda entre 24 y 48 horas.",
    },
    followup: {
      "📦 Envíos": ["¿Cuánto tarda en llegar mi pedido?", "¿Cuánto cuesta el envío?", "¿Envían a toda España?", "← Inicio"],
      "¿Cuánto tarda en llegar mi pedido?": ["¿Cuánto cuesta el envío?", "¿Envían a toda España?", "← Inicio"],
      "¿Cuánto cuesta el envío?": ["¿Cuánto tarda en llegar mi pedido?", "¿Envían a toda España?", "← Inicio"],
      "¿Envían a toda España?": ["¿Cuánto tarda en llegar mi pedido?", "¿Cuánto cuesta el envío?", "← Inicio"],
      "↩️ Devoluciones": ["¿Puedo devolver un producto?", "¿Cómo abro una incidencia?", "¿Cuándo recibiré el reembolso?", "← Inicio"],
      "¿Puedo devolver un producto?": ["¿Cómo abro una incidencia?", "¿Cuándo recibiré el reembolso?", "← Inicio"],
      "¿Cómo abro una incidencia?": ["¿Cuándo recibiré el reembolso?", "¿Cómo dejo una reseña?", "← Inicio"],
      "¿Cuándo recibiré el reembolso?": ["¿Cómo abro una incidencia?", "💳 Pagos", "← Inicio"],
      "¿Cómo dejo una reseña?": ["¿Cómo abro una incidencia?", "🎮 Productos", "← Inicio"],
      "🎮 Productos": ["¿Los productos son originales?", "¿Qué significa 'Reacondicionado'?", "¿Cómo dejo una reseña?", "← Inicio"],
      "¿Los productos son originales?": ["¿Qué significa 'Reacondicionado'?", "¿Cómo dejo una reseña?", "← Inicio"],
      "¿Qué significa 'Reacondicionado'?": ["¿Los productos son originales?", "🛒 Vender", "← Inicio"],
      "💳 Pagos": ["¿Qué métodos de pago aceptáis?", "¿Es seguro pagar en Playback?", "← Inicio"],
      "¿Qué métodos de pago aceptáis?": ["¿Es seguro pagar en Playback?", "📦 Envíos", "← Inicio"],
      "¿Es seguro pagar en Playback?": ["¿Qué métodos de pago aceptáis?", "🎮 Productos", "← Inicio"],
      "🛒 Vender": ["¿Cómo me registro como vendedor?", "¿Qué puedo vender en Playback?", "¿Cuánto tarda la verificación?", "← Inicio"],
      "¿Cómo me registro como vendedor?": ["¿Cuánto tarda la verificación?", "¿Qué puedo vender en Playback?", "← Inicio"],
      "¿Qué puedo vender en Playback?": ["¿Cómo me registro como vendedor?", "¿Cuánto tarda la verificación?", "← Inicio"],
      "¿Cuánto tarda la verificación?": ["¿Cómo me registro como vendedor?", "💳 Pagos", "← Inicio"],
    },
    catalogKeywords: [
      "categoría","categoria","categorías","categorias","catálogo","catalogo",
      "qué vendéis","que vendeis","qué tenéis","que teneis","qué hay","que hay",
      "qué productos","que productos","vuestros productos","qué tienes","que tienes",
      "qué tienen","que tienen","qué consolas","que consolas","qué juegos","que juegos",
    ],
  },
  en: {
    greeting: "Hi! 👾 What do you need today? Choose an option or type directly 👇",
    placeholder: "Type your question...",
    headerTitle: "Playback Assistant",
    online: "Online",
    searching: "Searching catalogue…",
    faqLabel: "Frequently asked questions",
    categoriesLabel: "Categories",
    langBtn: "ES",
    initial: ["📦 Shipping", "↩️ Returns", "🎮 Products", "💳 Payments", "🛒 Sell"],
    back: "← Home",
    backCat: "← Categories",
    static: {
      "📦 Shipping": null,
      "↩️ Returns": null,
      "🎮 Products": null,
      "💳 Payments": null,
      "🛒 Sell": null,
      "How long does delivery take?": "Standard shipping takes 3–5 working days to mainland Spain.",
      "How much does shipping cost?": "Shipping starts at €3.99 and is free on orders over €100.",
      "Do you ship all over Spain?": "We ship to mainland Spain, but not to the islands currently.",
      "Can I return a product?": "Yes, you have 14 days from receipt with the product in its original condition.",
      "How do I open a dispute?": "Go to your profile → Orders → select the order → tap 'Dispute'.",
      "When will I get my refund?": "Refunds are processed within 3–5 working days after we receive the return.",
      "How do I leave a review?": "Profile → Orders → select your order → tap 'Review'.",
      "Are products genuine?": "Yes, all products are genuine and verified.",
      "What does 'Refurbished' mean?": "Refurbished products have been inspected and tested to ensure they work correctly.",
      "What payment methods do you accept?": "We accept Visa and Mastercard.",
      "Is it safe to pay on Playback?": "Yes, we never store card data and all payments are secure.",
      "How do I register as a seller?": "You can register as a seller from your profile.",
      "What can I sell on Playback?": "Retro video games, consoles and accessories.",
      "How long does verification take?": "Verification takes between 24 and 48 hours.",
    },
    followup: {
      "📦 Shipping": ["How long does delivery take?", "How much does shipping cost?", "Do you ship all over Spain?", "← Home"],
      "How long does delivery take?": ["How much does shipping cost?", "Do you ship all over Spain?", "← Home"],
      "How much does shipping cost?": ["How long does delivery take?", "Do you ship all over Spain?", "← Home"],
      "Do you ship all over Spain?": ["How long does delivery take?", "How much does shipping cost?", "← Home"],
      "↩️ Returns": ["Can I return a product?", "How do I open a dispute?", "When will I get my refund?", "← Home"],
      "Can I return a product?": ["How do I open a dispute?", "When will I get my refund?", "← Home"],
      "How do I open a dispute?": ["When will I get my refund?", "How do I leave a review?", "← Home"],
      "When will I get my refund?": ["How do I open a dispute?", "💳 Payments", "← Home"],
      "How do I leave a review?": ["How do I open a dispute?", "🎮 Products", "← Home"],
      "🎮 Products": ["Are products genuine?", "What does 'Refurbished' mean?", "How do I leave a review?", "← Home"],
      "Are products genuine?": ["What does 'Refurbished' mean?", "How do I leave a review?", "← Home"],
      "What does 'Refurbished' mean?": ["Are products genuine?", "🛒 Sell", "← Home"],
      "💳 Payments": ["What payment methods do you accept?", "Is it safe to pay on Playback?", "← Home"],
      "What payment methods do you accept?": ["Is it safe to pay on Playback?", "📦 Shipping", "← Home"],
      "Is it safe to pay on Playback?": ["What payment methods do you accept?", "🎮 Products", "← Home"],
      "🛒 Sell": ["How do I register as a seller?", "What can I sell on Playback?", "How long does verification take?", "← Home"],
      "How do I register as a seller?": ["How long does verification take?", "What can I sell on Playback?", "← Home"],
      "What can I sell on Playback?": ["How do I register as a seller?", "How long does verification take?", "← Home"],
      "How long does verification take?": ["How do I register as a seller?", "💳 Payments", "← Home"],
    },
    catalogKeywords: [
      "category","categories","catalogue","catalog",
      "what do you sell","what do you have","what products","your products",
      "what games","what consoles","what items",
    ],
  },
};

const PRODUCT_QUERY_TRIGGERS_EN = [
  "do you have", "have you got", "do you sell", "looking for", "searching for",
  "how much is", "how much does", "price of", "in stock", "available",
];
// ── Consola SVG ────────────────────────────────────────────────────────────────
const ConsoleIcon = ({ size = 40, wink = false, small = false }) => {
  const h = size * 1.25;
  return (
    <svg width={size} height={h} viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="62" height="78" rx="8" fill="#4c1d95" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
      <rect x="1" y="1" width="62" height="78" rx="8" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="4" />
      <rect x="8" y="8" width="48" height="30" rx="3" fill="#8b9331" stroke="rgba(0,0,0,0.8)" strokeWidth="2" />
      {[8, 11.5, 15, 18.5, 22, 25.5, 29].map((y, i) => (
        <rect key={i} x="8" y={y} width="48" height="1.2" fill="rgba(0,0,0,0.1)" />
      ))}
      <rect x="10" y="10" width="18" height="4" rx="2" fill="rgba(255,255,255,0.12)" />
      <ellipse cx="26" cy="21" rx="3.5" ry="3.5" fill="#000"
        style={{ transform: wink ? "scaleY(0.05)" : "scaleY(1)", transformOrigin: "26px 21px", transition: "transform 0.12s ease-in-out" }} />
      <ellipse cx="38" cy="21" rx="3.5" ry="3.5" fill="#000"
        style={{ transformOrigin: "38px 21px" }}
        className={!wink ? "eye-idle-blink" : ""} />
      {!wink
        ? <rect x="24" y="29" width="16" height="2" rx="1" fill="rgba(0,0,0,0.6)" />
        : <path d="M 22 28 Q 32 34 42 28" stroke="rgba(0,0,0,0.7)" strokeWidth="2" fill="none" strokeLinecap="round" />}
      <rect x="9" y="51" width="20" height="6" rx="3" fill="rgba(0,0,0,0.6)" />
      <rect x="16" y="44" width="6" height="20" rx="3" fill="rgba(0,0,0,0.6)" />
      <circle cx="50" cy="51" r="5.5" fill="#22d3ee" stroke="rgba(255,255,255,0.25)" strokeWidth="1">
        {!small && <animate attributeName="r" values="5.5;5.8;5.5" dur="2s" repeatCount="indefinite" />}
      </circle>
      <circle cx="40" cy="57" r="5.5" fill="#f472b6" stroke="rgba(255,255,255,0.25)" strokeWidth="1">
        {!small && <animate attributeName="r" values="5.5;5.8;5.5" dur="2s" begin="0.35s" repeatCount="indefinite" />}
      </circle>
      <rect x="22" y="69" width="9" height="3.5" rx="9" fill="rgba(0,0,0,0.4)" />
      <rect x="33" y="69" width="9" height="3.5" rx="9" fill="rgba(0,0,0,0.4)" />
      <g opacity="0.35" transform="translate(46,63) rotate(-45)">
        <rect x="0" y="0" width="2" height="10" rx="1" fill="#000" />
        <rect x="4" y="0" width="2" height="10" rx="1" fill="#000" />
        <rect x="8" y="0" width="2" height="10" rx="1" fill="#000" />
      </g>
      <circle cx="4" cy="30" r="2.5" fill="#ef4444">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TypingDots = () => (
  <div style={styles.typingDots}>
    {[0, 1, 2].map((i) => (
      <span key={i} style={{ ...styles.dot, animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

// Renderiza texto con soporte básico de markdown (negrita, tachado)
const BubbleText = ({ content }) => {
  const renderLine = (line, idx) => {
    // Procesar ~~tachado~~ y **negrita**
    const parts = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      const strikeStart = remaining.indexOf("~~");
      const boldStart = remaining.indexOf("**");

      const nextSpecial = Math.min(
        strikeStart === -1 ? Infinity : strikeStart,
        boldStart === -1 ? Infinity : boldStart,
      );

      if (nextSpecial === Infinity) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }

      if (nextSpecial > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, nextSpecial)}</span>);
        remaining = remaining.slice(nextSpecial);
        continue;
      }

      if (remaining.startsWith("~~")) {
        const end = remaining.indexOf("~~", 2);
        if (end === -1) { parts.push(<span key={key++}>{remaining}</span>); break; }
        parts.push(<del key={key++} style={{ opacity: 0.6 }}>{remaining.slice(2, end)}</del>);
        remaining = remaining.slice(end + 2);
      } else if (remaining.startsWith("**")) {
        const end = remaining.indexOf("**", 2);
        if (end === -1) { parts.push(<span key={key++}>{remaining}</span>); break; }
        parts.push(<strong key={key++}>{remaining.slice(2, end)}</strong>);
        remaining = remaining.slice(end + 2);
      }
    }

    return <span key={idx}>{parts}</span>;
  };

  if (!content.includes("\n")) return <>{renderLine(content, 0)}</>;

  return content.split("\n").map((line, i, arr) => (
    <span key={i}>
      {renderLine(line, i)}
      {i < arr.length - 1 && <br />}
    </span>
  ));
};

// Pill de estado para indicar que se está buscando en el catálogo
const SearchingPill = ({ label }) => (
  <div style={styles.searchingPill}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    {label}
  </div>
);

export default function ChatWidget() {
  const [lang, setLang] = useState("es");
  const t = I18N[lang];

  const [open, setOpen] = useState(false);
  const [winking, setWinking] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [catalogText, setCatalogText] = useState("");
  const [catalogData, setCatalogData] = useState([]);
  const [browseLevel, setBrowseLevel] = useState(null);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const lastSearchTermRef = useRef("");

  const [messages, setMessages] = useState([
    { role: "assistant", content: I18N.es.greeting },
  ]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastUserMsg, setLastUserMsg] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const toggleLang = () => {
    const next = lang === "es" ? "en" : "es";
    setLang(next);
    setBrowseLevel(null);
    setLastUserMsg(null);
    lastSearchTermRef.current = "";
    setMessages([{ role: "assistant", content: I18N[next].greeting }]);
  };

  // Carga categorías al montar
  useEffect(() => {
    fetch(`${BACKEND}/api/categories?locale=es`)
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setCatalogData(data);
        const catalogo = data
          .map((cat) => {
            const subs = cat.subcategories
              ?.map((s) => {
                const items = s.items?.map((i) => i.name).filter(Boolean).join(", ");
                return items ? `  · ${s.name} (${items})` : `  · ${s.name}`;
              })
              .join("\n");
            return subs ? `- ${cat.name}:\n${subs}` : `- ${cat.name}`;
          })
          .join("\n");
        setCatalogText(`\n\nCATÁLOGO ACTUAL DE PLAYBACK:\n${catalogo}`);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasUnread(false);
    }
  }, [messages, open]);

  const handleMouseEnter = () => {
    if (winking) return;
    setWinking(true);
    setTimeout(() => setWinking(false), 1200);
  };

  // ── Búsqueda de productos en el backend ─────────────────────────────────────
  const normalize = (str) =>
    (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const searchProducts = async (query) => {
    try {
      const res = await fetch(`${BACKEND}/api/product?locale=es`);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      const words = normalize(query).split(/\s+/).filter(w => w.length >= 2);
      if (!words.length) return [];

      return data.filter((p) => {
        const blob = normalize(
          [p.name, p.description, p.item, p.category, p.subcategory,
           JSON.stringify(p.characteristics)].join(" ")
        );
        // Todos los términos deben aparecer (AND), así "figuras pokemon" = tiene figuras Y pokemon
        return words.every(w => blob.includes(w));
      });
    } catch {
      return [];
    }
  };

  // Qué botones mostrar según el nivel de navegación
  const getSuggestions = () => {
    if (browseLevel === "categories") return [...catalogData.map((cat) => cat.name), t.back];
    if (browseLevel?.cat) {
      const subs = browseLevel.cat.subcategories?.map((s) => s.name) || [];
      return [...subs, t.backCat, t.back];
    }
    return t.followup[lastUserMsg] || t.initial;
  };

  const getSuggestionsLabel = () => {
    if (browseLevel === "categories") return t.categoriesLabel;
    if (browseLevel?.cat) return `${browseLevel.cat.name} · ${lang === "es" ? "Subcategorías" : "Subcategories"}`;
    return t.faqLabel;
  };

  const sendMessage = async (userText) => {
    const text = userText || inputValue.trim();
    if (!text || loading) return;
    setInputValue("");

    // ── Navegación local ───────────────────────────────────────────────────
    if (text === t.back) { setBrowseLevel(null); setLastUserMsg(null); return; }
    if (text === t.backCat) { setBrowseLevel("categories"); return; }

    if (browseLevel === "categories") {
      const cat = catalogData.find((c) => c.name === text);
      if (cat) {
        const hasSubs = cat.subcategories?.length > 0;
        setMessages((prev) => [
          ...prev,
          { role: "user", content: text },
          {
            role: "assistant",
            content: hasSubs
              ? (lang === "es" ? `Estas son las subcategorías de ${cat.name}:` : `These are the subcategories of ${cat.name}:`)
              : (lang === "es" ? `${cat.name} aún no tiene subcategorías registradas.` : `${cat.name} has no subcategories yet.`),
          },
        ]);
        setBrowseLevel({ cat });
        return;
      }
    }

    if (browseLevel?.cat) {
      const sub = browseLevel.cat.subcategories?.find((s) => s.name === text);
      if (sub) {
        const items = sub.items?.map((i) => i.name).filter(Boolean);
        const msgContent = items?.length
          ? `${sub.name}:\n${items.map((n) => `· ${n}`).join("\n")}`
          : (lang === "es" ? `No hay artículos disponibles en ${sub.name} por el momento.` : `No items available in ${sub.name} at the moment.`);
        setMessages((prev) => [
          ...prev,
          { role: "user", content: text },
          { role: "assistant", content: msgContent },
        ]);
        return;
      }
    }

    // ── Respuesta estática instantánea ────────────────────────────────────
    setLastUserMsg(text);

    if (t.static[text]) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: t.static[text] },
      ]);
      return;
    }

    // ── Añadir mensaje del usuario y mostrar carga ────────────────────────
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    // ── Búsqueda de productos si el mensaje lo requiere ───────────────────
    let productContext = "";

    const searchTerm = extractSearchTerm(text);
    const isProduct = isProductQuery(text, lang);

    if (isProduct) {
      // Mensaje sobre productos: buscar con término nuevo o reusar el anterior
      setIsSearchingProducts(true);
      const effectiveTerm = searchTerm.length >= 2 ? searchTerm : lastSearchTermRef.current;
      if (effectiveTerm.length >= 2) {
        if (searchTerm.length >= 2) lastSearchTermRef.current = searchTerm;
        const products = await searchProducts(effectiveTerm);
        productContext = buildProductContext(products, effectiveTerm);
      }
      setIsSearchingProducts(false);
    } else {
      // Mensaje que NO es sobre productos: resetear contexto de búsqueda
      lastSearchTermRef.current = "";
    }

    // ── Llamada a la IA ───────────────────────────────────────────────────
    try {
      const effectiveSystemPrompt = SYSTEM_PROMPT[lang] + catalogText + (productContext || "");

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 200,
          temperature: 0.3,
          messages: [
            { role: "system", content: effectiveSystemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
        }),
      });

      const data = await res.json();
      const reply =
        data?.choices?.[0]?.message?.content ||
        "Puedes contactarnos desde el formulario de contacto de la web 😊";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      if (t.catalogKeywords.some(kw => text.toLowerCase().includes(kw)) && catalogData.length > 0) {
        setBrowseLevel("categories");
      }

      if (!open) setHasUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ha ocurrido un error. Inténtalo más tarde." },
      ]);
    } finally {
      setLoading(false);
      setIsSearchingProducts(false);
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showSuggestions = !loading && (browseLevel !== null || lastMessage?.role === "assistant");
  const suggestions = getSuggestions();

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform:translateY(0); opacity:.4; }
          40%          { transform:translateY(-5px); opacity:1; }
        }
        @keyframes fabFloat {
          0%,100% { transform:translateY(0px); }
          50%      { transform:translateY(-7px); }
        }
        @keyframes searchPulse {
          0%,100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
        .fab-wrap {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
        }
        .fab-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          animation: fabFloat 3s ease-in-out infinite;
        }
        .fab-btn:hover  { animation: none; transform: scale(1.1); }
        .fab-btn:active { transform: scale(0.93); }
        .chat-quick-btn:hover      { background:#534AB7!important; color:#fff!important; border-color:#534AB7!important; }
        .chat-quick-btn-back:hover { background:#eee!important; color:#555!important; }
        .chat-send-btn:hover       { background:#1a1a1a!important; }
        .chat-input:focus          { outline:none; border-color:#534AB7!important; }
        .suggestions-wrap          { animation:fadeIn .25s ease; }
        @keyframes eyeIdleBlink {
          0%, 88%, 100% { transform: scaleY(1); }
          92%            { transform: scaleY(0.05); }
        }
        .eye-idle-blink {
          transform-origin: 38px 21px;
          animation: eyeIdleBlink 3.5s ease-in-out infinite;
        }
      `}</style>

      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div style={styles.headerAvatar}>
              <ConsoleIcon size={24} small />
            </div>
            <div>
              <p style={styles.headerTitle}>{t.headerTitle}</p>
              <p style={styles.headerStatus}>
                <span style={styles.statusDot} /> {t.online}
              </p>
            </div>
            <button onClick={toggleLang} style={styles.langBtn} title="Change language">
              {t.langBtn}
            </button>
            <a href="/contact" style={styles.contactBtn} title="Contact support">✉️</a>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>
              <CloseIcon />
            </button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{ ...styles.messageRow, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
              >
                {msg.role === "assistant" && (
                  <div style={styles.botAvatar}>
                    <ConsoleIcon size={20} small />
                  </div>
                )}
                <div style={{ ...styles.bubble, ...(msg.role === "user" ? styles.userBubble : styles.botBubble) }}>
                  <BubbleText content={msg.content} />
                </div>
              </div>
            ))}

            {/* Indicador de búsqueda en catálogo */}
            {isSearchingProducts && !loading && (
              <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
                <div style={styles.botAvatar}>
                  <ConsoleIcon size={20} small />
                </div>
                <SearchingPill label={t.searching} />
              </div>
            )}

            {loading && (
              <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
                <div style={styles.botAvatar}>
                  <ConsoleIcon size={20} small />
                </div>
                <div style={{ ...styles.bubble, ...styles.botBubble }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showSuggestions && (
            <div className="suggestions-wrap" style={styles.suggestionsFooter}>
              <p style={styles.suggestionsLabel}>{getSuggestionsLabel()}</p>
              <div style={styles.quickReplies}>
                {suggestions.map((q, i) => {
                  const isBack = q === t.back || q === t.backCat;
                  return (
                    <button
                      key={i}
                      className={isBack ? "chat-quick-btn-back" : "chat-quick-btn"}
                      onClick={() => sendMessage(q)}
                      style={{ ...styles.quickBtn, ...(isBack ? styles.quickBtnBack : {}) }}
                    >
                      {q}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={styles.inputArea}>
            <input
              ref={inputRef}
              className="chat-input"
              style={styles.input}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={t.placeholder}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              style={{ ...styles.sendBtn, opacity: !inputValue.trim() || loading ? 0.4 : 1 }}
              onClick={() => sendMessage()}
              disabled={loading || !inputValue.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="fab-wrap">
        <button
          className="fab-btn"
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={handleMouseEnter}
          aria-label="Abrir chat"
        >
          {open ? <CloseIcon /> : <ConsoleIcon size={52} wink={winking} />}
          {hasUnread && !open && <span style={styles.badge} />}
        </button>
      </div>
    </>
  );
}

const styles = {
  panel: {
    position: "fixed", bottom: "110px", right: "24px",
    width: "360px", height: "540px", maxHeight: "540px",
    background: "#ffffff", borderRadius: "20px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
    display: "flex", flexDirection: "column",
    overflow: "hidden", zIndex: 9999,
    animation: "fadeSlideUp .25s ease",
    fontFamily: "'DM Sans',system-ui,sans-serif",
  },
  header: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "16px 20px", background: "#111111", color: "#fff", flexShrink: 0,
  },
  headerAvatar: { width: "32px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { margin: 0, fontSize: "14px", fontWeight: "600", color: "#fff", letterSpacing: "-0.01em" },
  headerStatus: { margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: "5px", marginTop: "1px" },
  statusDot: { display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80" },
  closeBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center" },
  langBtn: { background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", padding: "4px 8px", fontSize: "11px", fontWeight: "700", color: "#fff", cursor: "pointer", letterSpacing: "0.05em", transition: "background .15s" },
  contactBtn: { marginLeft: "auto", background: "rgba(255,255,255,0.1)", borderRadius: "6px", padding: "5px 8px", fontSize: "14px", textDecoration: "none", display: "flex", alignItems: "center", color: "rgba(255,255,255,0.8)" },
  messages: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", background: "#f9f9f7" },
  suggestionsFooter: { padding: "10px 14px 14px", background: "#f9f9f7", borderTop: "0.5px solid #e8e8e6", flexShrink: 0 },
  messageRow: { display: "flex", alignItems: "flex-end", gap: "8px" },
  botAvatar: { width: "26px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bubble: { maxWidth: "78%", padding: "10px 14px", borderRadius: "16px", fontSize: "13.5px", lineHeight: "1.55", wordBreak: "break-word" },
  botBubble: { background: "#ffffff", color: "#1a1a1a", borderBottomLeftRadius: "4px", border: "0.5px solid #e8e8e6" },
  userBubble: { background: "#111111", color: "#ffffff", borderBottomRightRadius: "4px" },
  typingDots: { display: "flex", gap: "5px", padding: "2px 0", alignItems: "center" },
  dot: { display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#aaa", animation: "dotBounce 1.2s infinite ease-in-out" },
  suggestionsLabel: { fontSize: "11px", color: "#aaa", margin: "0 0 6px 0" },
  quickReplies: { display: "flex", flexWrap: "wrap", gap: "6px" },
  quickBtn: { fontSize: "12px", padding: "6px 11px", borderRadius: "20px", border: "0.5px solid #d0d0cc", background: "#fff", color: "#333", cursor: "pointer", transition: "all .15s ease" },
  quickBtnBack: { border: "0.5px solid #e0e0e0", background: "#f5f5f3", color: "#999", fontSize: "11px" },
  inputArea: { display: "flex", gap: "8px", padding: "12px 14px", background: "#fff", borderTop: "0.5px solid #e8e8e6", flexShrink: 0 },
  input: { flex: 1, padding: "9px 14px", fontSize: "13.5px", border: "0.5px solid #d0d0cc", borderRadius: "12px", background: "#f9f9f7", color: "#1a1a1a", transition: "border-color .15s ease" },
  sendBtn: { width: "38px", height: "38px", borderRadius: "12px", background: "#111111", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s ease" },
  badge: { position: "absolute", top: "-4px", right: "-4px", width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444", border: "2px solid transparent" },
  searchingPill: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "7px 12px", borderRadius: "20px",
    background: "#fff", border: "0.5px solid #e8e8e6",
    fontSize: "12px", color: "#666",
    animation: "searchPulse 1.5s ease-in-out infinite",
  },
};