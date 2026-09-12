/**
 * Estado compartido de los juegos: que gimnasios estan abiertos y que Pokemon
 * del reto 5 estan ya atrapados.
 *
 * A diferencia de las medallas, que son de cada movil, esto es compartido: lo
 * manda el Apps Script leyendo las pestanas `Gimnasios` y `Buscados` de la
 * hoja, y solo la cuenta maestra puede cambiarlo. Ver apps-script/Codigo.gs.
 *
 * Los dos viajan en la misma peticion a proposito. El dia de la boda la
 * pantalla de gimnasios la abren ciento y pico moviles, y pedir los atrapados
 * aparte seria doblar las llamadas para pintar la misma pantalla.
 *
 * El texto de los ocho retos esta en src/data/pokedex.ts. Si la hoja trae
 * titulo o descripcion propios, mandan sobre los de la web: sirve para
 * corregir una errata el mismo dia sin volver a desplegar.
 */
import { llamar } from './appsScript';
import type { Usuario } from './pokedex';

export interface EstadoReto {
  id: string;
  bloqueado: boolean;
  /** Titulo, solo si la hoja lo trae escrito. Si no, manda el de la web. */
  reto?: string;
  descripcion?: string;
}

export interface EstadoBuscado {
  id: string;
  atrapado: boolean;
}

interface Respuesta {
  ok: true;
  admin: boolean;
  retos: EstadoReto[];
  /**
   * Opcional a proposito: si la hoja todavia no tiene la pestana `Buscados`,
   * el Apps Script contesta sin esta clave y la web se comporta como si no
   * hubiera ninguno atrapado, en vez de romperse.
   */
  buscados?: EstadoBuscado[];
}

/**
 * Ultimo estado conocido.
 *
 * Se guarda para que la pantalla de gimnasios pinte al instante en vez de
 * quedarse en blanco esperando al Apps Script, que tarda su segundo largo. Lo
 * de verdad se pide despues y se repinta.
 */
const CLAVE_RETOS = 'lm-retos';
const CLAVE_BUSCADOS = 'lm-buscados';

function leerGuardado<T>(clave: string): T[] | null {
  try {
    const crudo = localStorage.getItem(clave);
    if (!crudo) return null;
    const datos: unknown = JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as T[]) : null;
  } catch {
    return null;
  }
}

function guardar(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Incognito o almacenamiento lleno: se pedira al servidor cada vez.
  }
}

export function retosGuardados(): EstadoReto[] | null {
  return leerGuardado<EstadoReto>(CLAVE_RETOS);
}

export function buscadosGuardados(): EstadoBuscado[] | null {
  return leerGuardado<EstadoBuscado>(CLAVE_BUSCADOS);
}

/**
 * Pregunta el estado al servidor.
 *
 * Sin token va como invitado, que es el caso normal: los gimnasios no piden
 * cuenta. El token solo cambia una cosa: si la respuesta viene con `admin`,
 * que es lo que el panel necesita saber.
 */
export async function cargarRetos(idToken?: string): Promise<Respuesta> {
  const respuesta = await llamar<Respuesta>({ accion: 'retos', idToken });
  guardar(CLAVE_RETOS, respuesta.retos);
  if (respuesta.buscados) guardar(CLAVE_BUSCADOS, respuesta.buscados);
  return respuesta;
}

/** Abre o cierra retos. El servidor rechaza a quien no sea la cuenta maestra. */
export function cambiarRetos(usuario: Usuario, cambios: { id: string; bloqueado: boolean }[]) {
  return llamar<Respuesta>({
    accion: 'bloquear',
    idToken: usuario.idToken,
    cambios,
  });
}

/**
 * Marca o suelta Pokemon del reto 5. Como `cambiarRetos`, el servidor rechaza
 * a quien no sea la cuenta maestra: el invitado los ve, no los toca.
 */
export function cambiarBuscados(usuario: Usuario, cambios: { id: string; atrapado: boolean }[]) {
  return llamar<Respuesta>({
    accion: 'atrapar',
    idToken: usuario.idToken,
    cambios,
  });
}
