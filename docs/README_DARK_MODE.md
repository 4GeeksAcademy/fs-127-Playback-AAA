<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="52">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="52">
</p>

# 🌗 Sistema de temas

Sistema de colores semánticos para gestionar el **modo claro y oscuro** sin escribir clases `dark:` en cada componente.

---

## Cómo funciona

En lugar de duplicar estilos por tema:

```jsx
// ❌ Sin el sistema
<div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
```

Usas una sola clase semántica:

```jsx
// ✅ Con el sistema
<div className="bg-main text-main">
```

El sistema cambia automáticamente cuando el elemento `<html>` tiene la clase `dark`:

```js
document.documentElement.classList.toggle("dark");
```

Los colores están definidos en `src/front/theme.css` como variables CSS, y expuestos en `tailwind.config.js` para usarlos como clases de Tailwind.

---

## Archivos del sistema

| Archivo | Qué hace |
|---|---|
| `src/front/theme.css` | Define variables de color y sombras para modo claro y oscuro |
| `tailwind.config.js` | Conecta las variables CSS con Tailwind |
| `@layer components` | Define clases reutilizables (`btn-*`, `card`, `input`, etc.) |

---

## Clases disponibles

### Fondos

| Clase | Uso |
|---|---|
| `bg-main` | Fondo principal de la página |
| `bg-subtle` | Fondo secundario (paneles, sidebars) |
| `bg-muted` | Fondo hover o tarjetas ligeras |

### Textos

| Clase | Uso |
|---|---|
| `text-main` | Texto principal |
| `text-sub` | Texto secundario |
| `text-muted` | Texto menos importante |
| `text-faint` | Placeholders o hints |

### Bordes

| Clase | Uso |
|---|---|
| `border-main` | Borde estándar |

---

## Componentes reutilizables

### Botones

```jsx
<button className="btn-primary">Guardar</button>
<button className="btn-secondary">Cancelar</button>
<button className="btn-ghost">Ver más</button>
<button className="btn-danger">Eliminar</button>
```

### Tarjetas

```jsx
<div className="card p-4">
  <h2 className="text-main font-semibold">Título</h2>
  <p className="text-muted">Descripción secundaria</p>
</div>
```

La clase `card` incluye: fondo semántico, borde, sombra y bordes redondeados.

### Inputs

```jsx
<input className="input" placeholder="Escribe algo..." />
```

La clase `input` incluye: fondo correcto según tema, borde, placeholder semántico y focus accesible.

---

## Ejemplo completo

```jsx
<div className="card p-6 space-y-4">
  <h2 className="text-main text-lg font-semibold">Perfil</h2>
  <p className="text-sub">Actualiza tu información</p>
  <input className="input" placeholder="Nombre" />
  <div className="flex gap-3">
    <button className="btn-primary">Guardar</button>
    <button className="btn-secondary">Cancelar</button>
  </div>
</div>
```

---

## Cuándo NO usar las clases semánticas

Los **colores de marca** no deben depender del tema. Úsalos directamente con las clases de Tailwind:

```jsx
<button className="bg-violet-600 hover:bg-violet-700 text-white">
<span className="text-amber-500">
<div className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40">
```

---

## Variables CSS del sistema

Definidas en `theme.css`. Para cambiar un color en toda la app basta con modificar la variable aquí.

### Fondos
```
--color-bg
--color-bg-subtle
--color-bg-muted
--color-bg-input
--color-bg-tooltip
```

### Textos
```
--color-text
--color-text-secondary
--color-text-muted
--color-text-faint
--color-text-disabled
--color-text-inverse
--color-text-tooltip
```

### Bordes
```
--color-border
--color-border-sm
--color-border-focus
```

### Estados
```
--color-success   --color-success-bg
--color-warning   --color-warning-bg
--color-error     --color-error-bg
--color-info      --color-info-bg
```

### Sombras
```
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
```

### Scrollbar
```
--color-scrollbar
--color-scrollbar-thumb
```

---

## Convención de nombres

```
--color-[tipo]-[variante]
```

| Tipo | Ejemplos |
|---|---|
| `bg` | `bg`, `bg-subtle`, `bg-muted`, `bg-input` |
| `text` | `text`, `text-secondary`, `text-muted`, `text-faint` |
| `border` | `border`, `border-sm`, `border-focus` |
| `state` | `success`, `warning`, `error`, `info` |

> 💡 Al cambiar una variable en `theme.css` **toda la app se actualiza** — no es necesario tocar los componentes.

 ---

## <a href="../README.md"><img src="https://img.shields.io/badge/←_Volver_al_README_principal-8b5cf6?style=for-the-badge" /></a>