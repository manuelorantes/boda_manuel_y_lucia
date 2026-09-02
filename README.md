# Boda Lucía y Manuel

Web de la boda del **26 de diciembre de 2026** en Señorío de Nevada (Granada).
Los invitados llegan escaneando el QR impreso en su entrada.

Hecha con [Astro](https://astro.build), estática, mobile-first, publicada en GitHub Pages.

## Las dos entradas

| Ruta | Entrada | Diferencias |
|---|---|---|
| `/` | General | — |
| `/vip` | VIP | El título dice "Entrada VIP" y el formulario añade la pregunta de alojamiento |

La página general **no contiene ninguna referencia al alojamiento**: el paso ni siquiera
se renderiza en su HTML.

> **Ojo:** GitHub Pages es un hosting público. `/vip` es una URL accesible para
> cualquiera que la escriba, y el JS del formulario es compartido entre ambas
> páginas. Si el contenido VIP debe ser realmente reservado, esta pila no lo
> protege; haría falta otra solución.

## Desarrollo

Requiere **Node 22.12 o superior** (lo exige Astro 7; ver `.nvmrc`).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # comprueba tipos y genera dist/
npm run preview  # sirve dist/ en local
```

## Estructura

```
src/pages/index.astro        entrada general
src/pages/vip.astro          entrada VIP
src/layouts/Layout.astro     head, fuentes, tokens de color, marco del "móvil"
src/components/
  Portada.astro              título, nombres, fecha y cuenta atrás
  Informacion.astro          cuándo, dónde, dress code, contacto
  Confirmacion.astro         formulario paso a paso (markup + lógica cliente)
  Pie.astro                  ilustración y firma
src/lib/googleForm.ts        mapeo y envío al Google Form
src/assets/                  PNG originales (Astro los optimiza a WebP)
```

Las fuentes (`Cormorant Garamond`, `Pinyon Script`) van **autoalojadas** vía
`@fontsource`, para no depender de fonts.gstatic.com en móvil.

Las imágenes se importan desde `src/assets/` para que Astro las redimensione y
convierta a WebP: los 4,6 MB de PNG originales quedan en ~110 kB servidos.

Como el sitio se sirve bajo el subdirectorio `/boda_manuel_y_lucia/`, cualquier
ruta a ficheros de `public/` debe construirse con `import.meta.env.BASE_URL`
(ver `Layout.astro`). Las imágenes de `src/assets/` ya lo hacen solas.

## Confirmación de asistencia

El formulario paso a paso vive en `Confirmacion.astro` y envía por `POST` a un
Google Form (`src/lib/googleForm.ts`).

### Pendiente: faltan preguntas en el Google Form

El formulario actual **no tiene todas las preguntas del diseño**:

| Dato del diseño | Estado en el Google Form |
|---|---|
| Nombre, asistencia, acompañantes, niños, alergias, canción | ✅ existen |
| Nº de acompañantes / nº de niños | ⚠️ no hay campo: se antepone al de nombres (`2 · Ana, Juan`) |
| **Alojamiento (solo VIP)** | ❌ **no existe** |
| **Variante (vip/general)** | ❌ **no existe** |

Mientras no existan, alojamiento y variante se añaden como un bloque etiquetado
al final del campo de canciones, para no perder el dato. **Es un apaño**: en
cuanto se creen las preguntas en el Google Form, basta con poner sus
`entry.NNN` en `CAMPOS.alojamiento` y `CAMPOS.variante` (en `src/lib/googleForm.ts`)
y el añadido desaparece solo.

### Limitación del envío

Google no permite CORS en `formResponse`, así que el envío va con `mode:'no-cors'`
y la respuesta es **opaca**: la web no puede saber si Google aceptó la respuesta.
Solo se detecta un fallo de red. Conviene revisar las respuestas recibidas en el
Google Form durante los primeros días.

## Despliegue

Cada push a `main` dispara `.github/workflows/deploy.yml`, que compila y publica
en GitHub Pages.

Configuración necesaria una sola vez: Settings → Pages → Source: **GitHub Actions**.

### Dominio propio

1. En `astro.config.mjs`: cambiar `site` al dominio y **borrar** la línea `base`.
2. Crear `public/CNAME` con el dominio dentro.
3. En GitHub: Settings → Pages → Custom domain.

## Material de diseño

`design_handoff_boda_lucia_manuel/` contiene el prototipo original y las
imágenes en alta. Está fuera del control de versiones (ver `.gitignore`): es
referencia de diseño, no código de producción.
