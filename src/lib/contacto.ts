/**
 * Datos personales que no viven en el repositorio.
 *
 * Los telefonos entran en tiempo de build desde variables de entorno (.env en
 * local, secretos de Actions en CI) y se emiten codificados, para que quien
 * rastree el HTML publicado no se los lleve en texto plano; el valor se
 * recompone en el navegador.
 *
 * Esto disuade a los rastreadores automaticos, NO oculta el dato: la web es
 * publica y cualquiera que mire con calma puede deshacer la codificacion. Lo
 * que evita es que el numero acabe indexado o en una lista de spam por el
 * simple hecho de estar escrito en el HTML.
 */

/** Codifica en el build: base64 de la cadena invertida. */
export const ofuscar = (valor: string) => btoa([...valor.trim()].reverse().join(''));

/** Deshace la codificacion en el navegador. */
export const revelar = (codigo: string) => [...atob(codigo)].reverse().join('');

/** +34600123456 -> 600 123 456 */
export const telefonoParaLeer = (tel: string) =>
  tel
    .replace(/^\+34/, '')
    .replace(/(\d{3})(?=\d)/g, '$1 ')
    .trim();
