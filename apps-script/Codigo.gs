/**
 * Receptor de la Pokedex de la boda.
 *
 * Vive en Google Apps Script, enlazado a la hoja "Pokedex boda". Recibe las
 * fotos desde la web (GitHub Pages es estatico y no puede guardarlas), las
 * deja en Drive en una carpeta por invitado y anota una fila por captura.
 *
 * Identidad: la web manda el id_token de Google Sign-In y aqui se verifica
 * contra Google. El despliegue es publico ("cualquier usuario"), asi que sin
 * esa comprobacion cualquiera podria decir que es otro invitado.
 *
 * Las fotos quedan PRIVADAS en Drive: nunca se comparten por enlace. Cuando
 * un invitado entra desde otro movil, es este script quien se las devuelve,
 * ya identificado.
 *
 * La hoja solo se escribe con appendRow, nunca se modifican filas: si mucha
 * gente sube fotos a la vez no se pisan entre ellas. El recuento del ganador
 * sale de las formulas de la pestana "Resumen".
 */

const FOLDER_ID = '1D1Ueo7FnYXRoPRc0A8TqnJh0QBgdUCDO';

/**
 * ID de cliente OAuth (Google Cloud > Credenciales).
 *
 * Es publico por diseno: va tambien en el codigo de la web. Lo que impide
 * suplantar a nadie no es esconderlo, sino comprobar que el token que llega
 * fue emitido para este mismo cliente.
 */
const CLIENT_ID = '464845944511-jfk0lo638e0s794q7upoe13k2pjgijhk.apps.googleusercontent.com';

const HOJA = 'Capturas';
const HOJA_GIMNASIOS = 'Gimnasios';
const MAX_BYTES = 700 * 1024; // por foto; llegan recortadas a 480 px

/**
 * Estado inicial de los retos, solo para `prepararGimnasios()`.
 *
 * Los identificadores tienen que coincidir con los de `src/data/pokedex.ts`
 * en la web: es lo que empareja cada fila de la hoja con su tarjeta.
 *
 * Los dos ultimos nacen bloqueados porque son los que se abren avanzada la
 * fiesta. Su texto, como el de los otros seis, esta en la web.
 */
const GIMNASIOS_INICIALES = [
  ['smeargle', false],
  ['recuerdo', false],
  ['karaoke', false],
  ['delibird', false],
  ['sudowoodo', false],
  ['alakazam', false],
  ['snorlax', true],
  ['porygon', true],
];

/** Segundos que se reutiliza la respuesta de `retos` para los invitados. */
const CACHE_RETOS = 30;

/**
 * Abrir la URL /exec en el navegador es un GET, y sin esto Apps Script
 * contesta "Funcion de script no encontrada: doGet", que parece que algo se ha
 * roto cuando no lo esta.
 *
 * Devuelve el diagnostico, que es lo unico que tiene sentido mirar desde un
 * navegador y ya era publico. Sirve para comprobar desde el movil, sin
 * herramientas, que el despliegue esta al dia y bien configurado.
 */
function doGet() {
  return json(diagnostico());
}

