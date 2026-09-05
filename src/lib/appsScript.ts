/**
 * Transporte hacia el Apps Script.
 *
 * Lo usan la Pokedex (fotos) y los gimnasios (bloqueos), asi que vive aparte
 * de los dos. Ver apps-script/Codigo.gs para el otro extremo.
 */
import { POKEDEX_ENDPOINT } from '../config';

/** Errores del script que no tiene sentido reintentar: fallarian igual. */
const DEFINITIVOS = new Set(['auth', 'formato', 'hueco', 'ajena', 'accion', 'permiso', 'cambios']);

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
    case 'permiso':
      return 'Esta cuenta no puede cambiar los retos.';
    case 'hoja':
      return 'Falta la pestaña Gimnasios en la hoja de cálculo.';
    default:
      return 'No hemos podido conectar. Inténtalo con más cobertura.';
  }
}

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
export async function llamar<T>(cuerpo: Record<string, unknown>, intentos = 3): Promise<T> {
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
  return llamar<{
    ok: true;
    clientId: string;
    clientIdPuesto: boolean;
    gimnasios: string;
    adminPuesto: boolean;
  }>({ accion: 'diagnostico' }, 1);
}
