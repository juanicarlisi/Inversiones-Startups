/* ============ Almacenamiento local (IndexedDB) ============
   Reemplaza la base compartida del artefacto. La interfaz es la misma que usaba el resto de la app
   (init, set, merge, del) para que en el corte 1 se enchufe la sincronización cifrada sin tocar pantallas:
   la sincronización va a escuchar estas mismas escrituras y mandar una copia cifrada.
   Elección (17-11-2026): IndexedDB con el envoltorio `idb` 8.0.4 (ISC, 1,2 kB, incluido en el archivo), porque
   web.dev recomienda IndexedDB «con un envoltorio de promesas» para datos estructurados y OPFS está pensado para
   archivos grandes y acceso sincrónico desde workers (MDN). Si IndexedDB no está disponible (navegación privada
   de algunos navegadores), la app funciona en memoria y lo avisa. */
const DB_NOMBRE = 'nido-datos';
const DB_VERSION = 1;
const COLS = ['mov', 'cfg'];
const Store = {
  mode: 'local', db: null, memoria: false, persistente: null, canal: null, local: { mov: {}, cfg: {} },
  async abrir() {
    const self = this;
    return idb.openDB(DB_NOMBRE, DB_VERSION, {
      upgrade(db, viejo) {
        // v1: una tabla por colección; la clave es el id del documento. Las versiones futuras migran acá, sin borrar nada.
        if (viejo < 1) for (const c of COLS) if (!db.objectStoreNames.contains(c)) db.createObjectStore(c);
      },
      blocking() { try { self.db && self.db.close(); } catch (e) { } self.db = null; if (typeof avisoRecargar === 'function') avisoRecargar(); },
      terminated() { self.db = null; }
    });
  },
  async init() {
    try { this.db = await this.abrir(); this.memoria = false; }
    catch (e) { console.warn('IndexedDB no disponible: los datos quedan solo en memoria', e); this.db = null; this.memoria = true; }
    await this.cargar();
    try { if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) this.persistente = await navigator.storage.persisted(); } catch (e) { this.persistente = null; }
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.canal = new BroadcastChannel('nido-datos');
        this.canal.onmessage = async ev => { if (ev.data && ev.data.tipo === 'cambio') { await this.cargar(); onData(); } };
      }
    } catch (e) { this.canal = null; }
    S.mode = 'local'; S.loaded.mov = S.loaded.cfg = true; onData();
  },
  /* Lee todo de la base (otra pestaña cambió algo, o se importó un respaldo). */
  async cargar() {
    if (this.db) {
      const out = { mov: {}, cfg: {} };
      for (const c of COLS) {
        const tx = this.db.transaction(c), st = tx.store;
        const [keys, vals] = await Promise.all([st.getAllKeys(), st.getAll()]); await tx.done;
        keys.forEach((k, i) => { out[c][k] = vals[i]; });
      }
      this.local = out;
    }
    S.movs = Object.entries(this.local.mov).map(([id, d]) => ({ id, ...d }));
    applyCfgDocs(this.local.cfg);
  },
  avisar() { try { this.canal && this.canal.postMessage({ tipo: 'cambio' }); } catch (e) { } },
  async _put(col, id, data) { if (this.db) await this.db.put(col, data, id); },
  async set(col, id, data) {
    data = clone(data); delete data.id;
    await this._put(col, id, data);
    this.local[col][id] = data;
    if (col === 'mov') { const i = S.movs.findIndex(m => m.id === id); const m = { id, ...data }; if (i > -1) S.movs[i] = m; else S.movs.push(m); } else applyCfgDocs(this.local.cfg);
    this.avisar(); onData();
  },
  async merge(col, id, data) {
    const nuevo = { ...(this.local[col][id] || {}), ...clone(data) };
    await this._put(col, id, nuevo);
    this.local[col][id] = nuevo;
    if (col === 'mov') { const i = S.movs.findIndex(m => m.id === id); const m = { id, ...nuevo }; if (i > -1) S.movs[i] = m; else S.movs.push(m); } else applyCfgDocs(this.local.cfg);
    this.avisar(); onData();
  },
  async del(col, id) {
    if (this.db) await this.db.delete(col, id);
    delete this.local[col][id];
    if (col === 'mov') S.movs = S.movs.filter(m => m.id !== id); else applyCfgDocs(this.local.cfg);
    this.avisar(); onData();
  },
  /* Todo junto, para el respaldo. */
  todo() { return clone(this.local); },
  /* Reemplaza todo en una sola transacción: o entra el respaldo entero o no cambia nada. */
  async reemplazar(datos) {
    const nuevo = { mov: clone(datos.mov || {}), cfg: clone(datos.cfg || {}) };
    if (this.db) {
      const tx = this.db.transaction(COLS, 'readwrite');
      for (const c of COLS) { const st = tx.objectStore(c); await st.clear(); for (const [id, d] of Object.entries(nuevo[c])) await st.put(d, id); }
      await tx.done;
    }
    this.local = nuevo; await this.cargar(); this.avisar(); onData();
  },
  async borrarTodo() { await this.reemplazar({ mov: {}, cfg: {} }); },
  /* Pide al navegador que no borre los datos cuando le falta espacio (en una PWA instalada suele darlo sin preguntar). */
  async pedirPersistencia() {
    try { if (navigator.storage && navigator.storage.persist) this.persistente = await navigator.storage.persist(); } catch (e) { }
    return this.persistente;
  },
  async espacio() { try { return navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null; } catch (e) { return null; } }
};
