// Pruebas de la capa de datos con el almacén en memoria (IndexedDB se prueba en el navegador).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { crearAlmacenMemoria, COPIAS_DIARIAS } from '../src/datos/almacen.js';
import { crearRepositorio } from '../src/datos/repositorio.js';
import { dn } from '../src/modelo/fechas.js';

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const plan = (n) => ({ areas: [{ id: 'a', n, color: '#2f6fed' }], projects: [], tasks: [] });

test('repositorio: junta cambios seguidos, sube la revisión y guarda el formato', async () => {
  const almacen = crearAlmacenMemoria();
  let escrituras = 0;
  const original = almacen.escribir;
  almacen.escribir = async (d) => {
    escrituras++;
    return original(d);
  };
  const estados = [];
  const repo = crearRepositorio({ almacen, demora: 20, canal: 'prueba-1', alEstado: (s) => estados.push(s) });
  assert.equal(await repo.cargar(), null);
  repo.guardar(plan('uno'));
  repo.guardar(plan('dos'));
  repo.guardar(plan('tres'), { ultimaCopia: '2026-11-17' });
  await espera(60);
  assert.equal(escrituras, 1);
  const doc = await almacen.leer();
  assert.equal(doc.plan.areas[0].n, 'tres');
  assert.equal(doc.formato, 1);
  assert.equal(doc.rev, 1);
  assert.equal(doc.meta.ultimaCopia, '2026-11-17');
  assert.equal(estados.at(-1), 'guardado');
  repo.cerrar();
});

test('repositorio: «ahora» escribe sin esperar y lo guardado no cambia si se toca el plan después', async () => {
  const almacen = crearAlmacenMemoria();
  const repo = crearRepositorio({ almacen, demora: 10000, canal: 'prueba-2' });
  const p = plan('a');
  repo.guardar(p);
  p.areas[0].n = 'cambiado después';
  await repo.ahora();
  assert.equal((await almacen.leer()).plan.areas[0].n, 'a');
  repo.cerrar();
});

test('repositorio: si falla la escritura, avisa y reintenta sin perder el cambio', async () => {
  const almacen = crearAlmacenMemoria();
  let fallar = true;
  const original = almacen.escribir;
  almacen.escribir = async (d) => {
    if (fallar) throw new Error('disco lleno');
    return original(d);
  };
  const estados = [];
  const repo = crearRepositorio({ almacen, demora: 5, canal: 'prueba-3', alEstado: (s) => estados.push(s) });
  repo.guardar(plan('importante'));
  await espera(30);
  assert.equal(repo.estado, 'error');
  fallar = false;
  await repo.ahora();
  assert.equal((await almacen.leer()).plan.areas[0].n, 'importante');
  assert.equal(repo.estado, 'guardado');
  repo.cerrar();
});

test('repositorio: otra pestaña ve el cambio (BroadcastChannel)', async () => {
  const almacen = crearAlmacenMemoria();
  let recibido = null;
  const a = crearRepositorio({ almacen, demora: 5, canal: 'prueba-4', dispositivo: 'A' });
  const b = crearRepositorio({ almacen, demora: 5, canal: 'prueba-4', dispositivo: 'B', alCambioExterno: (d) => (recibido = d) });
  await a.cargar();
  await b.cargar();
  a.guardar(plan('desde A'));
  await espera(80);
  assert.equal(recibido?.plan.areas[0].n, 'desde A');
  assert.equal(b.rev, 1);
  a.cerrar();
  b.cerrar();
});

test('repositorio: copia automática una vez por día, guarda las últimas 7', async () => {
  const almacen = crearAlmacenMemoria();
  let dia = dn('2026-11-01');
  const repo = crearRepositorio({ almacen, demora: 1, canal: 'prueba-5', hoy: () => dia });
  repo.guardar(plan('v1'));
  await repo.ahora();
  for (let i = 0; i < 10; i++) {
    await repo.cargar();
    await repo.cargar(); // el mismo día no duplica
    dia++;
  }
  const copias = await almacen.listarCopias();
  assert.equal(copias.length, COPIAS_DIARIAS);
  assert.equal(copias[0].dia, '2026-11-10');
  repo.cerrar();
});

test('repositorio: enchufe para la sincronización del corte 3', async () => {
  const almacen = crearAlmacenMemoria();
  const publicados = [];
  let entregar;
  const sincronizador = {
    publicar: (d) => publicados.push(d.rev),
    suscribir: (fn) => {
      entregar = fn;
      return () => {};
    },
  };
  let externo = null;
  const repo = crearRepositorio({ almacen, demora: 1, canal: 'prueba-6', sincronizador, alCambioExterno: (d) => (externo = d) });
  repo.guardar(plan('local'));
  await repo.ahora();
  assert.deepEqual(publicados, [1]);
  await entregar({ rev: 1, plan: plan('viejo') }); // no es más nuevo: se ignora
  assert.equal(externo, null);
  await entregar({ rev: 5, plan: plan('de otro dispositivo') });
  assert.equal(externo.plan.areas[0].n, 'de otro dispositivo');
  assert.equal(repo.rev, 5);
  repo.cerrar();
});
