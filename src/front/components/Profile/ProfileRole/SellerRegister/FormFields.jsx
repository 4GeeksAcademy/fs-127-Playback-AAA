// Contenedor de campo con etiqueta y mensaje de error opcional
export const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-theme-muted uppercase tracking-wide">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-theme-error mt-0.5">{error}</p>}
  </div>
);

// Input de texto genérico con estilos del sistema de temas
export const Input = ({ type = 'text', ...props }) => (
  <input
    type={type}
    {...props}
    className="w-full border border-theme-border rounded-lg p-3 text-sm bg-theme-input
               text-theme-text placeholder-theme-faint
               focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
  />
);

// Área de texto multilínea con estilos del sistema de temas
export const Textarea = (props) => (
  <textarea
    rows={3}
    {...props}
    className="w-full border border-theme-border rounded-lg p-3 text-sm bg-theme-input
               text-theme-text placeholder-theme-faint resize-none
               focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
  />
);
