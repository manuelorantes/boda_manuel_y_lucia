/**
 * Los que participaron en el video de la pedida.
 *
 * Cada tarjeta se juega en dos tiempos: primero la pista (`descripcion`) y
 * despues la solucion (`nombre`). El orden de este array es el orden de la
 * rejilla.
 *
 * PENDIENTE: el diseno solo trae dos fichas reales; las 18 restantes son
 * marcadores. Sustituye `nombre` y `descripcion` de cada una, y borra las que
 * sobren: la rejilla se ajusta sola al tamano del array.
 */
export interface Participante {
  /** Numero de ficha, tambien el pie del hueco de la foto. */
  n: number;
  /** La solucion que se revela al pulsar "Solucion". */
  nombre: string;
  /** La pista que se revela al pulsar "Pista". */
  descripcion: string;
}

export const PARTICIPANTES: Participante[] = [
  { n: 1, nombre: 'Lucía', descripcion: 'La novia' },
  { n: 2, nombre: 'Ale y Josetxu', descripcion: '¡Representando a la Oficina!' },
  ...Array.from({ length: 18 }, (_, i) => ({
    n: i + 3,
    nombre: 'Nombre',
    descripcion: 'Descripción breve',
  })),
];
