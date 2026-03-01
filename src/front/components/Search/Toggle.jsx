// Interruptor on/off reutilizable — usado en el panel de filtros
export const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0
      ${checked ? "bg-violet-500" : "bg-theme-muted"}`}
  >
    <span
      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform
        ${checked ? "translate-x-5" : ""}`}
    />
  </button>
);
