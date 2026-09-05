/**
 * Datos personales que no viven en el repositorio.
 *
 * Los telefonos y el numero de cuenta entran en tiempo de build desde
 * variables de entorno (.env en local, secretos de Actions en CI) y se emiten
 * codificados, para que quien rastree el HTML publicado no se los lleve en
 * texto plano; el valor se recompone en el navegador.
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

/** ES8900730100590653672785 -> ES89 0073 0100 5906 5367 2785 */
export const ibanParaLeer = (iban: string) => iban.replace(/(.{4})/g, '$1 ').trim();

/**
 * Lee una variable de entorno obligatoria y la devuelve ya codificada.
 *
 * Si falta, corta el build a proposito: mas vale que un despliegue mal
 * configurado falle y deje en pie la version anterior, antes que publicar la
 * invitacion sin forma de contactar o sin el numero de cuenta que la propia
 * pagina promete.
 */
export function ofuscarObligatorio(valor: string | undefined, variable: string, donde: string) {
  if (!valor) {
    throw new Error(
      `[${donde}] Falta ${variable}. Crea un .env local (ver README) o define el ` +
        'secreto del repositorio en Actions.',
    );
  }
  return ofuscar(valor);
}
