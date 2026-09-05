/**
 * Identidad y envio de la Pokedex.
 *
 * Todo esto corre en el navegador del invitado. La web es estatica, asi que
 * el receptor de las fotos es un Apps Script (ver apps-script/Codigo.gs).
 */
import { GOOGLE_CLIENT_ID, LADO_FOTO, POKEDEX_ENDPOINT } from '../config';

export interface Usuario {
  /** Identificador estable de la cuenta de Google. No es el correo. */
  sub: string;
  nombre: string;
  /** Caduca al cabo de una hora; se pide otro cuando hace falta. */
  idToken: string;
}

export interface Captura {
  hueco: number;
  persona: string;
  ficheroId: string;
}

const CLAVE_USUARIO = 'lm-pokedex-usuario';

/**
 * Donde viven las capturas en el movil. Se exporta porque la portada tambien
 * las cuenta, para pintar el avance en el bloque TU POKEDEX.
 */
export const CLAVE_FOTOS = 'lm-pokedex';

// --------------------------------------------------------------- identidad

declare global {
  interface Window {
    google?: any;
  }
}

let cargandoGis: Promise<void> | null = null;

/** Carga el script de Google Identity Services una sola vez. */
function cargarGis(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (cargandoGis) return cargandoGis;

  cargandoGis = new Promise<void>((resolver, rechazar) => {
    const etiqueta = document.createElement('script');
    etiqueta.src = 'https://accounts.google.com/gsi/client';
    etiqueta.async = true;
    etiqueta.onload = () => resolver();
    etiqueta.onerror = () => rechazar(new Error('No se ha podido cargar Google Sign-In'));
    document.head.appendChild(etiqueta);
  });

  return cargandoGis;
}

/**
 * Descodifica el JWT para leer sub y nombre. La firma NO se comprueba aqui:
 * de eso se encarga el Apps Script contra Google. Esto es solo para pintar el
 * nombre en pantalla.
 */
function leerToken(idToken: string): { sub: string; nombre: string } {
  const cuerpo = idToken.split('.')[1];
  const base64 = cuerpo.replace(/-/g, '+').replace(/_/g, '/');
  // TextDecoder y no el viejo truco de escape(): los nombres llevan tildes.
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const datos = JSON.parse(new TextDecoder().decode(bytes));
  return { sub: datos.sub, nombre: datos.name || 'Invitado' };
}

/**
 * Dibuja el boton oficial de Google dentro de `contenedor` y resuelve cuando
 * el invitado se identifica.
 *
 * Se usa el boton que pinta Google, no One Tap: One Tap no aparece en
 * incognito ni si el usuario lo descarto antes, y ahi el juego se quedaria
 * colgado sin explicacion. El boton siempre esta.
 */
export async function identificarse(contenedor: HTMLElement): Promise<Usuario> {
  await cargarGis();

  return new Promise<Usuario>((resolver) => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (respuesta: { credential?: string }) => {
        if (!respuesta.credential) return;
        const { sub, nombre } = leerToken(respuesta.credential);
        const usuario: Usuario = { sub, nombre, idToken: respuesta.credential };
        guardarUsuario(usuario);
        resolver(usuario);
      },
    });

    contenedor.innerHTML = '';
    window.google.accounts.id.renderButton(contenedor, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      locale: 'es',
      width: 260,
    });
  });
}

export function usuarioGuardado(): Usuario | null {
  try {
    const crudo = localStorage.getItem(CLAVE_USUARIO);
    return crudo ? (JSON.parse(crudo) as Usuario) : null;
  } catch {
    return null;
  }
}

function guardarUsuario(usuario: Usuario) {
  try {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  } catch {
    // Modo incognito con el almacenamiento lleno: se sigue sin recordar.
  }
}

export function cerrarSesion() {
  try {
    localStorage.removeItem(CLAVE_USUARIO);
  } catch {
    // Nada que hacer.
  }
}

// ------------------------------------------------------------------ fotos

/**
 * Recorta la foto a un cuadrado de LADO_FOTO y la devuelve como JPEG.
 *
 * Se hace en el movil antes de subir: sin esto, 3.000 fotos a resolucion
 * original no caben en Drive.
 */
