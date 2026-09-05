/**
 * Estado de los retos: que gimnasios estan abiertos y cuales bloqueados.
 *
 * A diferencia de las medallas, que son de cada movil, esto es compartido: lo
 * manda el Apps Script leyendo la pestana `Gimnasios` de la hoja, y solo la
 * cuenta maestra puede cambiarlo. Ver apps-script/Codigo.gs.
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

interface Respuesta {
  ok: true;
  admin: boolean;
  retos: EstadoReto[];
}

/**
 * Ultimo estado conocido.
 *
 * Se guarda para que la pantalla de gimnasios pinte al instante en vez de
 * quedarse en blanco esperando al Apps Script, que tarda su segundo largo. Lo
 * de verdad se pide despues y se repinta.
 */
const CLAVE_RETOS = 'lm-retos';

export function retosGuardados(): EstadoReto[] | null {
  try {
    const crudo = localStorage.getItem(CLAVE_RETOS);
    if (!crudo) return null;
    const datos: unknown = JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as EstadoReto[]) : null;
  } catch {
    return null;
  }
}

function guardarRetos(retos: EstadoReto[]) {
  try {
    localStorage.setItem(CLAVE_RETOS, JSON.stringify(retos));
  } catch {
    // Incognito o almacenamiento lleno: se pedira al servidor cada vez.
  }
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
  guardarRetos(respuesta.retos);
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
