// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages de proyecto: la web se sirve en
  // https://manuelorantes.github.io/boda_manuel_y_lucia/
  //
  // Si mas adelante se usa un dominio propio, poner site: 'https://midominio.com'
  // y borrar la linea `base` (ademas de anadir public/CNAME).
  site: 'https://manuelorantes.github.io',
  base: '/boda_manuel_y_lucia',
});
