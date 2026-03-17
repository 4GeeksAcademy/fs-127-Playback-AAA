import { useState, useRef, useEffect } from "react";

// ─── CONFIGURA AQUÍ TU BOT ───────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres un asistente de ventas amable y profesional de una tienda online.
Tu objetivo es ayudar a los clientes a:
- Encontrar productos que se adapten a sus necesidades
- Resolver dudas sobre tallas, colores, materiales o características
- Informar sobre envíos, devoluciones y garantías
- Guiar durante el proceso de compra
- Responder preguntas frecuentes
INFORMACIÓN IMPORTANTE QUE DEBES SABER:
- Envíos: tardan 2-4 días laborables. Gratis a partir de 40€.
- Devoluciones: 30 días desde la recepción, rellenando el formulario en la web.
- Tallas: disponemos de tallas de la XS a la 3XL en la mayoría de productos.
- Para ayudar a elegir: pregunta al cliente su presupuesto y para qué ocasión es.

Responde siempre en español, de forma concisa (máximo 3-4 frases por respuesta) y con un tono cercano y profesional.
Si no sabes algo específico de la tienda, invita al cliente a contactar con soporte.
No inventes precios ni disponibilidad de stock.`;

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const INITIAL_REPLIES = [
  "¿Cuánto tarda el envío?",
  "¿Cómo devuelvo un pedido?",
  "¿Tienen tallas grandes?",
  "Quiero ayuda para elegir",
];

const FOLLOWUP_MAP = {
  "¿Cuánto tarda el envío?": ["¿El envío es gratuito?", "¿Envían a Canarias o Baleares?", "¿Puedo hacer seguimiento del pedido?", "← Inicio"],
  "¿Cómo devuelvo un pedido?": ["¿Cuánto tarda el reembolso?", "¿La devolución tiene coste?", "¿Puedo cambiar por otra talla?", "← Inicio"],
  "¿Tienen tallas grandes?": ["¿Tienen guía de tallas?", "¿Qué pasa si me queda mal?", "Quiero ayuda para elegir mi talla", "← Inicio"],
  "Quiero ayuda para elegir": ["Busco algo para regalo", "Busco ropa de diario", "Busco ropa para una ocasión especial", "← Inicio"],
  "¿El envío es gratuito?": ["¿Cuánto tarda el envío?", "¿Envían a toda España?", "← Inicio"],
  "¿Envían a Canarias o Baleares?": ["¿Cuánto tarda el envío?", "¿El envío es gratuito?", "← Inicio"],
  "¿Puedo hacer seguimiento del pedido?": ["¿Cuánto tarda el envío?", "¿Cómo devuelvo un pedido?", "← Inicio"],
  "¿Cuánto tarda el reembolso?": ["¿La devolución tiene coste?", "¿Cómo devuelvo un pedido?", "← Inicio"],
  "¿La devolución tiene coste?": ["¿Cuánto tarda el reembolso?", "¿Puedo cambiar por otra talla?", "← Inicio"],
  "¿Puedo cambiar por otra talla?": ["¿Tienen guía de tallas?", "Quiero ayuda para elegir mi talla", "← Inicio"],
  "¿Tienen guía de tallas?": ["¿Puedo cambiar por otra talla?", "Quiero ayuda para elegir mi talla", "← Inicio"],
  "Busco algo para regalo": ["¿Tienen tarjetas regalo?", "¿Hacen envío express?", "← Inicio"],
  "Busco ropa de diario": ["Quiero ayuda para elegir mi talla", "¿Cuánto tarda el envío?", "← Inicio"],
  "Busco ropa para una ocasión especial": ["Busco algo para regalo", "Quiero ayuda para elegir mi talla", "← Inicio"],
  "← Inicio": INITIAL_REPLIES,
};

const getSuggestions = (lastUserMessage) => {
  if (!lastUserMessage) return INITIAL_REPLIES;
  return FOLLOWUP_MAP[lastUserMessage] || ["¿Cuánto tarda el envío?", "¿Cómo devuelvo un pedido?", "¿Tienen tallas grandes?", "← Inicio"];
};

const BotIcon = () => (
  <div style={{ position: "relative", width: "32px", height: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: "28px", height: "24px", background: "#475569", borderRadius: "3px", position: "relative", borderTop: "2px solid rgba(168,85,247,0.5)" }}>
      <div style={{ position: "absolute", top: "6px", left: "5px", width: "6px", height: "6px", background: "#a855f7", boxShadow: "0 0 8px #a855f7" }} />
      <div style={{ position: "absolute", top: "6px", right: "5px", width: "6px", height: "6px", background: "#a855f7", boxShadow: "0 0 8px #a855f7" }} />
      <div style={{ position: "absolute", bottom: "5px", left: "50%", transform: "translateX(-50%)", width: "14px", height: "2px", background: "rgba(148,163,184,0.4)", display: "flex", justifyContent: "space-between" }}>
        <div style={{ width: "2px", height: "100%", background: "#94a3b8" }} />
        <div style={{ width: "2px", height: "100%", background: "#94a3b8" }} />
        <div style={{ width: "2px", height: "100%", background: "#94a3b8" }} />
      </div>
    </div>
    <div style={{ width: "2px", height: "6px", background: "#a855f7" }} />
    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7", marginTop: "-12px", boxShadow: "0 0 8px rgba(168,85,247,0.8)", animation: "pulse 2s infinite" }} />
  </div>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const TypingDots = () => (
  <div style={styles.typingDots}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{ ...styles.dot, animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "¡Hola! 👋 Soy tu asistente de compras. ¿En qué puedo ayudarte hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastUserMsg, setLastUserMsg] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasUnread(false);
    }
  }, [messages, open]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setLastUserMsg(userText);

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Convertir historial al formato de Gemini
  
const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    model: "llama-3.1-8b-instant",
    max_tokens: 400,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...newMessages.map(m => ({ role: m.role, content: m.content })),
    ],
  }),
});

const data = await response.json();
const reply = data?.choices?.[0]?.message?.content
  || "Lo siento, no pude procesar tu mensaje.";

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      if (!open) setHasUnread(true);
    } catch (err) {
      console.error("Error:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Ha ocurrido un error. Por favor, inténtalo más tarde." },
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
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        .chat-quick-btn:hover { background: #1a1a1a !important; color: #fff !important; border-color: #1a1a1a !important; }
        .chat-quick-btn-back:hover { background: #eee !important; color: #555 !important; }
        .chat-send-btn:hover { background: #1a1a1a !important; }
        .chat-input:focus { outline: none; border-color: #1a1a1a !important; }
        .suggestions-wrap { animation: fadeIn 0.25s ease; }
      `}</style>

      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div style={styles.headerAvatar}><BotIcon /></div>
            <div>
              <p style={styles.headerTitle}>Asistente de tienda</p>
              <p style={styles.headerStatus}><span style={styles.statusDot} /> En línea</p>
            </div>
            <button onClick={() => setOpen(false)} style={styles.closeBtn} aria-label="Cerrar chat">
              <CloseIcon />
            </button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{ ...styles.messageRow, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && <div style={styles.botAvatar}><BotIcon /></div>}
                <div style={{ ...styles.bubble, ...(msg.role === "user" ? styles.userBubble : styles.botBubble) }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
                <div style={styles.botAvatar}><BotIcon /></div>
                <div style={{ ...styles.bubble, ...styles.botBubble }}><TypingDots /></div>
              </div>
            )}

            {showSuggestions && (
              <div className="suggestions-wrap" style={styles.suggestionsBlock}>
                <p style={styles.suggestionsLabel}>¿Tienes más preguntas?</p>
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

            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="O escribe tu pregunta..."
              style={styles.input}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{ ...styles.sendBtn, opacity: !input.trim() || loading ? 0.4 : 1 }}
              aria-label="Enviar"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(o => !o)} style={styles.fab} aria-label="Abrir chat">
        {open ? <CloseIcon /> : <BotIcon />}
        {hasUnread && !open && <span style={styles.badge} />}
      </button>
    </>
  );
}

