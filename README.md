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

### Variables de entorno

Los teléfonos de contacto **no están en el repositorio**, porque es público. Hay
que crear un `.env` en la raíz (ya está en `.gitignore`):

```bash
TEL_LUCIA=+34XXXXXXXXX
TEL_MANUEL=+34XXXXXXXXX
```

En formato internacional y sin espacios. Si falta alguno **el build falla a
propósito**: el bloque CONTACTO es contenido esencial, así que preferimos que un
despliegue mal configurado se caiga y deje en pie la versión anterior, antes que
publicar la invitación sin forma de contactar.

En CI los mismos valores llegan desde los secretos del repositorio (Settings >
Secrets and variables > Actions, con esos dos nombres); el workflow escribe el
`.env` dentro del runner justo antes de construir.

Además, `Informacion.astro` no emite los números en claro en el HTML: los
codifica en build y los recompone en el navegador. Es una barrera contra
rastreadores automáticos, **no** un secreto: la web es pública y quien mire el
`data-tel` con calma puede deshacer la codificación.

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

### El Google Form

Formulario de **una sola página, sin secciones y con todas las preguntas
opcionales y de texto libre**. Es deliberado: como enviamos por `POST` directo
en vez de rellenar el formulario real, cualquier validación de Google (campos
obligatorios, o opciones cerradas que deben coincidir letra a letra) solo puede
rechazar la respuesta, y al ser opaca no nos enteraríamos. Quien valida es la
web, en `Confirmacion.astro`.

Las 11 preguntas se mapean una a una en `CAMPOS` (`src/lib/googleForm.ts`),
incluidas la variante de entrada y el alojamiento. Si se edita el formulario y
cambian los `entry.NNN`, se recuperan del HTML de `/viewform`, dentro de
`FB_PUBLIC_LOAD_DATA_`.

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
