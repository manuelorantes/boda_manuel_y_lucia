/**
 * Los que participaron en el video de la pedida.
 *
 * Cada tarjeta se juega en dos tiempos: primero la pista (`descripcion`) y
 * despues la solucion (`nombre`).
 *
 * El orden de este array NO es el orden en pantalla: la rejilla se baraja en
 * el navegador en cada carga, para que dos invitados mirando el movil a la vez
 * no vean las fichas en el mismo sitio. Aqui van alfabeticas para poder
 * encontrarlas al editar.
 *
 * `foto` es el nombre del fichero en src/assets, sin extension. Si no existe,
 * el build falla: mejor eso que publicar una ficha con el hueco vacio.
 */
export interface Participante {
  /** Fichero en src/assets, sin la extension .jpg. */
  foto: string;
  /** La solucion que se revela al pulsar "Solución". */
  nombre: string;
  /** La pista que se revela al pulsar "Pista". */
  descripcion: string;
}

export const PARTICIPANTES: Participante[] = [
  { foto: 'abuela', nombre: 'Eloisa DEP ⭐', descripcion: '¡Que croquetas hacía!' },
  { foto: 'abuelo', nombre: 'Manuel DEP ⭐', descripcion: 'Cuidaba las plantas mejor que tú' },
  {
    foto: 'ale_josetxu',
    nombre: 'Ale y Josetxu',
    descripcion: '¡Representando a la Oficina!',
  },
  { foto: 'ares', nombre: 'Ares', descripcion: 'Maravilloso y dios de la guerra como hobby' },
  {
    foto: 'bea_simba',
    nombre: 'Bea y Simba',
    descripcion: 'Vino y Ticket to ride a partes iguales',
  },
  {
    foto: 'bengala_pepe',
    nombre: 'Bengala y Pepe',
    descripcion: 'Cambio de cromos (nos llevamos a los buenos a casa)',
  },
  {
    foto: 'carlos',
    nombre: 'Carlos (Carlitos)',
    descripcion: 'Preparador físico y Sr Otoño en sus ratos libres',
  },
  {
    foto: 'carmela_jose',
    nombre: 'Carmela y José',
    descripcion: 'Viajeros empedernidos. La familia que se elige',
  },
  {
    foto: 'carmen',
    nombre: 'Prima Carmen',
    descripcion: 'No la retaría en un concurso de preguntas (no es mi prima)',
  },
  {
    foto: 'consuelo',
    nombre: 'Abuela Consuelo DEP ⭐',
    descripcion: 'A Manuel le pegaba con una sartén si se metía con su nieta',
  },
  {
    foto: 'doraimon',
    nombre: 'Doraimon DEP ⭐',
    descripcion: 'Amante de polvorones, siempre estaba cuando lo necesitabas',
  },
  {
    foto: 'elvira_aitor_nora',
    nombre: 'Elvira, Aitor y Nora',
    descripcion: '5 jugando al Arnak, 4 en la mesa y una en la barriga',
  },
  {
    foto: 'estrella_cipri_samuel',
    nombre: 'Estrella, Cipri y Samuel',
    descripcion: 'Igual te traen jamón, igual te esperan tras Japón',
  },
  { foto: 'francisco', nombre: 'Francisco', descripcion: 'Alma libre y arrolladora' },
  {
    foto: 'ildefonso_victoria_jose_luis_ada_moka',
    nombre: 'Ildefonso, Victoria, José Luis DEP ⭐, Ada y Moka',
    descripcion: 'Persiguieron a la novia en barco. De Ceuta a Granada',
  },
  {
    foto: 'irene',
    nombre: 'Irene',
    descripcion: 'Conexión mental y enciclopedia médica de la novia',
  },
  {
    foto: 'johanna',
    nombre: 'Johanna',
    descripcion: 'Le cambiamos 4 mudanzas por oficiar nuestra boda',
  },
  { foto: 'juanma_sonia', nombre: 'Juanma y Sonia', descripcion: 'Familia adoptiva' },
  {
    foto: 'julian_rosa_julian_sofia',
    nombre: 'Julian, Rosa, Julian y Sofía',
    descripcion: 'Médicos sin fronteras',
  },
  {
    foto: 'laura_lola',
    nombre: 'Laura y Lola DEP ⭐',
    descripcion: 'Celestina sin saberlo. Afortunados de tenerla como familia',
  },
  { foto: 'lucia', nombre: 'Lucía', descripcion: 'La novia' },
  {
    foto: 'malena_javi_martina',
    nombre: 'Malena, Javi y Martina',
    descripcion: 'Llama, grita si me necesitas',
  },
  { foto: 'manolo', nombre: 'Manolo', descripcion: 'Ajedrez y gallinas llenan su vida' },
  {
    foto: 'manuel_kiara',
    nombre: 'Manuel y Kiara DEP ⭐',
    descripcion: 'El novio y patapollo',
  },
  { foto: 'marcos_andrea', nombre: 'Marcos y Andrea', descripcion: 'Son los siguientes' },
  { foto: 'maria', nombre: 'María', descripcion: 'Representando a la Familia Orantes' },
  {
    foto: 'mariangeles',
    nombre: 'Mª Ángeles',
    descripcion: 'Relaciones públicas de la familia y amante del chocolate negro',
  },
  {
    foto: 'mikaela',
    nombre: 'Micaela',
    descripcion: 'Llorona incansable hasta conseguir cariño',
  },
  { foto: 'nala_oddye', nombre: 'Nala y Oddye DEP ⭐', descripcion: 'Guardianes protectores' },
  {
    foto: 'nuria_juande',
    nombre: 'Nuria y Juande',
    descripcion: 'Prima verdadera y okupas del huerto',
  },
  { foto: 'teresa_david', nombre: 'Teresa y David', descripcion: 'En la distancia...' },
  {
    foto: 'Zaira',
    nombre: 'Zaira',
    descripcion: 'Matemática presumida. Cómplice de nuestra historia',
  },
];
