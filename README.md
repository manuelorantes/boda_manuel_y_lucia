# Boda Manuel y Lucia

Web estatica de la boda, hecha con [Astro](https://astro.build) y publicada en GitHub Pages.

**URL:** https://manuelorantes.github.io/boda_manuel_y_lucia/

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
public/                 ficheros servidos tal cual (favicon, imagenes, CNAME...)
src/layouts/            plantillas HTML compartidas
src/pages/              cada .astro aqui es una ruta de la web
astro.config.mjs        configuracion (site + base para GitHub Pages)
.github/workflows/      despliegue automatico
```

## Despliegue

Cada push a `main` dispara el workflow `.github/workflows/deploy.yml`, que compila
el sitio y lo publica en GitHub Pages.

**Configuracion necesaria una sola vez** en GitHub:
Settings -> Pages -> Build and deployment -> Source: **GitHub Actions**.

### Dominio propio

Para servir la web en un dominio propio en vez de en `github.io`:

1. En `astro.config.mjs`: cambiar `site` al dominio y **borrar** la linea `base`.
2. Crear `public/CNAME` con el dominio dentro (una sola linea, sin `https://`).
3. En GitHub: Settings -> Pages -> Custom domain.

## Nota sobre rutas

Como la web se sirve bajo el subdirectorio `/boda_manuel_y_lucia/`, los enlaces y
rutas a ficheros de `public/` deben construirse con `import.meta.env.BASE_URL`
(ver `src/layouts/Layout.astro`), nunca con rutas absolutas tipo `/favicon.svg`.
