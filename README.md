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

Los teléfonos de contacto y el número de cuenta para los regalos **no están en
el repositorio**, porque es público. Hay que crear un `.env` en la raíz (ya está
en `.gitignore`):

```bash
TEL_LUCIA=+34XXXXXXXXX
TEL_MANUEL=+34XXXXXXXXX
IBAN=ESXXXXXXXXXXXXXXXXXXXXXX
```

Los teléfonos en formato internacional y sin espacios; el IBAN también sin
espacios. Si falta alguno **el build falla a propósito**: el bloque CONTACTO y
la respuesta del regalo son contenido esencial, así que preferimos que un
despliegue mal configurado se caiga y deje en pie la versión anterior, antes que
publicar la invitación sin forma de contactar o con una FAQ que promete un IBAN
que no aparece.

En CI los mismos valores llegan desde los secretos del entorno `github-pages`
(Settings > Environments > github-pages, con esos tres nombres); el workflow
escribe el `.env` dentro del runner justo antes de construir.

Además, ni `Informacion.astro` ni `Faq.astro` emiten los valores en claro en el
HTML: `src/lib/contacto.ts` los codifica en build y los recompone en el
navegador. Es una barrera contra rastreadores automáticos, **no** un secreto: la
web es pública y quien mire el `data-tel` o el `data-iban` con calma puede
deshacer la codificación.

## Estructura

```
src/pages/index.astro        entrada general
src/pages/vip.astro          entrada VIP
src/layouts/Layout.astro     head, fuentes, tokens de color, marco del "móvil"
src/components/
  Entrada.astro              monta las vistas y las turna con el hash
  Portada.astro              título, nombres, fecha y cuenta atrás
  Informacion.astro          cuándo, dónde, dress code, contacto y avance de los juegos
  Confirmacion.astro         formulario paso a paso (markup + lógica cliente)
  Historia.astro             cómic, vídeo de la pedida y la estrofa
  Participantes.astro        el juego de adivinar quién es quién
  Pokedex.astro              capturas de la boda (única pantalla con login)
  Gimnasios.astro            los ocho retos y sus medallas
  Album.astro                álbum compartido de Google Fotos
  Faq.astro                  preguntas frecuentes e IBAN de los regalos
  Pie.astro                  ilustración y firma
src/data/pokedex.ts          huecos de la Pokédex, gimnasios y preguntas frecuentes
src/lib/googleForm.ts        mapeo y envío al Google Form
src/lib/pokedex.ts           identidad y envío de las capturas
src/lib/medallas.ts          medallas de los gimnasios en localStorage
src/lib/contacto.ts          codificación de teléfonos e IBAN
src/assets/                  PNG originales (Astro los optimiza a WebP)
```

Todas las pantallas viven en la misma página y se turnan sin recargar: la
navegación está en `Entrada.astro`, y cada vista se enlaza por su hash
(`/#gimnasios`, `/#faq`...).

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
