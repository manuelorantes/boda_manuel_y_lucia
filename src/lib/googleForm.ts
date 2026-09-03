/**
 * Envio de la confirmacion al Google Form "Formulario boda Manuel y lucia".
 *
 * Los identificadores salen de inspeccionar el formulario publicado
 * (FB_PUBLIC_LOAD_DATA_ dentro del HTML de /viewform).
 *
 * El formulario es de una sola pagina, sin secciones y con todas las
 * preguntas opcionales y de texto libre. Eso es deliberado: como enviamos por
 * POST directo en vez de rellenar el formulario real, cualquier validacion de
 * Google (campos obligatorios, opciones cerradas que deben coincidir letra a
 * letra) solo puede rechazar la respuesta, y al ser opaca no nos enterariamos.
 * Quien valida es la web, en `Confirmacion.astro`.
 */

const FORM_ID = '1FAIpQLSf5gHF5triyVhCalPmKp9B_6q2tof-FLqqFgBuGUHSAT_JrsA';

export const URL_ENVIO = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

export const CAMPOS = {
  nombre: 'entry.1018036609',
  asistencia: 'entry.1312975241',
  numAcompanantes: 'entry.1691273501',
  nombresAcompanantes: 'entry.1302210804',
  vienenNinos: 'entry.1952167158',
  numNinos: 'entry.1091748390',
  nombresNinos: 'entry.1503846967',
  alergias: 'entry.1348789610',
  cancion: 'entry.1465394884',
  alojamiento: 'entry.1363548370',
  variante: 'entry.2120452842',
} as const;

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

const siNo = (v: boolean | null): string => (v === null ? '' : v ? 'Sí' : 'No');

export function construirCuerpo(r: Respuestas, variante: Variante): URLSearchParams {
  const cuerpo = new URLSearchParams();

  cuerpo.set(CAMPOS.nombre, r.name.trim());
  cuerpo.set(CAMPOS.asistencia, siNo(r.attend));
  cuerpo.set(CAMPOS.variante, variante === 'vip' ? 'VIP' : 'General');

  if (r.attend) {
    cuerpo.set(CAMPOS.numAcompanantes, String(r.guests));
    cuerpo.set(CAMPOS.nombresAcompanantes, r.guests > 0 ? r.guestNames.trim() : '');

    cuerpo.set(CAMPOS.vienenNinos, siNo(r.kids));
    cuerpo.set(CAMPOS.numNinos, r.kids ? String(r.kidsN) : '0');
    cuerpo.set(CAMPOS.nombresNinos, r.kids ? r.kidsNames.trim() : '');

    cuerpo.set(CAMPOS.alergias, r.allergies.trim() || 'Ninguna');
    cuerpo.set(CAMPOS.cancion, r.song.trim());

    // La pregunta de alojamiento solo existe en la entrada VIP
    cuerpo.set(CAMPOS.alojamiento, variante === 'vip' ? siNo(r.lodge) : '');
  }

  // Parametros que espera el backend de Google Forms. Una sola pagina: "0".
  cuerpo.set('fvv', '1');
  cuerpo.set('pageHistory', '0');
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