function doPost(e) {
  try {
    const peticion = JSON.parse(e.postData.contents);

    // Diagnostico, sin identificarse a proposito: sirve para comprobar desde
    // fuera QUE version esta desplegada y como esta configurada, sin tener
    // que adivinar. No expone nada privado: el ID de cliente es publico y de
    // la carpeta y la hoja solo se dice si se alcanzan, no su contenido.
    if (peticion.accion === 'diagnostico') return json(diagnostico());

    // Los retos se consultan SIN identificarse: los gimnasios estan abiertos
    // a todo el mundo y el invitado no tiene cuenta. Si viene token se mira
    // igualmente, porque el panel necesita saber si quien pregunta manda.
    if (peticion.accion === 'retos') {
      return json(retos(peticion.idToken ? verificarToken(peticion.idToken) : null));
    }

    const usuario = verificarToken(peticion.idToken);
    if (!usuario) return json({ ok: false, error: 'auth' });

    switch (peticion.accion) {
      case 'guardar':
        return json(guardar(usuario, peticion));
      case 'quitar':
        return json(quitar(usuario, peticion));
      case 'cargar':
        return json({ ok: true, capturas: capturasDe(usuario.sub) });
      case 'foto':
        return json(foto(usuario.sub, peticion.ficheroId));
      case 'bloquear':
        return json(bloquear(usuario, peticion));
      default:
        return json({ ok: false, error: 'accion' });
    }
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/**
 * Estado de la configuracion, para poder depurar sin ir a ciegas.
 *
 * Lo mas util es `clientIdPuesto`: si sale false, el script sigue con el
 * PENDIENTE y rechazara TODAS las fotos aunque el invitado se identifique
 * bien, porque el token nunca coincidira.
 */
function diagnostico() {
  const resultado = {
    ok: true,
    clientId: CLIENT_ID,
    clientIdPuesto: CLIENT_ID.indexOf('PENDIENTE') === -1,
    carpeta: 'sin comprobar',
    hoja: 'sin comprobar',
  };

  try {
    resultado.carpeta = DriveApp.getFolderById(FOLDER_ID).getName();
  } catch (err) {
    resultado.carpeta = 'ERROR: ' + String(err);
  }

  try {
    const h = hoja();
    resultado.hoja = h ? h.getName() + ' (' + h.getLastRow() + ' filas)' : 'ERROR: no existe ' + HOJA;
  } catch (err) {
    resultado.hoja = 'ERROR: ' + String(err);
  }

  // Sin la pestana Gimnasios no hay bloqueos y los ocho retos saldrian
  // abiertos, los dos ultimos incluidos. Conviene verlo de un vistazo.
  try {
    const filas = filasGimnasios();
    resultado.gimnasios = filas.length
      ? filas.length + ' retos (' + filas.filter(function (f) { return f.bloqueado; }).length + ' bloqueados)'
      : 'ERROR: no existe ' + HOJA_GIMNASIOS + ' o esta vacia; ejecuta prepararGimnasios()';
  } catch (err) {
    resultado.gimnasios = 'ERROR: ' + String(err);
  }

  // El correo no se dice, solo si esta puesto: el diagnostico es publico. Sin
  // el, el panel no deja entrar a nadie y los retos no se pueden abrir.
  resultado.adminPuesto = adminEmail().indexOf('@') !== -1;

  return resultado;
}

/**
 * Comprueba el id_token contra Google y devuelve { sub, nombre }.
 *
 * `sub` es el identificador estable de la cuenta: es lo que usamos para
 * reconocer al invitado entre dispositivos. No guardamos el correo.
 */
function verificarToken(idToken) {
  if (!idToken) return null;

  const respuesta = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true },
  );
  if (respuesta.getResponseCode() !== 200) return null;

  const datos = JSON.parse(respuesta.getContentText());

  // El token tiene que estar emitido para NUESTRA aplicacion: sin esta
  // comprobacion valdria un token de cualquier otra web.
  if (datos.aud !== CLIENT_ID) return null;
  if (!datos.sub) return null;

  // El correo se lee solo para reconocer la cuenta maestra y se queda en
  // memoria durante la peticion: no se escribe en ninguna hoja ni se
  // devuelve a la web, que sigue sin saber el correo de nadie.
  return {
    sub: datos.sub,
    nombre: String(datos.name || 'Invitado').slice(0, 80),
    correo: datos.email_verified === 'true' || datos.email_verified === true ? datos.email : '',
  };
}

/**
 * Correo de la cuenta maestra, la unica que puede tocar los bloqueos.
 *
 * NO va escrito en este fichero: esta copia del script esta versionada en un
 * repositorio publico, y ahi el correo seria a la vez una direccion regalada
 * a los rastreadores y un cartel diciendo que cuenta manda.
 *
 * Vive en las propiedades del proyecto, que solo se ven desde el editor de
 * Apps Script: Configuracion del proyecto > Propiedades de la secuencia de
 * comandos > ADMIN_EMAIL. Si falta, no manda nadie y los retos se quedan como
 * esten; es el fallo mas prudente de los dos posibles.
 */
function adminEmail() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') || '';
}

/**
 * Si esta cuenta es la maestra.
 *
 * Se compara el correo del token, no el `sub`, para que cambiar de cuenta
 * maestra sea escribir una direccion y no ir a buscar un identificador.
 */
function esAdmin(usuario) {
  // Un invitado sin token es el caso comun, y asi ni se toca Properties.
  if (!usuario || !usuario.correo) return false;
  const admin = adminEmail();
  return !!admin && usuario.correo.toLowerCase() === admin.toLowerCase();
}

