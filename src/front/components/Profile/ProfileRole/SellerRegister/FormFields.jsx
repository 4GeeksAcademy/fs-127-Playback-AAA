// Contenedor de campo con etiqueta y mensaje de error opcional
export const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-muted uppercase tracking-wide">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

// Input de texto genérico con estilos del sistema de temas
export const Input = ({ type = 'text', ...props }) => (
  <input
    type={type}
    {...props}
    className="input focus:ring-2 focus:ring-purple-500"
  />
);

// Área de texto multilínea con estilos del sistema de temas
export const Textarea = (props) => (
  <textarea
    rows={3}
    {...props}
    className="input resize-none focus:ring-2 focus:ring-purple-500"
  />
);