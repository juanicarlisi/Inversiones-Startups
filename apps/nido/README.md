# Nido · corte 0 «Separar casa y producto»

Web instalable (PWA) de finanzas de la casa: gastos con carga rápida, cuotas, tarjetas con cierre, plan mensual, fondos,
metas y cierre de mes. Parte de la app de la familia (`../economia-familiar/`, versión 32), **sin datos ni nombres de nadie**,
con los datos guardados en el propio dispositivo y andando sin red. Ficha: `oportunidades/proyectos/P10-nido.yaml`.
El nombre es configurable en un solo lugar: `src/marca.json` (hoy «Nido»; si se elige «Alero», se cambia ahí y se rearma).

## Cómo se arma, se prueba y se apaga

```bash
cd apps/nido
python3 build.py                  # arma web/ (index.html, manifest, sw.js con la versión)
npm install                       # solo para las pruebas (fake-indexeddb 6.2.8)
npm test                          # 17 pruebas de unidad: node --test pruebas/*.test.cjs
node pruebas/e2e.cjs              # punta a punta con Chromium + capturas en capturas/
node pruebas/servidor.cjs 8765    # verla en http://localhost:8765/
node arte/render.cjs              # solo si cambia el ícono (SVG → PNG)
```

Para publicarla alcanza con servir `web/` por HTTPS (cualquier hosting estático). No se publicó nada.
**Apagarla:** dejar de servir `web/`. Los datos de cada familia quedan en su teléfono; antes de apagar, avisar para que
guarden un respaldo (Ajustes → Tus datos).

## Qué cambió contra la app de la familia

| Tema | App de la familia (v32) | Nido (corte 0) |
|---|---|---|
| Datos | Base compartida del artefacto de claude.ai | IndexedDB en el dispositivo (`src/p1d_store.js`), misma interfaz `Store` (init, set, merge, del) + respaldo e importación |
| Valores de fábrica | Nombres, bancos, tarjetas y fondos de la familia | Plantilla genérica: rubros comunes, tarjetas a elegir (Visa, Mastercard, Amex, Naranja X, Cabal u otra), tres fondos en cero |
| Primer uso | No había | 3 pasos (nombres opcionales, tarjetas, ejemplo opcional) y abre la carga rápida: primer gasto en segundos (la app mide cuánto tardó) |
| Diezmo | Rubro y cálculo siempre a la vista | Módulo «Mayordomía», apagado de fábrica (dato sensible); se prende solo si la copia importada ya lo usaba |
| Carga rápida | «Uber 4500 visa» | Además «1500 verdu», «15 lucas súper visa», «gasté 2 mil en la farmacia con débito», «un palo» |
| Fotos de tickets | Lectura con Claude dentro del artefacto | Oculto: llega en el corte 1 con un tope por hogar. Pegar texto sigue, y se lee en el teléfono |
| Exportar | Solo CSV de movimientos | Respaldo completo JSON (`formato: nido-respaldo`, `version: 1`), CSV con las mismas columnas, importación de todo |
| Tarjetas | Solo el día de cierre | Agregar, renombrar, quitar (si no tienen movimientos) |
| Web instalable | No | Manifiesto, íconos propios (nido con dos huevos), service worker, actualización con un toque sin tocar datos, tema claro/oscuro/automático, atajo «Cargar un gasto» |
| Tipografías | Google Fonts | Manrope y Bricolage Grotesque servidas por la app (OFL 1.1, `web/fuentes/`) |
| Privacidad | — | Política de contenido que no deja salir nada (`connect-src 'self'`); métricas solo locales |
| Paleta | Azul, contraste justo en textos chicos | Propia, medida: todo texto ≥ 4,5:1 sobre su fondo en claro y oscuro |

**Migrar a la familia:** la v32 no exporta todo. Nido importa su CSV (solo movimientos) y, completa, la copia que agrega el
parche propuesto en `migracion/parche-v33-exportar-todo.md` (no aplicado: lo decide el fundador). Probado con una copia
inventada con el mismo formato (`pruebas/datos/generar.cjs`): los totales por mes, el patrimonio y las tarjetas dan igual
que en la app vieja, calculados con su propio código.

## Herramientas elegidas (regla 10)

- **IndexedDB + idb 8.0.4** (ISC, 1,2 kB, incluido en el archivo) · web.dev «Storage for the web» y MDN OPFS (14-07-2025) · web.dev recomienda IndexedDB con envoltorio de promesas para datos estructurados; OPFS es para archivos grandes y acceso sincrónico en workers · **corte:** si una familia pasa ~50 MB o las búsquedas tardan >100 ms en un teléfono de gama media, SQLite WASM sobre OPFS detrás de la misma `Store`.
- **Service worker propio** (~35 líneas, precaché versionada por hash en `build.py`) · Workbox 7.4.1 (MIT) evaluado y descartado: sumaba una cadena de armado en Node para 14 archivos · **corte:** si entran caché de imágenes, rutas dinámicas o sincronización en segundo plano (corte 1), pasar a Workbox.
- **Fontsource 5.3.0** (Manrope y Bricolage Grotesque variables, OFL-1.1) · npm · woff2 latin y latin-ext, sin pedidos a terceros · **corte:** ninguno previsible.
- **Lector CSV propio** (30 líneas, formato conocido de la app) · PapaParse (MIT) descartado para este caso · **corte:** cuando se importen CSV de bancos (corte 2), PapaParse.
- **Pruebas:** `node --test`, fake-indexeddb 6.2.8 (Apache-2.0) y Playwright 1.63.0 (ya instalado; Chromium sin `executablePath`).

## Cosas de la app vieja que parecen errores (anotadas, sin cambiar su lógica)

1. En el asistente de cierre, los pagos del plan que se confirman ahí se guardan como **efectivo** aunque el ítem del plan diga tarjeta (`movDesdePlan(..., 'ef')` en `wSave`): cuentan en el mes y no en el del resumen. Se mantiene igual en Nido hasta decidirlo.
2. Las cuotas se redondean a centavos por separado: 100.000 en 3 cuotas suman 99.999,99. Probado; se deja así.
3. Los recorridos de meses tienen topes: `acumulado` 72 meses, `primerMesSinCerrar` 60 y el arrastre anual 120. A los 6 años de uso el patrimonio dejaría de sumar meses. Para el corte 1.
4. El CSV pierde de qué fondo salió una compra pagada con un fondo y el fondo de los ajustes de cierre (Nido los junta en «Fondo sin identificar» y lo avisa).
5. Si la familia borraba todas las tarjetas o todos los fondos, al recargar volvían los de fábrica. **Corregido en Nido** (solo se completan si faltan).
6. Inicio decía «10% de los ingresos» aunque el porcentaje del plan fuera otro. **Corregido** (muestra el que está cargado).
7. El estilo de foco (`:focus-visible{border-radius:8px}`) deformaba los botones al tocarlos con teclado. **Corregido** (solo CSS).
8. El rubro diezmo se sugería por palabras («iglesia», «donación») aunque el rubro no existiera. **Corregido** con la regla de solo sugerir rubros activos.

## Qué queda para el corte 1

- Cuentas y sincronización de la pareja con cifrado de punta a punta: se enchufa en `Store` (las escrituras ya pasan todas por ahí y avisan a otras pestañas).
- Tickets con IA (función en el borde con tope por hogar): el código de lectura está y se activa con `S.cap.sample`.
- Sacar los topes de meses del punto 3; decidir el punto 1.
- Que la familia del fundador migre: aplicar el parche v33 o aceptar el CSV.
- Política de privacidad y textos legales con abogado; landing y lista de espera.
