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
  /**
   * Como encaja la foto en el cuadro de la silueta.
   *
   * Por defecto se recorta del centro, que va bien casi siempre. "arriba"
   * salva las verticales con las caras pegadas al borde superior, y
   * "completa" encaja la foto entera sin recortar: es para las de grupo
   * apaisadas, donde el recorte se lleva por delante a los de los extremos.
   */
  encuadre?: 'arriba' | 'centro' | 'abajo' | 'completa';
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
  {
    n: 9,
    foto: 'ildefonso_victoria_jose_luis_ada_moka',
    nombre: 'Ildefonso, Victoria y Ada',
    // Grupo apaisado: recortada al cuadro se pierden los de los extremos.
    encuadre: 'completa',
  },
  { n: 10, foto: 'irene', nombre: 'Irene' },
  { n: 11, foto: 'johanna', nombre: 'Johanna' },
  { n: 12, foto: 'juanma_sonia', nombre: 'Juanma y Sonia' },
  { n: 13, foto: 'julian_rosa_julian_sofia', nombre: 'Sofía, Julian, Julian y Rosa' },
  { n: 14, foto: 'laura_lola', nombre: 'Laura' },
  { n: 15, foto: 'lucia', nombre: 'Lucía' },
  { n: 16, foto: 'malena_javi_martina', nombre: 'Malena, Javi y Martina' },
  { n: 17, foto: 'manolo', nombre: 'Manolo' },
  { n: 18, foto: 'manuel_kiara', nombre: 'Manuel' },
  {
    n: 19,
    foto: 'marcos_andrea',
    nombre: 'Andrea y Marcos',
    // Las dos caras estan pegadas al borde superior de una foto vertical.
    encuadre: 'arriba',
  },
  { n: 20, foto: 'maria', nombre: 'María' },
  { n: 21, foto: 'mariangeles', nombre: 'Mª Ángeles' },
  {
    n: 22,
    foto: 'nuria_juande',
    nombre: 'Nuria y Juande',
    // La foto es vertical y las dos caras estan en la mitad de arriba: el
    // recorte centrado le cortaba la cabeza a Juande.
    encuadre: 'arriba',
  },
  { n: 23, foto: 'Zaira', nombre: 'Zaira' },
];

/**
 * Los gimnasios: retos del dia.
 *
 * Las medallas se marcan a mano y viven solo en el movil del invitado, sin
 * login: si borra los datos del navegador las pierde, y "Campeon de la Liga"
 * se demuestra ensenando el movil.
 *
 * El BLOQUEO, en cambio, no vive aqui ni en el movil: lo manda el Apps Script
 * (pestana `Gimnasios` de la hoja) y es igual para todos. Asi los novios
 * abren un reto desde el panel y les cambia a los ciento y pico invitados a
 * la vez. Ver src/lib/retos.ts.
 */
export interface Gimnasio {
  id: string;
  gimnasio: string;
  /**
   * Titulo y texto del reto. Los ocho lo tienen aqui, tambien los que nacen
   * bloqueados: asi la pantalla se lee entera aunque el movil se quede sin
   * cobertura o el Apps Script no conteste.
   *
   * Las columnas `reto` y `descripcion` de la hoja mandan sobre esto cuando
   * vienen escritas, que es el apano para corregir una errata el mismo dia sin
   * volver a desplegar la web.
   */
  reto: string;
  descripcion: string;
  /**
   * Fichero PNG en src/assets, sin extension. Opcional: si la imagen todavia
   * no esta en el repositorio, la tarjeta se queda con el texto en vez de
   * romper el build.
   */
  imagen?: string;
  /**
   * Con que estado se pinta antes de que conteste el servidor. Solo es el
   * punto de partida: quien manda es la hoja, y los novios lo cambian desde
   * /panel.
   */
  bloqueadoPorDefecto?: boolean;
}

