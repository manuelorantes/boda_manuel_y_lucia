/**
 * Envio de la confirmacion al Google Form "Lucía y Manuel".
 *
 * Los identificadores salen de inspeccionar el formulario publicado:
 *   https://forms.gle/SyZpBEK8ZtBDYfMn7
 *   -> https://docs.google.com/forms/d/e/<ID>/viewform
 *
 * IMPORTANTE: el formulario actual NO tiene todas las preguntas del diseno.
 * Faltan "alojamiento" (solo VIP) y la "variante" (vip/general). Mientras no
 * existan, sus valores se anaden como un bloque etiquetado al final del campo
 * de canciones (ver `construirCanciones`), para no perder el dato. En cuanto
 * se creen las preguntas, basta con rellenar sus entry.NNN aqui abajo y el
 * anadido desaparece solo.
 */

const FORM_ID = '1FAIpQLSdB_EXBZe52feyTkiH7enpe2EEnrARKxIJJaOjMiL8qx1fK8w';

export const URL_ENVIO = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

export const CAMPOS = {
  nombre: 'entry.687752263',
  asistencia: 'entry.1232253509',
  acompanante: 'entry.1270883117',
  nombresAcompanantes: 'entry.487624958',
  ninos: 'entry.1640053261',
  nombresNinos: 'entry.409100859',
  alergias: 'entry.1257750731',
  canciones: 'entry.2020883208',
  /** Pendiente de crear en el Google Form. Poner aqui su entry.NNN. */
  alojamiento: null as string | null,
  /** Pendiente de crear en el Google Form. Poner aqui su entry.NNN. */
  variante: null as string | null,
} as const;

/** Las opciones deben coincidir LITERALMENTE con las del Google Form. */
const OPCIONES = {
  asistencia: { si: 'Sí, no me lo perdería.', no: 'No podré acompañaros.' },
  acompanante: { si: 'Sí, acudiré con acompañante.', no: 'No, acudiré solo.' },
  ninos: { si: 'Sí.', no: 'No.' },
};

export interface Respuestas {
  name: string;
  attend: boolean | null;
  guests: number;
  guestNames: string;
  kids: boolean | null;
  kidsN: number;
  kidsNames: string;
  allergies: string;
  song: string;
  lodge: boolean | null;
}

export type Variante = 'vip' | 'general';

/**
 * El formulario tiene secciones con saltos condicionales. Al enviar por POST
 * hay que declarar que paginas se "visitaron", o Google descarta la respuesta.
 * Indices: 0 datos, 1 despedida (no asiste), 2 acompanante, 3 datos
 * acompanantes, 4 datos ninos, 5 alimentacion, 6 fiesta.
 */
function historialPaginas(r: Respuestas): string {
  if (!r.attend) return '0,1';
  const paginas = [0, 2, 3];
  if (r.kids) paginas.push(4);
  paginas.push(5, 6);
  return paginas.join(',');
}

/**
 * El diseno pregunta cuantos acompanantes y cuantos ninos, pero el formulario
 * solo tiene un campo de texto para los nombres. Anteponemos el numero con el
 * mismo formato que usa el resumen: "2 · Ana Ruiz, Juan Perez".
 */
function conRecuento(n: number, nombres: string): string {
  const limpio = nombres.trim();
  if (!limpio) return String(n);
  return `${n} · ${limpio}`;
}

function construirCanciones(r: Respuestas, variante: Variante): string {
  const extra: string[] = [];
  if (!CAMPOS.variante) extra.push(`Entrada: ${variante === 'vip' ? 'VIP' : 'General'}`);
  if (!CAMPOS.alojamiento && variante === 'vip' && r.lodge !== null) {
    extra.push(`Alojamiento noche del 26: ${r.lodge ? 'Sí' : 'No'}`);
  }
  const cancion = r.song.trim();
  if (!extra.length) return cancion;
  // El separador solo tiene sentido si hay respuesta que separar
  return (cancion ? [cancion, '— — —', ...extra] : extra).join('\n');
}

export function construirCuerpo(r: Respuestas, variante: Variante): URLSearchParams {
  const cuerpo = new URLSearchParams();
  cuerpo.set(CAMPOS.nombre, r.name.trim());
  cuerpo.set(CAMPOS.asistencia, r.attend ? OPCIONES.asistencia.si : OPCIONES.asistencia.no);

  if (r.attend) {
    cuerpo.set(
      CAMPOS.acompanante,
      r.guests > 0 ? OPCIONES.acompanante.si : OPCIONES.acompanante.no,
    );
    if (r.guests > 0) {
      cuerpo.set(CAMPOS.nombresAcompanantes, conRecuento(r.guests, r.guestNames));
    }
    cuerpo.set(CAMPOS.ninos, r.kids ? OPCIONES.ninos.si : OPCIONES.ninos.no);
    if (r.kids) {
      cuerpo.set(CAMPOS.nombresNinos, conRecuento(r.kidsN, r.kidsNames));
    }
    cuerpo.set(CAMPOS.alergias, r.allergies.trim() || 'Ninguna');

    const canciones = construirCanciones(r, variante);
    if (canciones) cuerpo.set(CAMPOS.canciones, canciones);

    if (CAMPOS.alojamiento && variante === 'vip' && r.lodge !== null) {
      cuerpo.set(CAMPOS.alojamiento, r.lodge ? 'Sí' : 'No');
    }
  }

  if (CAMPOS.variante) cuerpo.set(CAMPOS.variante, variante);

  // Parametros que espera el backend de Google Forms
  cuerpo.set('fvv', '1');
  cuerpo.set('pageHistory', historialPaginas(r));
  cuerpo.set('submissionTimestamp', String(Date.now()));

  return cuerpo;
}

/**
 * Envia la respuesta. Google no permite CORS en este endpoint, asi que la
 * respuesta es opaca: si el fetch no lanza, damos el envio por bueno. Un fallo
 * de red si se propaga, para poder reintentar sin perder lo escrito.
 */
export async function enviar(r: Respuestas, variante: Variante): Promise<void> {
  await fetch(URL_ENVIO, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: construirCuerpo(r, variante).toString(),
  });
}
