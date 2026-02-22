# Sistema de Temas

Sistema de colores semánticos para gestionar el modo claro y oscuro sin escribir clases `dark:` en cada componente.

---

## Cómo funciona

En lugar de escribir los colores dos veces:
```jsx
// ❌ Antes
<div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
```

Usas una sola clase semántica:
```jsx
// ✅ Ahora
<div className="bg-theme-bg text-theme-text">
```

El sistema cambia automáticamente entre claro y oscuro cuando el elemento `<html>` tiene la clase `dark`, lo cual se activa con:
```js
document.documentElement.classList.toggle("dark");
```

---

## Archivos del sistema

| Archivo | Qué hace |
|---|---|
| `src/front/theme.css` | Define los valores de cada variable en claro y en oscuro |
| `tailwind.config.js` | Registra las clases `theme-*` para usarlas en el JSX |

---

## Clases disponibles

### Fondos

| Clase | Uso | Claro | Oscuro |
|---|---|---|---|
| `bg-theme-bg` | Fondo principal de página y paneles | `white` | `gray-950` |
| `bg-theme-subtle` | Fondo secundario, paneles expandidos | `gray-50` | `gray-900` |
| `bg-theme-muted` | Fondo hover, cards | `gray-100` | `gray-800` |
| `bg-theme-input` | Inputs y textareas | `gray-50` | `gray-800` |
| `bg-theme-tooltip` | Fondo de tooltips | `gray-900` | `gray-50` |

### Bordes

| Clase | Uso | Claro | Oscuro |
|---|---|---|---|
| `border-theme-border` | Borde estándar | `gray-200` | `gray-800` |
| `border-theme-border-sm` | Borde fino, divisores | `gray-100` | `gray-800` |
| `divide-theme-border-sm` | Divisor entre elementos de lista | `gray-100` | `gray-800` |

### Textos

| Clase | Uso | Claro | Oscuro |
|---|---|---|---|
| `text-theme-text` | Texto principal | `gray-900` | `gray-100` |
| `text-theme-secondary` | Texto secundario | `gray-700` | `gray-300` |
| `text-theme-muted` | Texto apagado | `gray-500` | `gray-400` |
| `text-theme-faint` | Placeholders y hints | `gray-400` | `gray-500` |
| `text-theme-disabled` | Texto deshabilitado | `gray-300` | `gray-600` |
| `text-theme-inverse` | Texto sobre fondo de color | `white` | `gray-900` |

### Estados

| Clase | Uso |
|---|---|
| `text-theme-success` / `bg-theme-success-bg` | Mensajes de éxito |
| `text-theme-warning` / `bg-theme-warning-bg` | Avisos |
| `text-theme-error` / `bg-theme-error-bg` | Errores de formulario |
| `text-theme-info` / `bg-theme-info-bg` | Mensajes informativos |

---

## Ejemplo de uso en un componente

```jsx
// Card genérica
<div className="bg-theme-bg border border-theme-border rounded-2xl p-4">
  <h2 className="text-theme-text font-semibold">Título</h2>
  <p className="text-theme-muted">Descripción secundaria</p>
  <input
    className="bg-theme-input border border-theme-border text-theme-text placeholder-theme-faint rounded-xl px-4 py-2"
    placeholder="Escribe algo..."
  />
</div>

// Badge de estado
<span className="bg-theme-success-bg text-theme-success px-2 py-1 rounded-full text-xs">
  Completado
</span>

// Divisor
<div className="border-t border-theme-border-sm my-4" />
```

---

## Cuándo NO usar clases theme-*

Los colores de acento y marca se siguen escribiendo con las clases normales de Tailwind, porque no cambian con el tema:

```jsx
// ✅ Correcto — colores de marca, no cambian con el tema
<button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
<span className="text-amber-500">
<div className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40">
```

---

## Añadir una nueva variable

### Paso 1 — Definir el valor en `theme.css`

Añade la variable dentro de `:root` (valor claro) y dentro de `.dark` (valor oscuro):

```css
:root {
  /* nueva variable */
  --color-bg-card: 255 255 255;   /* white */
}

.dark {
  /* nueva variable en oscuro */
  --color-bg-card: 24 24 27;      /* zinc-900 */
}
```

> Los valores van en formato `R G B` sin comas, sin `rgb()`. Esto permite que Tailwind gestione la opacidad con `/`.

### Paso 2 — Registrarla en `tailwind.config.js`

Añade la nueva entrada dentro del bloque `theme.colors`:

```js
theme: {
  // fondos
  bg:      "rgb(var(--color-bg) / <alpha-value>)",
  "bg-card": "rgb(var(--color-bg-card) / <alpha-value>)",  // ← nueva
  ...
}
```

### Paso 3 — Usarla en el JSX

```jsx
<div className="bg-theme-bg-card">
```

---

## Convención de nombres

```
--color-[tipo]-[variante]
```

| Tipo | Ejemplos de variante |
|---|---|
| `bg` | *(sin variante)*, `subtle`, `muted`, `input`, `card`, `tooltip` |
| `text` | *(sin variante)*, `secondary`, `muted`, `faint`, `disabled`, `inverse` |
| `border` | *(sin variante)*, `sm`, `focus` |
| `color` | `success`, `warning`, `error`, `info` + sus `-bg` |

Mantén los nombres en inglés y en minúsculas con guiones.