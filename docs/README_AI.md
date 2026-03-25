<p align="center">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853455/logo_navbar_playback_v1.png#gh-light-mode-only" alt="Playback" height="52">
  <img src="https://res.cloudinary.com/playback-assets/image/upload/v1772853456/logo_navbar_playback_vdark.png#gh-dark-mode-only" alt="Playback" height="52">
</p>

# 🤖 IA — Asistente de búsqueda con Groq

Playback integra un asistente de búsqueda conversacional usando la **API de Groq** para ayudar a los compradores a encontrar productos del catálogo.

---

## 1. Crear cuenta y obtener API key

1. Regístrate en [console.groq.com](https://console.groq.com)
2. Ve a **API Keys → Create API Key**
3. Copia la clave generada

---

## 2. Variable de entorno

```env
VITE_GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXX
```

> La clave se expone al cliente mediante el prefijo `VITE_` porque las llamadas a Groq se hacen directamente desde el frontend. Groq ofrece rate limiting por clave, lo cual es suficiente para la fase MVP.

Recuerda reiniciar el frontend tras añadir o modificar esta variable:
```bash
npm run start
```

---

## 3. Modelo utilizado

```
llama3-8b-8192
```

Modelo rápido y gratuito dentro del plan de Groq, adecuado para consultas de búsqueda en tiempo real.

---

## 4. Límites del plan gratuito

| Recurso | Límite |
|---|---|
| Requests/minuto | 30 |
| Tokens/minuto | 14.400 |
| Tokens/día | 500.000 |

Suficiente para desarrollo y uso moderado durante el MVP.

---

## Resolución de problemas

**El asistente no responde**
- Verifica que `VITE_GROQ_API_KEY` está configurada en `.env`
- Reinicia el frontend — las variables `VITE_*` requieren restart para aplicarse
- Comprueba en [console.groq.com](https://console.groq.com) que la clave no haya sido revocada

**Error de rate limit (429)**
- El plan gratuito tiene límites por minuto — espera unos segundos y reintenta
- Si es un problema recurrente en producción, considera mover las llamadas al backend para centralizar la gestión de la clave y el rate limiting

---

## <a href="../README.md"><img src="https://img.shields.io/badge/←_Volver_al_README_principal-8b5cf6?style=for-the-badge" /></a>