import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Eres un asistente amable y profesional de Playback, un marketplace de videojuegos, consolas y accesorios retro de segunda mano.
Tu objetivo es ayudar a los clientes a:
- Encontrar productos retro que se adapten a sus necesidades
- Resolver dudas sobre el estado de los productos (nuevo, usado, reacondicionado)
- Informar sobre envíos, devoluciones y garantías
- Guiar durante el proceso de compra y venta
- Responder preguntas frecuentes sobre la plataforma

INFORMACIÓN IMPORTANTE:
- Envíos estándar: 3-5 días laborables en península. No enviamos a las islas.
- Coste de envío puede variar lo minimo son: 3,99€. Gratis en pedidos superiores a 100€.
- Devoluciones: 14 días desde la recepción, producto en estado original con embalaje.
- Para abrir una incidencia o devolución: perfil → Pedidos → seleccionar pedido → pulsar 'Incidencia'.
- Las reseñas también se dejan desde el mismo sitio: perfil → Pedidos → seleccionar pedido → pulsar 'Reseña'.
- Reembolso: 3-5 días laborables tras recibir el producto devuelto.
- Productos: todos son originales y verificados. Los reacondicionados han sido revisados y probados.
- Pagos: tarjetas Visa y Mastercard. Nunca almacenamos datos de tarjeta.
- Para vender: regístrate como vendedor desde tu perfil. Verificación en 24-48h.
- Para contactar con soporte: perfil → Panel de control → Crear Tienda.