const styles = {
  panel: { position: "fixed", bottom: "90px", right: "24px", width: "360px", maxHeight: "540px", background: "#ffffff", borderRadius: "20px", boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 9999, animation: "fadeSlideUp 0.25s ease", fontFamily: "'DM Sans', system-ui, sans-serif" },
  header: { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", background: "#111111", color: "#fff", flexShrink: 0 },
  headerAvatar: { width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { margin: 0, fontSize: "14px", fontWeight: "600", color: "#fff", letterSpacing: "-0.01em" },
  headerStatus: { margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: "5px", marginTop: "1px" },
  statusDot: { display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80" },
  closeBtn: { marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center" },
  messages: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", background: "#f9f9f7" },
  messageRow: { display: "flex", alignItems: "flex-end", gap: "8px" },
  botAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bubble: { maxWidth: "78%", padding: "10px 14px", borderRadius: "16px", fontSize: "13.5px", lineHeight: "1.55", wordBreak: "break-word" },
  botBubble: { background: "#ffffff", color: "#1a1a1a", borderBottomLeftRadius: "4px", border: "0.5px solid #e8e8e6" },
  userBubble: { background: "#111111", color: "#ffffff", borderBottomRightRadius: "4px" },
  typingDots: { display: "flex", gap: "5px", padding: "2px 0", alignItems: "center" },
  dot: { display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "#aaa", animation: "dotBounce 1.2s infinite ease-in-out" },
  suggestionsBlock: { paddingTop: "2px" },
  suggestionsLabel: { fontSize: "11px", color: "#aaa", margin: "0 0 6px 36px" },
  quickReplies: { display: "flex", flexWrap: "wrap", gap: "6px", paddingLeft: "36px" },
  quickBtn: { fontSize: "12px", padding: "6px 11px", borderRadius: "20px", border: "0.5px solid #d0d0cc", background: "#fff", color: "#333", cursor: "pointer", transition: "all 0.15s ease" },
  quickBtnBack: { border: "0.5px solid #e0e0e0", background: "#f5f5f3", color: "#999", fontSize: "11px" },
  inputArea: { display: "flex", gap: "8px", padding: "12px 14px", background: "#fff", borderTop: "0.5px solid #e8e8e6", flexShrink: 0 },
  input: { flex: 1, padding: "9px 14px", fontSize: "13.5px", border: "0.5px solid #d0d0cc", borderRadius: "12px", background: "#f9f9f7", color: "#1a1a1a", transition: "border-color 0.15s ease" },
  sendBtn: { width: "38px", height: "38px", borderRadius: "12px", background: "#111111", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s ease" },
fab: { 
  position: "fixed", bottom: "24px", right: "24px", 
  width: "60px", height: "60px", 
  borderRadius: "16px",            // ← antes era "50%"
  background: "#0f172a",           // ← color oscuro del original
  border: "2px solid #a855f7",     // ← borde morado
  color: "#ffffff", cursor: "pointer", display: "flex", 
  alignItems: "center", justifyContent: "center", 
  zIndex: 9999, 
  boxShadow: "0 4px 20px rgba(168,85,247,0.3)", 
  transition: "transform 0.15s ease, box-shadow 0.15s ease" 
},  badge: { position: "absolute", top: "8px", right: "8px", width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", border: "2px solid #fff" },
};