export const GIMNASIOS: Gimnasio[] = [
  {
    id: 'smeargle',
    gimnasio: 'GIMNASIO 1',
    reto: 'Poké-Artistas Avanzados',
    imagen: 'smeargle',
    descripcion:
      '«Un Smeargle solitario no puede terminar su obra maestra. Se requiere la colaboración de ' +
      'toda la región. ¡Acércate al lienzo y deja tu huella! Ya sea una línea abstracta o un ' +
      'dibujo simple, vuestra creatividad combinada formará el cuadro legendario de esta unión. ' +
      '¿Estás listo para usar tu movimiento "Esquema"?»',
  },
  {
    id: 'recuerdo',
    gimnasio: 'GIMNASIO 2',
    reto: 'Pokédex de recuerdo',
    imagen: 'rotom',
    descripcion:
      '«Se ha descubierto un nuevo Pokémon legendario: ¡La Felicidad Matrimonial! Tu misión es ' +
      'documentarlo. Captura tu sonrisa con la Polaroid, pégala en la carta Pokémon y escribe tu ' +
      'ataque más potente (una dedicatoria) por detrás. Necesitamos completar esta Pokédex para ' +
      'que las futuras generaciones conozcan esta historia.»',
  },
  {
    id: 'karaoke',
    gimnasio: 'GIMNASIO 3',
    reto: 'El Canto del Jigglypuff (sin dormirnos)',
    imagen: 'jigglypuff',
    descripcion:
      '«¿Crees que tienes un vozarrón como el de un Exploud o la gracia de un Jigglypuff? ' +
      '¡Demuéstralo en el escenario! Para conseguir esta medalla, debes subir al karaoke y cantar ' +
      'una canción con pasión. Tu energía debe ser tan alta que incluso un Snorlax se levantaría a ' +
      'bailar.»',
  },
  {
    id: 'delibird',
    gimnasio: 'GIMNASIO 4',
    reto: 'El Festival de Invierno de Ciudad Mayólica',
    imagen: 'delibird',
    descripcion:
      '«Se rumorea que hay invitados entrenados por Delibird en esta boda. ¿Eres uno de ellos? Si ' +
      'has traído un detalle navideño escondido entre tu outfit, ¡es hora de revelarlo al Líder ' +
      'del Gimnasio (u organizador)! Demuestra que tienes espíritu festivo incluso en los momentos ' +
      'más elegantes.»',
  },
  {
    id: 'sudowoodo',
    gimnasio: 'GIMNASIO 5',
    reto: '¡Hazte con Todos (los que están en la sala)!',
    imagen: 'sudowoodo',
    descripcion:
      '«Varios Pokémon salvajes se han colado en la recepción y se están escondiendo. Son tímidos, ' +
      'pero un buen entrenador sabe dónde buscar. Encuentra al menos a 3 de ellos por la ' +
      'habitación para demostrar tu agudeza visual. ¡No olvides reportar tu captura!»',
  },
  {
    id: 'alakazam',
    gimnasio: 'GIMNASIO 6',
    reto: 'El Desafío Intelectual de Ciudad Luminalia',
    imagen: 'alakazam',
    descripcion:
      '«Un Alakazam ha bloqueado el camino con puzles mentales. Solo los entrenadores con gran ' +
      'intelecto podrán pasar. Sé el primero en resolver los acertijos que se plantearán. Este ' +
      'desafío requiere paciencia y una mente fría. ¿Tienes la Inteligencia suficiente para esta ' +
      'medalla?»',
  },
  // Los dos ultimos nacen bloqueados porque se abren avanzada la fiesta, pero
  // por lo demas son retos como los otros seis: su texto vive aqui igual.
  {
    id: 'snorlax',
    gimnasio: 'GIMNASIO 7',
    reto: 'Bayas Mágicas',
    imagen: 'snorlax',
    bloqueadoPorDefecto: true,
    descripcion:
      '«Llegó el momento de recargar energía con las Bayas de la casa. ¡Snorlax se ha despertado y ' +
      'el gran festín de galletas ha comenzado! Reta a otro invitado a una competencia amistosa en ' +
      'el rincón dulce. ¿Quién puede comerse la galleta más rápido sin usar las manos? Demuestra ' +
      'tu velocidad técnica culinaria con deportividad y que la suerte te acompañe.»',
  },
  {
    id: 'porygon',
    gimnasio: 'GIMNASIO 8',
    reto: 'Desafío de la Sala Recreativa',
    imagen: 'porygon',
    bloqueadoPorDefecto: true,
    descripcion:
      '«Reta a otro invitado a una partida rápida en la zona de juego (billar o mesa recreativa). ' +
      'No hace falta ganar la partida, solo demostrar deportividad y juego limpio en el tapete.»',
  },
];

/**
 * Las preguntas frecuentes.
 *
 * La del regalo lleva `iban: true`: es la unica que pinta el bloque con el
 * numero de cuenta, que no vive aqui sino en una variable de entorno (ver
 * src/components/Faq.astro).
 */
export interface Pregunta {
  q: string;
  a: string;
  iban?: boolean;
}

export const PREGUNTAS: Pregunta[] = [
  {
    q: '¿Hasta cuándo puedo confirmar?',
    a: 'Hasta el 30 de noviembre de 2026. Si algo cambia después, escríbenos directamente.',
  },
  {
    q: '¿Puedo llevar acompañante?',
    a: 'Indícalo en el formulario de confirmación, con su nombre y apellidos, y contamos con él o ella.',
  },
  {
    q: '¿Pueden venir niños?',
    a: 'Sí. Dinos cuántos y sus nombres en el formulario para preparar su menú y su sitio.',
  },
  {
    q: '¿Qué me pongo?',
    a:
      'Etiqueta: ropa elegante para una fiesta pero cómoda para disfrutar. Cualquier color, sobre ' +
      'todo los navideños. No se admite el blanco.',
  },
  {
    q: '¿Hay parking?',
    a: 'Sí, el Señorío de Nevada incluye parking para todos los invitados.',
  },
  {
    q: '¿Tengo alguna alergia o intolerancia, qué hago?',
    a: 'Cuéntanoslo en el formulario, también las de tus acompañantes, y lo trasladamos a cocina.',
  },
  {
    q: '¿Habrá menú vegetariano?',
    a: 'Sí. Indícanoslo en la parte de alergias e intolerancias del formulario y no habrá ningún problema.',
  },
  {
    q: '¿Habrá recena?',
    a:
      'Sí. A media fiesta habrá recena para recuperar fuerzas y seguir bailando hasta la última ' +
      'canción, así que no os preocupéis por el hambre.',
  },
  {
    q: '¿Cómo podemos haceros un regalo?',
    a:
      'Lo más importante para nosotros es celebrar nuestro día junto a vosotros. Si queréis ' +
      'contribuir a nuestras futuras aventuras con un detalle, podéis hacerlo aquí:',
    iban: true,
  },
  {
    q: '¿Necesito iniciar sesión para algo?',
    a:
      'Solo para la Pokédex, que guarda tus capturas y las envía a nuestro nombre. Confirmar ' +
      'asistencia, los gimnasios y ver la información no requieren ninguna cuenta.',
  },
  {
    q: '¿Dónde subo mis fotos de la boda?',
    a:
      'En el álbum compartido, desde el apartado "Vuestras fotos". Guarda el QR: ahí publicaremos ' +
      'nuestra selección después.',
  },
];