export function prepararFoto(fichero: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const imagen = new Image();
    const url = URL.createObjectURL(fichero);

    imagen.onload = () => {
      URL.revokeObjectURL(url);

      const lado = Math.min(imagen.width, imagen.height);
      const lienzo = document.createElement('canvas');
      lienzo.width = LADO_FOTO;
      lienzo.height = LADO_FOTO;

      const ctx = lienzo.getContext('2d');
      if (!ctx) {
        rechazar(new Error('No se ha podido preparar la foto'));
        return;
      }

      // Recorte centrado, igual que hace object-fit: cover.
      ctx.drawImage(
        imagen,
        (imagen.width - lado) / 2,
        (imagen.height - lado) / 2,
        lado,
        lado,
        0,
        0,
        LADO_FOTO,
        LADO_FOTO,
      );

      resolver(lienzo.toDataURL('image/jpeg', 0.8));
    };

    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error('No se ha podido leer la foto'));
    };

    imagen.src = url;
  });
}

// --------------------------------------------------------------- transporte

/**
 * Llama al Apps Script.
 *
 * text/plain evita la peticion previa OPTIONS, que Apps Script no contesta.
 * El POST responde con una redireccion que el navegador sigue: la respuesta
 * se puede leer, comprobado contra el despliegue real.
 *
 * Reintenta con espera creciente porque Apps Script solo admite 30
 * ejecuciones a la vez, y en una boda los envios se amontonan.
 */
/** Errores del script que no tiene sentido reintentar: fallarian igual. */
const DEFINITIVOS = new Set(['auth', 'formato', 'hueco', 'ajena', 'accion']);

/** Traduce el codigo del script a algo que el invitado pueda entender. */
export function explicar(error: unknown): string {
  const codigo = error instanceof Error ? error.message : String(error);

  switch (codigo) {
    case 'auth':
      return 'Google no ha aceptado tu identificación. Cierra sesión y vuelve a entrar.';
    case 'formato':
      return 'Esa foto tiene un formato que no admitimos.';
    case 'tamano':
      return 'La foto ha salido demasiado grande.';
    case 'hueco':
      return 'Ese hueco no es válido.';
    default:
      return 'No hemos podido conectar. Inténtalo con más cobertura.';
  }
}

async function llamar<T>(cuerpo: Record<string, unknown>, intentos = 3): Promise<T> {
  let ultimoError: unknown;

  for (let intento = 0; intento < intentos; intento++) {
    try {
      const respuesta = await fetch(POKEDEX_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(cuerpo),
      });
      const datos = await respuesta.json();

      if (datos.ok === false) {
        const fallo = new Error(datos.error || 'error');
        // Un token rechazado o un formato invalido no mejoran reintentando:
        // se sale ya y se dice por que, en vez de esperar tres veces.
        if (DEFINITIVOS.has(fallo.message)) throw Object.assign(fallo, { definitivo: true });
        throw fallo;
      }

      return datos as T;
    } catch (error) {
      ultimoError = error;
      if ((error as { definitivo?: boolean })?.definitivo) break;

      // Espera aleatoria: si fallan cincuenta a la vez, que no reintenten
      // todos en el mismo instante.
      const espera = 400 * 2 ** intento + Math.random() * 400;
      await new Promise((r) => setTimeout(r, espera));
    }
  }

  throw ultimoError instanceof Error ? ultimoError : new Error('error');
}

/** Estado del Apps Script, para depurar sin adivinar. */
export function diagnostico() {
  return llamar<{ ok: true; clientId: string; clientIdPuesto: boolean }>(
    { accion: 'diagnostico' },
    1,
  );
}

export function subirFoto(usuario: Usuario, hueco: number, persona: string, foto: string) {
  return llamar<{ ok: true; ficheroId: string }>({
    accion: 'guardar',
    idToken: usuario.idToken,
    hueco,
    persona,
    foto,
  });
}

/**
 * Vacia un hueco. No borra nada de Drive: la foto se queda alli y solo se
 * anota que el invitado la quito.
 */
export function quitarFoto(usuario: Usuario, hueco: number, persona: string) {
  return llamar<{ ok: true }>({
    accion: 'quitar',
    idToken: usuario.idToken,
    hueco,
    persona,
  });
}

export function cargarCapturas(usuario: Usuario) {
  return llamar<{ ok: true; capturas: Captura[] }>({
    accion: 'cargar',
    idToken: usuario.idToken,
  });
}

export function descargarFoto(usuario: Usuario, ficheroId: string) {
  return llamar<{ ok: true; dataUrl: string }>({
    accion: 'foto',
    idToken: usuario.idToken,
    ficheroId,
  });
}
