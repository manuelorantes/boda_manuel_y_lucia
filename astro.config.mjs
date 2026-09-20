// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Dónde se sirve la web.
 *
 * GitHub Pages solo publica UN sitio por repositorio, así que producción y
 * staging conviven dentro del mismo despliegue y se distinguen por el
 * subdirectorio:
 *
 *   producción  https://manuelorantes.github.io/boda_manuel_y_lucia/
 *   staging     https://manuelorantes.github.io/boda_manuel_y_lucia/staging/
 *
 * El workflow compila dos veces con `BASE_PATH` distinto. En local no hace
 * falta definir nada: sin la variable se compila como producción.
 *
 * Si más adelante se usa un dominio propio, poner site: 'https://midominio.com'
 * y dejar BASE_PATH en '/' (además de añadir public/CNAME).
 */
// `process` no esta tipado (no hay @types/node y no merece la pena anadirlo
// solo para esto), asi que se lee por globalThis para que `astro check` pase.
const env = /** @type {Record<string, string | undefined>} */ (
  /** @type {any} */ (globalThis).process?.env ?? {}
);
const base = env.BASE_PATH ?? '/boda_manuel_y_lucia';

// https://astro.build/config
export default defineConfig({
  site: 'https://manuelorantes.github.io',
  base,
});
