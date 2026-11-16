// Genera src/oficina-datos-ejemplo.json: el objeto del «contrato de datos de la oficina» sacado de una partida de verdad (jugada
// sola, 6 días y pico de juego, semilla fija). Sirve para dibujar la oficina sin tener el juego andando.
//   node herramientas/ejemplo-oficina.mjs [semilla = 3] [días = 6.4]
// El objeto sale de la misma función que usa el juego (Libro.datosOficina); en el juego lo devuelve datosOficina().
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Libro from '../src/libro.js';
import { t, plata, numero, fechaTexto, horaTexto, lengua, cambiarLengua } from '../src/ui/textos.js';
import { partida } from './piloto.mjs';

if (lengua() !== 'es') cambiarLengua();
const semilla = +(process.argv[2] ?? 3), dias = +(process.argv[3] ?? 6.4);
const { s, L, partes, notas } = partida({ semilla, dias });
const ui = { t, plata, numero, fecha: (ms) => fechaTexto(new Date(ms)), hora: (ms) => horaTexto(new Date(ms)) };
const datos = Libro.datosOficina(L, s, { ui, empresa: { nombre: t('empresaDef'), color: '#cf3f2c' }, camino: (o, d) => Libro.caminoEncargo(s, o, d, t) });
const salida = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'oficina-datos-ejemplo.json');
await writeFile(salida, `${JSON.stringify(datos, null, 1)}\n`);
console.log(`${salida}\n  día ${datos.hoy.dia} · ${datos.hoy.fecha} ${datos.hoy.hora} · caja ${plata(datos.hoy.caja)} · ${datos.dias.length} días cerrados · ${datos.rutas.length} rutas · ${datos.flota.length} aviones · ${datos.bandeja.length} en la bandeja (${notas.length} resultados, ${partes.length} partes)`);
for (const d of datos.dias) console.log(`  día ${d.n} (${d.fecha}): entró ${d.entro} salió ${d.salio} cartas ${d.cartas} vuelos ${d.vuelos} a tiempo ${d.aTiempo} tarde ${d.tarde} compras ${d.compras} caja ${d.caja}`);
for (const b of datos.bandeja) console.log(`  [${b.tipo}] ${b.titulo}: ${b.texto}`);
