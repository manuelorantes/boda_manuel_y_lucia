/**
 * Configuracion de los servicios externos de la Pokedex.
 *
 * Estos tres valores viven en el repositorio, no en variables de entorno como
 * los telefonos, y es a proposito: los tres acaban en el HTML publicado por
 * fuerza, porque los necesita el navegador. Esconderlos en un secreto de
 * Actions daria una falsa sensacion de seguridad y anadiria configuracion que
 * se puede olvidar al desplegar.
 *
 * Lo que impide que alguien suplante a otro invitado no es que el endpoint
 * este escondido, sino que el Apps Script verifique contra Google el token
 * que le llega. Ver apps-script/Codigo.gs.
 */

/** URL /exec del Apps Script que recibe las fotos. */
export const POKEDEX_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbz0ty7THFPF4G1XssPdpfsnAXqokK6CvVwPCiU6szK2Wxtcf59Y7VbvYk9UHNzX8OsO/exec';

/** ID de cliente OAuth para Google Sign-In. */
export const GOOGLE_CLIENT_ID =
  '464845944511-jfk0lo638e0s794q7upoe13k2pjgijhk.apps.googleusercontent.com';

/**
 * Album compartido de Google Fotos.
 *
 * PENDIENTE: sustituir por el enlace real. Mientras este vacio, la pantalla
 * del album muestra un aviso en vez de un boton roto.
 */
export const ALBUM_URL = '';

/**
 * Ancho al que se recorta cada foto antes de guardarla.
 *
 * No es una optimizacion opcional: a resolucion original, 23 fotos por
 * invitado por 150 invitados se irian a varios GB y no caben en los 15 GB
 * que Drive comparte con Gmail. A 480 px son unos 80 KB cada una.
 */
export const LADO_FOTO = 480;
