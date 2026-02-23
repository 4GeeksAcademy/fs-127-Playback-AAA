/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Colores de marca (los tuyos, sin cambios) ──
        primary: "#1E40AF",
        secondary: "#9333EA",
        accent: "#F59E0B",
        brand: {
          light: "#3B82F6",
          DEFAULT: "#2563EB",
          dark: "#1E3A8A",
        },

        // ── Colores semánticos del tema (light/dark automático) ──
        theme: {
          // Fondos
          bg:        "rgb(var(--color-bg) / <alpha-value>)",
          subtle:    "rgb(var(--color-bg-subtle) / <alpha-value>)",
          muted:     "rgb(var(--color-bg-muted) / <alpha-value>)",
          input:     "rgb(var(--color-bg-input) / <alpha-value>)",
          tooltip:   "rgb(var(--color-bg-tooltip) / <alpha-value>)",

          // Bordes
          border:    "rgb(var(--color-border) / <alpha-value>)",
          "border-sm": "rgb(var(--color-border-sm) / <alpha-value>)",
          focus:     "rgb(var(--color-border-focus) / <alpha-value>)",

          // Textos
          text:      "rgb(var(--color-text) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          muted:     "rgb(var(--color-text-muted) / <alpha-value>)",
          faint:     "rgb(var(--color-text-faint) / <alpha-value>)",
          disabled:  "rgb(var(--color-text-disabled) / <alpha-value>)",
          inverse:   "rgb(var(--color-text-inverse) / <alpha-value>)",

          // Estados
          success:      "rgb(var(--color-success) / <alpha-value>)",
          warning:      "rgb(var(--color-warning) / <alpha-value>)",
          error:        "rgb(var(--color-error) / <alpha-value>)",
          info:         "rgb(var(--color-info) / <alpha-value>)",
          "success-bg": "rgb(var(--color-success-bg) / <alpha-value>)",
          "warning-bg": "rgb(var(--color-warning-bg) / <alpha-value>)",
          "error-bg":   "rgb(var(--color-error-bg) / <alpha-value>)",
          "info-bg":    "rgb(var(--color-info-bg) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};