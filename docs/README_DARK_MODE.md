<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="52">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="52">
</p>

# Sistema de Temas

Sistema de colores semánticos para gestionar el **modo claro y oscuro** sin escribir clases `dark:` en cada componente.

---

# Cómo funciona

En lugar de escribir los colores dos veces:

```jsx
// ❌ Antes
<div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
```

Usas una sola clase semántica:

```jsx
// ✅ Ahora
<div className="bg-main text-main">
```

El sistema cambia automáticamente entre **modo claro y oscuro** cuando el elemento `<html>` tiene la clase `dark`.

```js
document.documentElement.classList.toggle("dark");
```

Los colores se gestionan mediante **variables CSS (`--color-*`)** definidas en `theme.css`.

---

# Archivos del sistema

| Archivo               | Qué hace                                                               |
| --------------------- | ---------------------------------------------------------------------- |
| `src/front/theme.css` | Define todas las variables de color y sombras para modo claro y oscuro |
| `tailwind.config.js`  | Permite usar las variables dentro de Tailwind                          |
| `@layer components`   | Define clases reutilizables (`btn`, `card`, `input`, etc.)             |

---

# Clases disponibles

## Fondos

| Clase       | Uso                            |
| ----------- | ------------------------------ |
| `bg-main`   | Fondo principal de la página   |
| `bg-subtle` | Fondo secundario (paneles)     |
| `bg-muted`  | Fondo hover o tarjetas ligeras |

---

## Textos

| Clase        | Uso                    |
| ------------ | ---------------------- |
| `text-main`  | Texto principal        |
| `text-sub`   | Texto secundario       |
| `text-muted` | Texto menos importante |
| `text-faint` | Placeholders o hints   |

---

## Bordes

| Clase         | Uso            |
| ------------- | -------------- |
| `border-main` | Borde estándar |

---

# Componentes reutilizables

Estas clases ya están preparadas para reutilizarse en toda la app.

---

## Botones

### Botón principal

```jsx
<button className="btn-primary">
Guardar
</button>
```

### Botón secundario

```jsx
<button className="btn-secondary">
Cancelar
</button>
```

### Botón ghost

```jsx
<button className="btn-ghost">
Ver más
</button>
```

### Botón peligro

```jsx
<button className="btn-danger">
Eliminar
</button>
```

---

## Tarjetas

```jsx
<div className="card p-4">
  <h2 className="text-main font-semibold">Título</h2>
  <p className="text-muted">Descripción secundaria</p>
</div>
```

La clase `card` ya incluye:

* fondo semántico
* borde
* sombra
* bordes redondeados

---

## Inputs

```jsx
<input
  className="input"
  placeholder="Escribe algo..."
/>
```

La clase `input` ya incluye:

* fondo correcto según tema
* borde
* placeholder semántico
* focus accesible

---

# Ejemplo completo

```jsx
<div className="card p-6 space-y-4">

  <h2 className="text-main text-lg font-semibold">
    Perfil
  </h2>

  <p className="text-sub">
    Actualiza tu información
  </p>

  <input
    className="input"
    placeholder="Nombre"
  />

  <div className="flex gap-3">
    <button className="btn-primary">
      Guardar
    </button>

    <button className="btn-secondary">
      Cancelar
    </button>
  </div>

</div>
```

---

# Cuándo NO usar las clases semánticas

Los **colores de marca** no deben depender del tema.

Ejemplo correcto:

```jsx
<button className="bg-violet-600 hover:bg-violet-700 text-white">
```

```jsx
<span className="text-amber-500">
```

```jsx
<div className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40">
```

---

# Variables principales del sistema

Estas variables están definidas en `theme.css`.

---

## Fondos

```
--color-bg
--color-bg-subtle
--color-bg-muted
--color-bg-input
--color-bg-tooltip
```

---

## Bordes

```
--color-border
--color-border-sm
--color-border-focus
```

---

## Textos

```
--color-text
--color-text-secondary
--color-text-muted
--color-text-faint
--color-text-disabled
--color-text-inverse
--color-text-tooltip
```

---

## Estados

```
--color-success
--color-warning
--color-error
--color-info
```

Fondos de estado:

```
--color-success-bg
--color-warning-bg
--color-error-bg
--color-info-bg
```

---

## Sombras

```
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
```

---

## Scrollbar

```
--color-scrollbar
--color-scrollbar-thumb
```

---

# Convención de nombres

Las variables siguen esta estructura:

```
--color-[tipo]-[variante]
```

Ejemplos:

| Tipo     | Ejemplos                                             |
| -------- | ---------------------------------------------------- |
| `bg`     | `bg`, `bg-subtle`, `bg-muted`, `bg-input`            |
| `text`   | `text`, `text-secondary`, `text-muted`, `text-faint` |
| `border` | `border`, `border-sm`, `border-focus`                |
| `state`  | `success`, `warning`, `error`, `info`                |

---

💡 **Ventaja del sistema**

1. No necesitas usar `dark:` en cada componente.
2. Si cambias un color, **toda la app se actualiza**.
3. Mantiene **consistencia visual automática**.