/** Carpeta del invitado, creandola la primera vez. */
function carpetaDe(usuario) {
  const existentes = filasDe(usuario.sub);
  if (existentes.length) {
    const id = existentes[existentes.length - 1][6]; // columna G, CarpetaID
    try {
      return DriveApp.getFolderById(id);
    } catch (err) {
      // La carpeta se borro a mano: se crea otra en vez de fallar.
    }
  }
  return DriveApp.getFolderById(FOLDER_ID).createFolder(usuario.nombre + ' - ' + usuario.sub.slice(-6));
}

function guardar(usuario, peticion) {
  const hueco = Number(peticion.hueco);
  const persona = String(peticion.persona || '').slice(0, 80);
  const dataUrl = String(peticion.foto || '');

  if (!hueco || hueco < 1) return { ok: false, error: 'hueco' };

  const partes = dataUrl.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
  if (!partes) return { ok: false, error: 'formato' };

  const bytes = Utilities.base64Decode(partes[3]);
  if (bytes.length > MAX_BYTES) return { ok: false, error: 'tamano' };

  const carpeta = carpetaDe(usuario);

  // El nombre lleva la hora: repetir un hueco NO sustituye a la foto
  // anterior, se quedan las dos en Drive. Se decidio asi a proposito, para
  // no perder nunca una foto de la boda aunque el invitado la reemplace.
  // Cual es la buena lo dice la hoja: manda la ultima fila de cada hueco.
  const sello = Utilities.formatDate(new Date(), 'Europe/Madrid', 'yyyyMMdd-HHmmss');
  const nombreFichero = String(hueco).padStart(2, '0') + ' - ' + persona + ' - ' + sello + '.jpg';

  const fichero = carpeta.createFile(Utilities.newBlob(bytes, partes[1], nombreFichero));

  hoja().appendRow([
    new Date(),
    usuario.sub,
    usuario.nombre,
    hueco,
    persona,
    fichero.getId(),
    carpeta.getId(),
  ]);

  return { ok: true, ficheroId: fichero.getId() };
}

/**
 * Vacia un hueco.
 *
 * NO borra nada de Drive: solo anota que el invitado lo quito, con una fila
 * sin FicheroID. Como manda la ultima fila de cada hueco, eso lo deja vacio
 * para la web, y la foto sigue en la carpeta por si hiciera falta.
 */
function quitar(usuario, peticion) {
  const hueco = Number(peticion.hueco);
  if (!hueco || hueco < 1) return { ok: false, error: 'hueco' };

  hoja().appendRow([
    new Date(),
    usuario.sub,
    usuario.nombre,
    hueco,
    String(peticion.persona || '').slice(0, 80),
    '', // sin FicheroID: es lo que marca que el hueco quedo vacio
    carpetaDe(usuario).getId(),
  ]);

  return { ok: true };
}

/**
 * Que huecos tiene ya este invitado, para restaurar su progreso.
 *
 * Manda la ultima fila de cada hueco: asi un reemplazo devuelve la foto
 * nueva y un "quitar" deja el hueco fuera de la lista.
 */
function capturasDe(sub) {
  const porHueco = {};
  filasDe(sub).forEach((fila) => {
    porHueco[fila[3]] = { hueco: fila[3], persona: fila[4], ficheroId: fila[5] };
  });

  return Object.keys(porHueco)
    .map((k) => porHueco[k])
    .filter((c) => c.ficheroId);
}

/**
 * Devuelve una foto concreta en base64, comprobando antes que pertenece a
 * quien la pide. Asi las fotos siguen privadas en Drive.
 */
function foto(sub, ficheroId) {
  const suya = filasDe(sub).some((fila) => fila[5] === ficheroId);
  if (!suya) return { ok: false, error: 'ajena' };

  const blob = DriveApp.getFileById(ficheroId).getBlob();
  return {
    ok: true,
    dataUrl: 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()),
  };
}

// ---------------------------------------------------------------- gimnasios

/**
 * Estado de los retos: cuales estan abiertos y cuales bloqueados.
 *
 * El texto de los ocho vive en la web (`src/data/pokedex.ts`), asi que aqui no
 * hay nada que esconder y la respuesta es igual para todos. Las columnas
 * `reto` y `descripcion` de la hoja son un apano: si vienen escritas mandan
 * sobre el texto de la web, y eso permite corregir una errata el mismo dia sin
 * volver a desplegar la pagina.
 */
