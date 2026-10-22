/**
 * Infinity Gym · Conexión del sitio web con Google Sheets
 * ------------------------------------------------------
 * Proyecto conectado por ID a la hoja «Infinity-Gym-Registros».
 * Primera vez: ejecuta configurar() (botón ▶), acepta permisos y luego Implementar → Nueva implementación → Aplicación web.
 *
 * Qué hace:
 *  - doPost: recibe cada formulario del sitio y lo escribe en la hoja del mes ("Octubre 2026", etc.).
 *    Si la hoja del mes no existe, la crea copiando la hoja oculta "Plantilla mes".
 *  - alEditar: cuando alguien edita una fila en una hoja de mes, anota la fecha en "Última actualización".
 *  - configurar: zona horaria, reparación del Panel y activador de edición (se ejecuta una vez).
 *  - probarRegistro: crea un registro de prueba para verificar que todo funciona sin usar el sitio.
 *  - limpiarDatos: borra todos los registros de las hojas de mes (deja fórmulas, Panel, Catálogos y manual).
 */

const SHEET_ID = '1FxrtK5gdhTkmC00lj_U8rLbrDoydWzUCoqcJSVKcmEA';
function libro_() { return SpreadsheetApp.openById(SHEET_ID); }

const CONFIG = {
  PLANTILLA: 'Plantilla mes',
  CATALOGOS: 'Catálogos',
  PRIMERA_FILA: 6,
  TOTAL_FILAS: 1000,
  EMAIL_AVISOS: '',            // Ej. 'encargado@infinitygym.mx'. Vacío = no se envían correos.
  MESES: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto',
          'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  SEGUNDOS_ENTRE_ENVIOS: 60    // Evita registros duplicados del mismo teléfono por doble clic.
};

// Columnas de las hojas de mes (A = 1). J, P, A y W tienen fórmulas: el script no las toca.
const COL = {
  FECHA: 2, HORA: 3, ORIGEN: 4, NOMBRE: 5, TELEFONO: 6, CORREO: 7, SEDE: 8, PLAN: 9,
  OBJETIVO: 11, TIPO_CITA: 12, FECHA_CITA: 13, HORA_CITA: 14, ESTATUS: 15,
  NOTAS: 21, ACTUALIZACION: 22
};

/** Prueba rápida desde el navegador: abre la URL /exec y debe responder {"ok":true}. */
function doGet() {
  return json_({ ok: true, servicio: 'Infinity Gym · registros' });
}

/** Recibe el formulario del sitio (JSON enviado como texto). */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Campo trampa: las personas no lo ven; los bots lo llenan.
    if (d.empresa) return json_({ ok: true });

    const nombre = limpiar_(d.nombre, 80);
    const telefono = limpiar_(d.telefono, 20);
    if (!nombre || telefono.replace(/\D/g, '').length < 10) {
      return json_({ ok: false, error: 'Escribe tu nombre y un teléfono de 10 dígitos.' });
    }
    if (d.consentimiento !== true) {
      return json_({ ok: false, error: 'Es necesario aceptar el aviso de privacidad.' });
    }

    // Evita duplicados por doble envío.
    const cache = CacheService.getScriptCache();
    const llave = 'tel_' + telefono.replace(/\D/g, '');
    if (cache.get(llave)) return json_({ ok: true, duplicado: true, id: cache.get(llave) });

    const ss = libro_();
    const listas = leerCatalogos_(ss);
    const sede = enLista_(d.sede, listas.sedes);
    const plan = enLista_(d.plan, listas.planes);
    const tipoCita = enLista_(d.tipoCita, listas.tiposCita);
    const fechaCita = fechaSerial_(d.fechaCita);
    const horaCita = horaFraccion_(d.horaCita);
    const conCita = fechaCita !== '';

    const tz = ss.getSpreadsheetTimeZone();
    const ahora = new Date();
    const anio = Number(Utilities.formatDate(ahora, tz, 'yyyy'));
    const mes = Number(Utilities.formatDate(ahora, tz, 'M'));
    const fechaHoy = fechaSerial_(Utilities.formatDate(ahora, tz, 'yyyy-MM-dd'));
    const horaAhora = horaFraccion_(Utilities.formatDate(ahora, tz, 'HH:mm'));

    const hoja = hojaDelMes_(ss, anio, mes);
    const fila = primeraFilaLibre_(hoja);
    if (!fila) return json_({ ok: false, error: 'La hoja del mes está llena. Avisa al gimnasio.' });

    hoja.getRange(fila, COL.FECHA, 1, 8).setValues([[
      fechaHoy, horaAhora, 'Sitio web', nombre, "'" + telefono, limpiar_(d.correo, 80), sede, plan
    ]]);
    hoja.getRange(fila, COL.OBJETIVO, 1, 5).setValues([[
      limpiar_(d.objetivo, 120), conCita ? (tipoCita || 'Visita guiada') : '', fechaCita, conCita ? horaCita : '',
      conCita ? 'Cita solicitada' : 'Nuevo'
    ]]);
    hoja.getRange(fila, COL.NOTAS, 1, 2).setValues([[limpiar_(d.notas, 200), fechaHoy]]);
    SpreadsheetApp.flush();

    const id = hoja.getRange(fila, 1).getDisplayValue();
    cache.put(llave, id, CONFIG.SEGUNDOS_ENTRE_ENVIOS);
    if (CONFIG.EMAIL_AVISOS) avisarPorCorreo_(id, nombre, telefono, sede, plan, conCita, d.fechaCita, d.horaCita);
    return json_({ ok: true, id: id });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'No pudimos guardar tu registro. Escríbenos por WhatsApp.' });
  } finally {
    lock.releaseLock();
  }
}

