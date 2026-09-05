/**
 * Las medallas de los gimnasios.
 *
 * Viven solo en el movil del invitado, sin login y sin servidor: si borra los
 * datos del navegador las pierde, y "Campeon de la Liga" se demuestra
 * ensenando el movil. Esta aqui y no dentro de Gimnasios.astro porque la
 * portada tambien las lee, para pintar el avance en el bloque LOS GIMNASIOS.
 */
export const CLAVE_MEDALLAS = 'lm-gimnasios';

export type Medallas = Record<string, boolean>;

export function leerMedallas(): Medallas {
  try {
    const crudo = localStorage.getItem(CLAVE_MEDALLAS);
    const datos: unknown = crudo ? JSON.parse(crudo) : {};
    // Lo guardado puede ser de una version anterior de la web, o basura que
    // haya dejado otra pestana: si no es un objeto se empieza de cero.
    return datos && typeof datos === 'object' && !Array.isArray(datos) ? (datos as Medallas) : {};
  } catch {
    return {};
  }
}

export function guardarMedallas(medallas: Medallas) {
  try {
    localStorage.setItem(CLAVE_MEDALLAS, JSON.stringify(medallas));
  } catch {
    // Incognito o almacenamiento lleno: se sigue jugando sin recordar.
  }
}
