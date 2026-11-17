# Parche propuesto para la app de la familia (v33): «Exportar copia completa»

**Estado: NO aplicado.** La app de `apps/economia-familiar/` no se tocó. Aplicarlo es decisión del fundador.

## Por qué hace falta

La versión 32 solo exporta **movimientos en CSV** (Ajustes → Datos → Exportar movimientos). Nido importa ese CSV
(probado con el propio código de la v32), pero el CSV **no trae**: el plan mensual, los cierres de mes, las metas, los
presupuestos, los saldos iniciales de los fondos, lo aprendido de cada ítem ni de qué fondo salió una compra pagada con un
fondo o un ajuste de cierre. Con la copia completa, la familia pasa a Nido **sin perder nada**; sin ella, tiene que volver a
cargar el plan, las metas y los saldos iniciales.

## El cambio (dos piezas, en `apps/economia-familiar/src/p4_app.js`)

1. Una función nueva, al lado de `exportCSV()`:

```js
async function exportarTodo() {
  const mov = {}; S.movs.forEach(({ id, ...d }) => { mov[id] = d; });
  const cfg = { main: S.cfg, plan: S.plan, metas: S.metas, aprendido: S.apr };
  Object.entries(S.cierres).forEach(([ym, c]) => { cfg['cierre_' + ym] = c; });
  const data = JSON.stringify({ formato: 'economia-familiar-respaldo', version: 32, exportado: new Date().toISOString(), datos: { mov, cfg } });
  if (S.cap.downloads) { try { await S.cap.downloads.save({ filename: `economia-familiar-copia-${hoy()}.json`, data }); } catch (e) { if (e && e.code !== 'declined') toast('No se pudo exportar.', null, true); } }
  else toast('Exportar no está disponible en esta vista.', null, true);
}
```

2. Un botón en la tarjeta «Datos» de Ajustes y su acción:

```js
// en vAjustes(), dentro de la tarjeta Datos, antes de «Exportar movimientos (CSV)»:
<button class="set-row" data-act="export-todo"><span class="grow">Exportar copia completa (para pasar a la app nueva)</span>${IC.chev}</button>
// en ACT:
'export-todo': () => exportarTodo(),
```

Después: subir `APP_BUILD` a `'v33 · …'`, correr `python3 build.py` y volver a publicar el artefacto.

## Cómo migra la familia (cuando el fundador lo decida)

1. En la app de siempre: Ajustes → «Exportar copia completa». Se descarga `economia-familiar-copia-AAAA-MM-DD.json`.
2. En Nido (en el teléfono, ya instalada): primer uso → «Ya tengo datos: importarlos» → elegir ese archivo → «Importar».
3. El archivo **no se sube a ningún repositorio** (tiene importes reales). Se borra de Descargas después de importar.

Lo que no viaja: las fotos de tickets guardadas en claude.ai (Nido avisa cuántas son; los movimientos sí entran).
La prueba `pruebas/datos.test.cjs` valida este formato exacto (envoltorio `economia-familiar-respaldo`).