/** Ejecuta esto UNA vez (botón ▶) antes de implementar. */
function configurar() {
  const ss = libro_();
  ss.setSpreadsheetTimeZone('America/Mexico_City');
  // Panel: contar registros sin contar como 1 los meses que todavía no tienen hoja.
  const panel = ss.getSheetByName('Panel');
  if (panel) {
    const formulas = [];
    for (let r = 5; r <= 16; r++) {
      formulas.push(['=IFERROR(COUNTIF(INDIRECT("\'"&$A' + r + '&"\'!$E$6:$E$1005"),"<>"),0)']);
    }
    panel.getRange('B5:B16').setFormulas(formulas);
  }
  // Activador que anota la fecha de última actualización al editar.
  ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === 'alEditar') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('alEditar').forSpreadsheet(ss).onEdit().create();
  console.log('Listo: zona horaria, Panel y activador configurados.');
}

/** Anota la fecha de la última edición en las hojas de mes (activador instalado por configurar). */
function alEditar(e) {
  if (!e || !e.range) return;
  const hoja = e.range.getSheet();
  if (!esHojaDeMes_(hoja.getName())) return;
  const r1 = Math.max(e.range.getRow(), CONFIG.PRIMERA_FILA);
  const r2 = e.range.getLastRow();
  const c1 = e.range.getColumn();
  if (r2 < r1 || c1 >= COL.ACTUALIZACION) return;
  const tz = e.source.getSpreadsheetTimeZone();
  const hoy = fechaSerial_(Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd'));
  const valores = [];
  for (let r = r1; r <= r2; r++) valores.push([hoy]);
  hoja.getRange(r1, COL.ACTUALIZACION, valores.length, 1).setValues(valores);
}

/** Ejecuta esta función desde el editor (botón ▶) para crear un registro de prueba. */
function probarRegistro() {
  const manana = new Date(Date.now() + 86400000);
  const prueba = {
    nombre: 'Prueba del sistema', telefono: '7710000000', correo: '', sede: 'Tezontepec',
    plan: 'Mensualidad', objetivo: 'Probar la conexión', tipoCita: 'Clase de prueba',
    fechaCita: Utilities.formatDate(manana, libro_().getSpreadsheetTimeZone(), 'yyyy-MM-dd'),
    horaCita: '18:00', consentimiento: true, notas: 'Registro de prueba: bórralo'
  };
  const resp = doPost({ postData: { contents: JSON.stringify(prueba) } });
  console.log(resp.getContent());
}

/**
 * Deja la hoja en blanco para empezar a probar: borra los registros de todas las hojas de mes.
 * No toca Panel, Catálogos, el manual, la plantilla, las fórmulas ni las listas de estatus.
 * Ejecútala desde el editor (botón ▶). Si te equivocas: Archivo → Historial de versiones.
 */
function limpiarDatos() {
  const ss = libro_();
  const filas = CONFIG.TOTAL_FILAS;
  const resumen = [];
  ss.getSheets().forEach(hoja => {
    if (!esHojaDeMes_(hoja.getName())) return;
    const ultimaCol = hoja.getLastColumn();
    const formulas = hoja.getRange(CONFIG.PRIMERA_FILA, 1, filas, ultimaCol).getFormulas();
    let borradas = 0;
    for (let c = 0; c < ultimaCol; c++) {
      // Las columnas con fórmulas (folio, días, etc.) se quedan como están.
      if (formulas.some(f => f[c] !== '')) continue;
      hoja.getRange(CONFIG.PRIMERA_FILA, c + 1, filas, 1).clearContent();
      borradas++;
    }
    resumen.push(hoja.getName() + ': ' + borradas + ' columnas vaciadas');
  });
  SpreadsheetApp.flush();
  console.log(resumen.length ? resumen.join('\n') : 'No hay hojas de mes con registros.');
}

// ---------------- utilidades ----------------

function hojaDelMes_(ss, anio, mes) {
  const nombre = CONFIG.MESES[mes - 1] + ' ' + anio;
  let hoja = ss.getSheetByName(nombre);
  if (hoja) return hoja;
  const plantilla = ss.getSheetByName(CONFIG.PLANTILLA);
  if (!plantilla) throw new Error('No existe la hoja "' + CONFIG.PLANTILLA + '".');
  hoja = plantilla.copyTo(ss).setName(nombre);
  hoja.showSheet();
  hoja.getRange('A1').setValue('Registros · ' + nombre);
  hoja.getRange('B2').setValue(mes);
  hoja.getRange('D2').setValue(anio);
  hoja.setTabColor('#F8CD0C');
  const catalogos = ss.getSheetByName(CONFIG.CATALOGOS);
  if (catalogos) {
    ss.setActiveSheet(hoja);
    ss.moveActiveSheet(catalogos.getIndex());
  }
  return hoja;
}

function primeraFilaLibre_(hoja) {
  const nombres = hoja.getRange(CONFIG.PRIMERA_FILA, COL.NOMBRE, CONFIG.TOTAL_FILAS, 1).getValues();
  for (let i = 0; i < nombres.length; i++) {
    if (nombres[i][0] === '') return CONFIG.PRIMERA_FILA + i;
  }
  return null;
}

function leerCatalogos_(ss) {
  const cat = ss.getSheetByName(CONFIG.CATALOGOS);
  const col = (a1) => cat.getRange(a1).getValues().map(r => String(r[0]).trim()).filter(Boolean);
  return { sedes: col('A5:A12'), planes: col('F5:F20'), tiposCita: col('T5:T8') };
}

function enLista_(valor, lista) {
  const v = String(valor || '').trim();
  return lista.indexOf(v) >= 0 ? v : '';
}

/** Limpia texto y evita que alguien inyecte fórmulas en la hoja. */
function limpiar_(valor, max) {
  let t = String(valor || '').replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

/** "2026-10-23" → número de serie de fecha de Sheets (sin problemas de zona horaria). */
function fechaSerial_(texto) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texto || ''));
  if (!m) return '';
  return (Date.UTC(+m[1], +m[2] - 1, +m[3]) - Date.UTC(1899, 11, 30)) / 86400000;
}

/** "18:30" → fracción del día (0.770833…). */
function horaFraccion_(texto) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(texto || ''));
  if (!m) return '';
  return (+m[1] * 60 + +m[2]) / 1440;
}

function esHojaDeMes_(nombre) {
  const partes = nombre.split(' ');
  return partes.length === 2 && CONFIG.MESES.indexOf(partes[0]) >= 0 && /^\d{4}$/.test(partes[1]);
}

function avisarPorCorreo_(id, nombre, telefono, sede, plan, conCita, fecha, hora) {
  const asunto = (conCita ? 'Nueva cita' : 'Nuevo registro') + ' · ' + (sede || 'sin sede') + ' · ' + id;
  const cuerpo = [
    'Llegó un registro desde el sitio web.', '',
    'Folio: ' + id, 'Nombre: ' + nombre, 'Teléfono: ' + telefono,
    'Sede: ' + sede, 'Plan: ' + plan,
    conCita ? 'Cita solicitada: ' + fecha + ' ' + (hora || '') : 'Sin cita',
    '', 'Revisa la pestaña "Citas" de la hoja para confirmarla.'
  ].join('\n');
  MailApp.sendEmail(CONFIG.EMAIL_AVISOS, asunto, cuerpo);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
