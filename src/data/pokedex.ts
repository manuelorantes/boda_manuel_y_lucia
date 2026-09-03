/**
 * Los huecos de la Pokedex: con quien hay que fotografiarse durante la boda.
 *
 * Salen de la lista de participantes del video, pero NO son los mismos: se
 * quedan fuera quienes ya no estan y las mascotas, y cuatro fichas van con el
 * nombre recortado por lo mismo. La ficha del juego de adivinar
 * (src/data/participantes.ts) conserva el nombre completo; son dos listas
 * distintas a proposito.
 *
 * `foto` es el fichero en src/assets, sin extension, y sirve para pintar la
 * silueta de quien hay que atrapar.
 */
export interface Hueco {
  /** Numero de hueco. Es lo que se guarda en la hoja de calculo. */
  n: number;
  /** Fichero en src/assets, sin la extension .jpg. */
  foto: string;
  /** A quien hay que atrapar. */
  nombre: string;
}

export const HUECOS: Hueco[] = [
  { n: 1, foto: 'ale_josetxu', nombre: 'Ale y Josetxu' },
  { n: 2, foto: 'bea_simba', nombre: 'Bea' },
  { n: 3, foto: 'carlos', nombre: 'Carlos (Carlitos)' },
  { n: 4, foto: 'carmela_jose', nombre: 'Carmela y José' },
  { n: 5, foto: 'carmen', nombre: 'Prima Carmen' },
  { n: 6, foto: 'elvira_aitor_nora', nombre: 'Elvira, Aitor y Nora' },
  { n: 7, foto: 'estrella_cipri_samuel', nombre: 'Samuel, Estrella y Cipri' },
  { n: 8, foto: 'francisco', nombre: 'Francisco' },
  { n: 9, foto: 'ildefonso_victoria_jose_luis_ada_moka', nombre: 'Ildefonso, Victoria y Ada' },
  { n: 10, foto: 'irene', nombre: 'Irene' },
  { n: 11, foto: 'johanna', nombre: 'Johanna' },
  { n: 12, foto: 'juanma_sonia', nombre: 'Juanma y Sonia' },
  { n: 13, foto: 'julian_rosa_julian_sofia', nombre: 'Sofía, Julian, Julian y Rosa' },
  { n: 14, foto: 'laura_lola', nombre: 'Laura' },
  { n: 15, foto: 'lucia', nombre: 'Lucía' },
  { n: 16, foto: 'malena_javi_martina', nombre: 'Malena, Javi y Martina' },
  { n: 17, foto: 'manolo', nombre: 'Manolo' },
  { n: 18, foto: 'manuel_kiara', nombre: 'Manuel' },
  { n: 19, foto: 'marcos_andrea', nombre: 'Andrea y Marcos' },
  { n: 20, foto: 'maria', nombre: 'María' },
  { n: 21, foto: 'mariangeles', nombre: 'Mª Ángeles' },
  { n: 22, foto: 'nuria_juande', nombre: 'Nuria y Juande' },
  { n: 23, foto: 'Zaira', nombre: 'Zaira' },
];

/**
 * Los gimnasios: retos del dia. Se marcan a mano y viven solo en el movil del
 * invitado, sin login ni servidor. Si borra los datos del navegador los
 * pierde, y "Campeon de la Liga" se demuestra ensenando el movil.
 */
export interface Gimnasio {
  id: string;
  gimnasio: string;
  reto: string;
}

export const GIMNASIOS: Gimnasio[] = [
  { id: 'novios', gimnasio: 'GIMNASIO 1', reto: 'Hazte una foto con los novios' },
  { id: 'baile', gimnasio: 'GIMNASIO 2', reto: 'Baila con alguien que no conocías' },
  { id: 'brindis', gimnasio: 'GIMNASIO 3', reto: 'Brinda con alguien de la otra familia' },
  { id: 'cancion', gimnasio: 'GIMNASIO 4', reto: 'Canta tu placer culpable a viva voz' },
  { id: 'abuelos', gimnasio: 'GIMNASIO 5', reto: 'Saca a bailar a la persona más mayor de tu mesa' },
  { id: 'foto', gimnasio: 'GIMNASIO 6', reto: 'Consigue una foto de grupo con toda tu mesa' },
  { id: 'eevee', gimnasio: 'GIMNASIO 7', reto: 'Encuentra a Eevee y Mew escondidos en la boda' },
  { id: 'fiesta', gimnasio: 'GIMNASIO 8', reto: 'Aguanta hasta la última canción' },
];
