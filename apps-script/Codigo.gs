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
const MAX_BYTES = 700 * 1024; // por foto; llegan recortadas a 480 px

function doPost(e) {
  try {
    const peticion = JSON.parse(e.postData.contents);

    // Diagnostico, sin identificarse a proposito: sirve para comprobar desde
    // fuera QUE version esta desplegada y como esta configurada, sin tener
    // que adivinar. No expone nada privado: el ID de cliente es publico y de
    // la carpeta y la hoja solo se dice si se alcanzan, no su contenido.
    if (peticion.accion === 'diagnostico') return json(diagnostico());

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

  return { sub: datos.sub, nombre: String(datos.name || 'Invitado').slice(0, 80) };
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