function retos(usuario) {
  // La lista es identica para todo el mundo, y el dia de la boda la piden
  // ciento y pico moviles seguidos. Guardarla medio minuto evita repetir la
  // lectura de la hoja y deja sitio en las 30 ejecuciones simultaneas que da
  // Apps Script.
  const cache = CacheService.getScriptCache();
  let lista = cache.get('retos');

  if (!lista) {
    lista = JSON.stringify(
      filasGimnasios().map(function (fila) {
        return {
          id: fila.id,
          bloqueado: fila.bloqueado,
          reto: fila.reto,
          descripcion: fila.descripcion,
        };
      }),
    );
    cache.put('retos', lista, CACHE_RETOS);
  }

  // `admin` va fuera de la cache: depende de quien pregunte, la lista no.
  return { ok: true, admin: esAdmin(usuario), retos: JSON.parse(lista) };
}

/**
 * Bloquea o desbloquea retos. Acepta varios de golpe para que "activar
 * todos" sea una peticion y no ocho.
 */
function bloquear(usuario, peticion) {
  if (!esAdmin(usuario)) return { ok: false, error: 'permiso' };

  const cambios = peticion.cambios;
  if (!cambios || !cambios.length) return { ok: false, error: 'cambios' };

  const hoja = hojaGimnasios();
  if (!hoja) return { ok: false, error: 'hoja' };

  // Es la unica parte del script que MODIFICA filas en vez de anadirlas. Solo
  // escribe la cuenta maestra, asi que no compite con los envios de fotos,
  // pero el candado evita que dos pulsaciones seguidas desde el panel se
  // pisen la una a la otra.
  const candado = LockService.getScriptLock();
  candado.waitLock(10000);
  try {
    const valores = hoja.getDataRange().getValues();
    const ahora = new Date();

    cambios.forEach(function (cambio) {
      for (let i = 1; i < valores.length; i++) {
        if (String(valores[i][0]).trim() !== String(cambio.id).trim()) continue;
        hoja.getRange(i + 1, 2).setValue(cambio.bloqueado ? true : false);
        hoja.getRange(i + 1, 5).setValue(ahora);
        break;
      }
    });
  } finally {
    candado.releaseLock();
  }

  // Si no se tira la copia, los invitados seguirian viendo el estado viejo
  // hasta medio minuto despues de desbloquear. En una boda eso es una cola de
  // gente mirando el movil sin entender por que no cambia.
  CacheService.getScriptCache().remove('retos');

  return retos(usuario);
}

/** Las filas de la pestana Gimnasios, ya interpretadas. */
function filasGimnasios() {
  const hoja = hojaGimnasios();
  if (!hoja) return [];

  return hoja
    .getDataRange()
    .getValues()
    .slice(1)
    .filter(function (fila) {
      return String(fila[0]).trim();
    })
    .map(function (fila) {
      return {
        id: String(fila[0]).trim(),
        // La casilla admite TRUE de la hoja o el texto "si": se edita a mano
        // desde el movil y ahi es facil escribir una cosa por la otra.
        bloqueado: fila[1] === true || /^(true|si|sí|1|x)$/i.test(String(fila[1]).trim()),
        reto: String(fila[2] || ''),
        descripcion: String(fila[3] || ''),
      };
    });
}

function hojaGimnasios() {
  return SpreadsheetApp.getActive().getSheetByName(HOJA_GIMNASIOS);
}

/**
 * Crea la pestana Gimnasios con los ocho retos. Se ejecuta UNA vez a mano
 * desde el editor de Apps Script; si la pestana ya existe no toca nada, para
 * no borrar los textos secretos ya escritos.
 */
function prepararGimnasios() {
  if (hojaGimnasios()) return 'La pestana ' + HOJA_GIMNASIOS + ' ya existe: no se toca.';

  const hoja = SpreadsheetApp.getActive().insertSheet(HOJA_GIMNASIOS);
  hoja.appendRow(['id', 'bloqueado', 'reto', 'descripcion', 'actualizado']);
  GIMNASIOS_INICIALES.forEach(function (g) {
    hoja.appendRow([g[0], g[1], '', '', new Date()]);
  });
  hoja.setFrozenRows(1);
  hoja.getRange(2, 2, GIMNASIOS_INICIALES.length, 1).insertCheckboxes();
  hoja.setColumnWidth(3, 260);
  hoja.setColumnWidth(4, 520);

  return 'Pestana ' + HOJA_GIMNASIOS + ' creada con ' + GIMNASIOS_INICIALES.length + ' retos.';
}

function filasDe(sub) {
  const valores = hoja().getDataRange().getValues();
  return valores.slice(1).filter((fila) => fila[1] === sub);
}

function hoja() {
  return SpreadsheetApp.getActive().getSheetByName(HOJA);
}

function json(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
