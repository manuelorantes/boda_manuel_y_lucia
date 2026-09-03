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

/** ID de cliente OAuth (Google Cloud > Credenciales). Pendiente de crear. */
const CLIENT_ID = 'PENDIENTE.apps.googleusercontent.com';

const HOJA = 'Capturas';
const MAX_BYTES = 700 * 1024; // por foto; llegan recortadas a 480 px

function doPost(e) {
  try {
    const peticion = JSON.parse(e.postData.contents);
    const usuario = verificarToken(peticion.idToken);
    if (!usuario) return json({ ok: false, error: 'auth' });

    switch (peticion.accion) {
      case 'guardar':
        return json(guardar(usuario, peticion));
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
  const nombreFichero = String(hueco).padStart(2, '0') + ' - ' + persona + '.jpg';

  // Repetir un hueco sustituye la foto anterior, no acumula.
  const previas = carpeta.getFilesByName(nombreFichero);
  while (previas.hasNext()) previas.next().setTrashed(true);

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

/** Que huecos tiene ya este invitado, para restaurar su progreso. */
function capturasDe(sub) {
  const porHueco = {};
  filasDe(sub).forEach((fila) => {
    // La ultima fila de cada hueco manda: es la foto que quedo en Drive.
    porHueco[fila[3]] = { hueco: fila[3], persona: fila[4], ficheroId: fila[5] };
  });
  return Object.keys(porHueco).map((k) => porHueco[k]);
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