Responde siempre en español o en el idioma que te hablen, de forma concisa (máximo 1-2 frases) y con tono cercano y profesional.
Si no sabes algo específico, invita al cliente a contactar con soporte a través de perfil → Panel de control → Contacto.
No inventes precios ni disponibilidad de stock.`;

const STATIC_RESPONSES = {
  "¿Cuánto tarda en llegar mi pedido?":
    "Los envíos tardan entre 3 y 5 días laborables en península.",
  "¿Cuánto cuesta el envío?":
    "El envío cuesta desde 3,99€ y es gratis en pedidos superiores a 100€.",
  "¿Envían a toda España?":
    "Enviamos a península, pero no a las islas actualmente.",

  "¿Puedo devolver un producto?":
    "Sí, tienes 14 días desde la recepción con el producto en su estado original.",
  "¿Cómo abro una incidencia?":
    "Desde tu perfil → Pedidos → selecciona el pedido → pulsa 'Incidencia'.",
  "¿Cuándo recibiré el reembolso?":
    "El reembolso se realiza en 3-5 días laborables tras recibir el producto.",

  "¿Cómo dejo una reseña?":
    "Desde perfil → Pedidos → selecciona tu pedido → pulsa 'Reseña'.",

  "¿Los productos son originales?":
    "Sí, todos los productos son originales y verificados.",
  "¿Qué significa 'Reacondicionado'?":
    "Son productos revisados y probados para garantizar su funcionamiento.",

  "¿Qué métodos de pago aceptáis?": "Aceptamos tarjetas Visa y Mastercard.",
  "¿Es seguro pagar en Playback?":
    "Sí, no almacenamos datos de tarjeta y el pago es seguro.",

  "¿Cómo me registro como vendedor?":
    "Desde tu perfil puedes registrarte como vendedor.",
  "¿Qué puedo vender en Playback?": "Videojuegos, consolas y accesorios retro.",
  "¿Cuánto tarda la verificación?":
    "La verificación tarda entre 24 y 48 horas.",
};

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const INITIAL_REPLIES = [
  "📦 Envíos",
  "↩️ Devoluciones",
  "🎮 Productos",
  "💳 Pagos",
  "🛒 Vender",
];

const FOLLOWUP_MAP = {
  // Envíos
  "📦 Envíos": [
    "¿Cuánto tarda en llegar mi pedido?",
    "¿Cuánto cuesta el envío?",
    "¿Envían a toda España?",
    "← Inicio",
  ],
  "¿Cuánto tarda en llegar mi pedido?": [
    "¿Cuánto cuesta el envío?",
    "¿Envían a toda España?",
    "← Inicio",
  ],
  "¿Cuánto cuesta el envío?": [
    "¿Cuánto tarda en llegar mi pedido?",
    "¿Envían a toda España?",
    "← Inicio",
  ],
  "¿Envían a toda España?": [
    "¿Cuánto tarda en llegar mi pedido?",
    "¿Cuánto cuesta el envío?",
    "← Inicio",
  ],

  // Devoluciones e incidencias
  "↩️ Devoluciones": [
    "¿Puedo devolver un producto?",
    "¿Cómo abro una incidencia?",
    "¿Cuándo recibiré el reembolso?",
    "← Inicio",
  ],
  "¿Puedo devolver un producto?": [
    "¿Cómo abro una incidencia?",
    "¿Cuándo recibiré el reembolso?",
    "← Inicio",
  ],
  "¿Cómo abro una incidencia?": [
    "¿Cuándo recibiré el reembolso?",
    "¿Cómo dejo una reseña?",
    "← Inicio",
  ],
  "¿Cuándo recibiré el reembolso?": [
    "¿Cómo abro una incidencia?",
    "💳 Pagos",
    "← Inicio",
  ],

  // Reseñas
  "¿Cómo dejo una reseña?": [
    "¿Cómo abro una incidencia?",
    "🎮 Productos",
    "← Inicio",
  ],

  // Productos
  "🎮 Productos": [
    "¿Los productos son originales?",
    "¿Qué significa 'Reacondicionado'?",
    "¿Cómo dejo una reseña?",
    "← Inicio",
  ],
  "¿Los productos son originales?": [
    "¿Qué significa 'Reacondicionado'?",
    "¿Cómo dejo una reseña?",
    "← Inicio",
  ],
  "¿Qué significa 'Reacondicionado'?": [
    "¿Los productos son originales?",
    "🛒 Vender",
    "← Inicio",
  ],

  // Pagos
  "💳 Pagos": [
    "¿Qué métodos de pago aceptáis?",
    "¿Es seguro pagar en Playback?",
    "← Inicio",
  ],
  "¿Qué métodos de pago aceptáis?": [
    "¿Es seguro pagar en Playback?",
    "📦 Envíos",
    "← Inicio",
  ],
  "¿Es seguro pagar en Playback?": [
    "¿Qué métodos de pago aceptáis?",
    "🎮 Productos",
    "← Inicio",
  ],

  // Vender
  "🛒 Vender": [
    "¿Cómo me registro como vendedor?",
    "¿Qué puedo vender en Playback?",
    "¿Cuánto tarda la verificación?",
    "← Inicio",
  ],
  "¿Cómo me registro como vendedor?": [
    "¿Cuánto tarda la verificación?",
    "¿Qué puedo vender en Playback?",
    "← Inicio",
  ],
  "¿Qué puedo vender en Playback?": [
    "¿Cómo me registro como vendedor?",
    "¿Cuánto tarda la verificación?",
    "← Inicio",
  ],
  "¿Cuánto tarda la verificación?": [
    "¿Cómo me registro como vendedor?",
    "💳 Pagos",
    "← Inicio",
  ],

  "← Inicio": INITIAL_REPLIES,
};

const getSuggestions = (last) => FOLLOWUP_MAP[last] || INITIAL_REPLIES;

// ── Consola SVG ────────────────────────────────────────────────────────────────
// El key en cada <ellipse> fuerza el remontaje completo al cambiar wink,
// lo que reinicia la animación SMIL desde cero.
const ConsoleIcon = ({ size = 40, wink = false, small = false }) => {
  const h = size * 1.25;
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cuerpo */}
      <rect
        x="1"
        y="1"
        width="62"
        height="78"
        rx="8"
        fill="#4c1d95"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
      />
      <rect
        x="1"
        y="1"
        width="62"
        height="78"
        rx="8"
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="4"
      />

      {/* Pantalla */}
      <rect
        x="8"
        y="8"
        width="48"
        height="30"
        rx="3"
        fill="#8b9331"
        stroke="rgba(0,0,0,0.8)"
        strokeWidth="2"
      />
      {[8, 11.5, 15, 18.5, 22, 25.5, 29].map((y, i) => (
        <rect
          key={i}
          x="8"
          y={y}
          width="48"
          height="1.2"
          fill="rgba(0,0,0,0.1)"
        />
      ))}
      <rect
        x="10"
        y="10"
        width="18"
        height="4"
        rx="2"
        fill="rgba(255,255,255,0.12)"
      />

      {/* Ojo izquierdo — scaleY CSS para guiño fiable */}
      <ellipse
        cx="26"
        cy="21"
        rx="3.5"
        ry="3.5"
        fill="#000"
        style={{
          transform: wink ? "scaleY(0.05)" : "scaleY(1)",
          transformOrigin: "26px 21px",
          transition: wink
            ? "transform 0.12s ease-in-out"
            : "transform 0.12s ease-in-out",
        }}
      />

      {/* Ojo derecho — parpadeo idle, quieto durante guiño */}
      <ellipse
        cx="38"
        cy="21"
        rx="3.5"
        ry="3.5"
        fill="#000"
        style={{ transformOrigin: "38px 21px" }}
        className={!wink ? "eye-idle-blink" : ""}
      />

      {/* Boca */}
      {!wink ? (
        <rect
          x="24"
          y="29"
          width="16"
          height="2"
          rx="1"
          fill="rgba(0,0,0,0.6)"
        />
      ) : (
        <path
          d="M 22 28 Q 32 34 42 28"
          stroke="rgba(0,0,0,0.7)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* D-pad */}
      <rect x="9" y="51" width="20" height="6" rx="3" fill="rgba(0,0,0,0.6)" />
      <rect x="16" y="44" width="6" height="20" rx="3" fill="rgba(0,0,0,0.6)" />

      {/* Botones A y B */}
      <circle
        cx="50"
        cy="51"
        r="5.5"
        fill="#22d3ee"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
      >
        {!small && (
          <animate
            attributeName="r"
            values="5.5;5.8;5.5"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle
        cx="40"
        cy="57"
        r="5.5"
        fill="#f472b6"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
      >
        {!small && (
          <animate
            attributeName="r"
            values="5.5;5.8;5.5"
            dur="2s"
            begin="0.35s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* Select / Start */}
      <rect
        x="22"
        y="69"
        width="9"
        height="3.5"
        rx="9"
        fill="rgba(0,0,0,0.4)"
      />
      <rect
        x="33"
        y="69"
        width="9"
        height="3.5"
        rx="9"
        fill="rgba(0,0,0,0.4)"
      />

      {/* Speaker */}
      <g opacity="0.35" transform="translate(46,63) rotate(-45)">
        <rect x="0" y="0" width="2" height="10" rx="1" fill="#000" />
        <rect x="4" y="0" width="2" height="10" rx="1" fill="#000" />
        <rect x="8" y="0" width="2" height="10" rx="1" fill="#000" />
      </g>

      {/* LED */}
      <circle cx="4" cy="30" r="2.5" fill="#ef4444">
        <animate
          attributeName="opacity"
          values="1;0.3;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

const CloseIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
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

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [winking, setWinking] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "¡Hola! 👾 ¿Qué necesitas hoy? Elige una opción y te ayudo en segundos 👇",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastUserMsg, setLastUserMsg] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setHasUnread(false);
    }
  }, [messages, open]);

  const handleMouseEnter = () => {
    if (winking) return;
    setWinking(true);
    setTimeout(() => setWinking(false), 1200);
  };

  const sendMessage = async (userText) => {
    if (!userText || loading) return;

    setLastUserMsg(userText);

    setMessages((prev) => [...prev, { role: "user", content: userText }]);

    if (STATIC_RESPONSES[userText]) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: STATIC_RESPONSES[userText] },
        ]);
      }, 300);

      return;
    }

    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 500)); // efecto typing

      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            max_tokens: 80,
            temperature: 0.3,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: userText },
            ],
          }),
        },
      );

      const data = await res.json();
      const reply =
        data?.choices?.[0]?.message?.content ||
        "Puedes contactar con soporte desde perfil → Panel de control → Contacto.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ha ocurrido un error. Inténtalo más tarde.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const lastMessage = messages[messages.length - 1];
  const showSuggestions = !loading && lastMessage?.role === "assistant";
  const suggestions = getSuggestions(lastUserMsg);

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

        .fab-wrap {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fab-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fabFloat 3s ease-in-out infinite;
        }
        .fab-btn:hover {
          animation: none;
          transform: scale(1.1);
        }
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

      {/* Chat panel */}
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div style={styles.headerAvatar}>
              <ConsoleIcon size={24} small />
            </div>
            <div>
              <p style={styles.headerTitle}>Asistente Playback</p>
              <p style={styles.headerStatus}>
                <span style={styles.statusDot} /> En línea
              </p>
            </div>
            <a
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.contactBtn}
              title="Contactar con soporte"
            >
              ✉️
            </a>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>
              <CloseIcon />
            </button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.messageRow,
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.role === "assistant" && (
                  <div style={styles.botAvatar}>
                    <ConsoleIcon size={20} small />
                  </div>
                )}
                <div
                  style={{
                    ...styles.bubble,
                    ...(msg.role === "user"
                      ? styles.userBubble
                      : styles.botBubble),
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{ ...styles.messageRow, justifyContent: "flex-start" }}
              >
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
    <p style={styles.suggestionsLabel}>Preguntas frecuentes</p>
    <div style={styles.quickReplies}>
      {suggestions.map((q, i) => {
        const isBack = q === "← Inicio";
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
        </div>
      )}

      {/* FAB */}
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
    position: "fixed",
    bottom: "110px",
    right: "24px",
    width: "360px",
     height:"540px",
    maxHeight: "540px",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 9999,
    animation: "fadeSlideUp .25s ease",
    fontFamily: "'DM Sans',system-ui,sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    background: "#111111",
    color: "#fff",
    flexShrink: 0,
  },
  headerAvatar: {
    width: "32px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "#fff",
    letterSpacing: "-0.01em",
  },
  headerStatus: {
    margin: 0,
    fontSize: "12px",
    color: "rgba(255,255,255,0.6)",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "1px",
  },
  statusDot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#4ade80",
  },
 closeBtn: { background:"none", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer", padding:"4px", borderRadius:"6px", display:"flex", alignItems:"center" },
 contactBtn: { marginLeft:"auto", background:"rgba(255,255,255,0.1)", borderRadius:"6px", padding:"5px 8px", fontSize:"14px", textDecoration:"none", display:"flex", alignItems:"center", color:"rgba(255,255,255,0.8)" },


messages: { flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:"10px", background:"#f9f9f7" },
suggestionsFooter: { padding:"10px 14px 14px", background:"#f9f9f7", borderTop:"0.5px solid #e8e8e6", flexShrink:0 },


  messageRow: { display: "flex", alignItems: "flex-end", gap: "8px" },
  botAvatar: {
    width: "26px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "78%",
    padding: "10px 14px",
    borderRadius: "16px",
    fontSize: "13.5px",
    lineHeight: "1.55",
    wordBreak: "break-word",
  },
  botBubble: {
    background: "#ffffff",
    color: "#1a1a1a",
    borderBottomLeftRadius: "4px",
    border: "0.5px solid #e8e8e6",
  },
  userBubble: {
    background: "#111111",
    color: "#ffffff",
    borderBottomRightRadius: "4px",
  },
  typingDots: {
    display: "flex",
    gap: "5px",
    padding: "2px 0",
    alignItems: "center",
  },
  dot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#aaa",
    animation: "dotBounce 1.2s infinite ease-in-out",
  },
  suggestionsBlock: { paddingTop: "2px" },
  suggestionsLabel: { fontSize: "11px", color: "#aaa", margin: "0 0 6px 0" },
  quickReplies: { display: "flex", flexWrap: "wrap", gap: "6px" },
  quickBtn: {
    fontSize: "12px",
    padding: "6px 11px",
    borderRadius: "20px",
    border: "0.5px solid #d0d0cc",
    background: "#fff",
    color: "#333",
    cursor: "pointer",
    transition: "all .15s ease",
  },
  quickBtnBack: {
    border: "0.5px solid #e0e0e0",
    background: "#f5f5f3",
    color: "#999",
    fontSize: "11px",
  },
  inputArea: {
    display: "flex",
    gap: "8px",
    padding: "12px 14px",
    background: "#fff",
    borderTop: "0.5px solid #e8e8e6",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: "9px 14px",
    fontSize: "13.5px",
    border: "0.5px solid #d0d0cc",
    borderRadius: "12px",
    background: "#f9f9f7",
    color: "#1a1a1a",
    transition: "border-color .15s ease",
  },
  sendBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    background: "#111111",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background .15s ease",
  },
  badge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#ef4444",
    border: "2px solid transparent",
  },
};
