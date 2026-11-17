// Almacenes: dónde vive el plan en el dispositivo. Todos cumplen la misma interfaz, así el resto de la app no sabe
// si los datos están en IndexedDB, en memoria (pruebas) o, en el corte 3, también sincronizados y cifrados.
//
//   leer()                  → documento o null
//   escribir(doc)           → guarda el documento principal
//   guardarCopia(dia, doc)  → copia automática del día (se guardan las últimas COPIAS_DIARIAS)
//   listarCopias()          → copias, de la más nueva a la más vieja
//
// Elección (regla 10, 17-11-2026): IndexedDB del navegador, sin librería. SQLite-WASM sobre OPFS se evaluó en su
// documentación oficial (sqlite.org/wasm, «persistence»): exige un Worker, su VFS «opfs» necesita SharedArrayBuffer
// (cabeceras COOP/COEP) y «opfs-sahpool» no admite varias pestañas sin coordinarlas; para un plan de pocos cientos
// de KB no suma nada. Según MDN, IndexedDB y OPFS comparten cuota y desalojo, así que tampoco protege mejor los datos.

export const COPIAS_DIARIAS = 7;
const NOMBRE_BASE = 'telar';
const VERSION_BASE = 1;

const promesa = (req) =>
  new Promise((ok, mal) => {
    req.onsuccess = () => ok(req.result);
    req.onerror = () => mal(req.error);
  });
const fin = (tx) =>
  new Promise((ok, mal) => {
    tx.oncomplete = () => ok();
    tx.onerror = () => mal(tx.error);
    tx.onabort = () => mal(tx.error || new Error('Transacción abortada'));
  });

export function crearAlmacenIndexedDB(nombre = NOMBRE_BASE) {
  let base = null;
  const abrir = () => {
    if (base) return base;
    base = new Promise((ok, mal) => {
      const req = indexedDB.open(nombre, VERSION_BASE);
      req.onupgradeneeded = (ev) => {
        const db = req.result;
        // Versión 1 de la base. Cuando haga falta otra, se agrega «if (ev.oldVersion < 2) {…}» sin borrar nada.
        if (ev.oldVersion < 1) {
          db.createObjectStore('documentos', { keyPath: 'id' });
          db.createObjectStore('copias', { keyPath: 'dia' });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        // Si otra pestaña con una versión nueva necesita actualizar la base, se cierra esta conexión.
        db.onversionchange = () => {
          db.close();
          base = null;
        };
        ok(db);
      };
      req.onerror = () => mal(req.error);
      req.onblocked = () => mal(new Error('La base está bloqueada por otra pestaña de Telar'));
    });
    base.catch(() => (base = null));
    return base;
  };
  return {
    tipo: 'indexeddb',
    async leer() {
      const db = await abrir();
      return (await promesa(db.transaction('documentos').objectStore('documentos').get('principal'))) || null;
    },
    async escribir(doc) {
      const db = await abrir();
      const tx = db.transaction('documentos', 'readwrite', { durability: 'strict' });
      tx.objectStore('documentos').put({ ...doc, id: 'principal' });
      await fin(tx);
    },
    async guardarCopia(dia, doc) {
      const db = await abrir();
      const tx = db.transaction('copias', 'readwrite');
      const st = tx.objectStore('copias');
      st.put({ ...doc, dia });
      const dias = await promesa(st.getAllKeys());
      dias.sort();
      for (const viejo of dias.slice(0, Math.max(0, dias.length - COPIAS_DIARIAS))) st.delete(viejo);
      await fin(tx);
    },
    async listarCopias() {
      const db = await abrir();
      const todas = await promesa(db.transaction('copias').objectStore('copias').getAll());
      return todas.sort((a, b) => (a.dia < b.dia ? 1 : -1));
    },
    cerrar() {
      if (base) base.then((db) => db.close()).catch(() => {});
      base = null;
    },
  };
}

/** Almacén en memoria: para las pruebas y como último recurso si el navegador no deja usar IndexedDB. */
export function crearAlmacenMemoria() {
  let doc = null;
  const copias = new Map();
  const clon = (x) => (x ? structuredClone(x) : null);
  return {
    tipo: 'memoria',
    async leer() {
      return clon(doc);
    },
    async escribir(d) {
      doc = clon({ ...d, id: 'principal' });
    },
    async guardarCopia(dia, d) {
      copias.set(dia, clon({ ...d, dia }));
      const dias = [...copias.keys()].sort();
      for (const viejo of dias.slice(0, Math.max(0, dias.length - COPIAS_DIARIAS))) copias.delete(viejo);
    },
    async listarCopias() {
      return [...copias.values()].map(clon).sort((a, b) => (a.dia < b.dia ? 1 : -1));
    },
    cerrar() {},
  };
}
