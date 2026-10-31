// pruebas/hostiles/entradas.ts · P3 · Las 12 entradas hostiles H01–H12 de corte-1.md §9 (P3), sus variantes y H13–H17 (revisión del
// 30-10-2026: geometría enorme, lazo enorme y personas de más).
// Cada una se arma en el momento (algunas pesan megabytes: no se guardan como archivos) y declara el error del enlace esperado.
// El decodificador tiene que devolver ese error, sin lanzar y sin colgarse; las pruebas miden que lo haga con memoria acotada
// (el contador de bytes corta la descompresión) y dentro de un tiempo razonable.
import type { ErrorEnlace } from '../../../contratos/escena.ts';
import { aBase64url, comprimir } from '../../enlace.ts';
import { ejemploJson } from '../ayudas.ts';

export interface Hostil {
  id: string;
  nombre: string;
  esperado: ErrorEnlace;
  /** Fragmento (sin «#») que recibe el decodificador. */
  fragmento(): Promise<string>;
}

const UTF8 = new TextEncoder();

/** Fragmento `m=` con el texto tal cual (sin pasar por el JSON canónico: así se pueden escribir cosas que el canónico no deja). */
export async function fragmentoDeTexto(texto: string, clave = 'm'): Promise<string> {
  return `${clave}=${aBase64url(await comprimir(UTF8.encode(texto)))}`;
}
async function fragmentoDeBytes(bytes: Uint8Array): Promise<string> {
  return `m=${aBase64url(await comprimir(bytes))}`;
}

/** El ejemplo, serializado, con un cambio hecho sobre el objeto antes de serializar. */
function ejemploCon(f: (m: ReturnType<typeof ejemploJson>) => void): string {
  const m = ejemploJson();
  f(m);
  return JSON.stringify(m);
}

export const HOSTILES: Hostil[] = [
  {
    // Una bomba de deflate real: ceros que se inflan ~1.000 veces. Deflate no pasa de 1.032:1, así que «1 KB → 100 MB» no existe;
    // la mayor que cabe en 16.000 caracteres de fragmento son ~12 KB que se inflan a ~12 MB (también se prueba 100 MB directo
    // sobre el descompresor en hostiles.test.ts).
    id: 'H01', nombre: 'bomba de deflate (~10 KB → 10 MB de ceros)', esperado: 'bomba',
    fragmento: () => fragmentoDeBytes(new Uint8Array(10_000_000)),
  },
  {
    id: 'H02', nombre: 'JSON con 1.000 niveles de anidamiento', esperado: 'json-profundo',
    fragmento: () => fragmentoDeTexto('['.repeat(1000) + ']'.repeat(1000)),
  },
  {
    // 10^6 nodos ocupan 2 MB de texto: el contador de bytes los corta antes de parsear nada.
    id: 'H03', nombre: 'JSON con 1.000.000 de nodos', esperado: 'bomba',
    fragmento: () => fragmentoDeTexto('[' + '0,'.repeat(999_999) + '0]'),
  },
  {
    id: 'H03b', nombre: 'JSON con 25.000 nodos (cabe en los bytes pero pasa el tope de nodos)', esperado: 'json-profundo',
    fragmento: () => fragmentoDeTexto('[' + '0,'.repeat(24_999) + '0]'),
  },
  {
    id: 'H04', nombre: 'un texto de 1 MB', esperado: 'bomba',
    fragmento: () => fragmentoDeTexto(JSON.stringify({ titulo: 'x'.repeat(1_000_000) })),
  },
  {
    id: 'H04b', nombre: 'un título de 100 KB dentro de un modelo (cabe en los bytes pero pasa el tope de texto)', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.titulo = 'x'.repeat(100_000); })),
  },
  {
    id: 'H05', nombre: '"__proto__" como clave', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(JSON.stringify(ejemploJson()).replace('{', '{"__proto__":{"polluted":true},')),
  },
  {
    id: 'H05b', nombre: '"constructor" con "prototype" como claves anidadas', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(JSON.stringify(ejemploJson()).replace('{', '{"constructor":{"prototype":{"polluted":true}},')),
  },
  {
    id: 'H06', nombre: 'el número 1e999 (infinito al parsear)', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.hub.sorter.velocidad = 1234567; }).replace('1234567', '1e999')),
  },
  {
    id: 'H07', nombre: 'paquetes: 1e9 (el presupuesto lo rechaza antes de correr)', esperado: 'presupuesto',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.demanda.camiones.paquetes = 1e9; })),
  },
  {
    // SEG-01 (revisión del 19-10-2026): pasaba los topes de paquetes (1.924.000 de 2.000.000) y de eventos y su película pedía 11,5
    // millones de tramos (1,2 GB en la pestaña). Ahora la rechaza el tope de tramos de la película.
    id: 'H07b', nombre: '40 camiones de 48.100 paquetes sin error de pronóstico (película de 23 millones de tramos)', esperado: 'presupuesto',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => {
      m.demanda.camiones.cantidad = 40; m.demanda.camiones.paquetes = 48100; m.parametros.errorPronosticoCv.valor = 0;
    })),
  },
  {
    id: 'H08', nombre: 'paso: 0', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.hub.sorter.paso = 0; })),
  },
  {
    id: 'H09', nombre: 'velocidad: -1', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.hub.sorter.velocidad = -1; })),
  },
  {
    id: 'H10', nombre: 'esquema desconocido', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.esquema = 'anden.modelo/9'; })),
  },
  {
    id: 'H11', nombre: 'plantilla desconocida', esperado: 'plantilla-desconocida',
    fragmento: async () => 't=no-existe@1.0.0',
  },
  {
    id: 'H12', nombre: 'fragmento con caracteres fuera de base64url', esperado: 'formato',
    fragmento: async () => 'm=abc+def/ghi=jkl%20mno',
  },
  // Revisión del 30-10-2026 (SEG-R1, SEG-R2 y SEG-R3): enlaces de ~6 KB que el esquema aceptaba, simulaban bien y colgaban o tiraban la
  // pestaña al dibujar (una grilla cada 4 m sobre mil millones de metros, un millón de bandejas por cuadro, una película de 11,5 millones
  // de tramos). Ahora los rechaza el esquema o el presupuesto antes de correr.
  {
    id: 'H13', nombre: 'acumulación a 1e9 m del origen (la grilla del piso colgaba la pestaña)', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.hub.acumulacion.x = 1e9; })),
  },
  {
    id: 'H14', nombre: 'origen del lazo en (1e12, 1e12) (la pestaña se caía)', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.hub.sorter.origen = [1e12, 1e12]; })),
  },
  {
    id: 'H15', nombre: 'andén y cinta a 1e9 m (la disposición recorría la cinta cada medio metro)', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => {
      m.hub.andenes[0].x = 1e9;
      m.hub.cintas[0].puntos = [[1e9, m.hub.andenes[0].y], ...m.hub.cintas[0].puntos.slice(1)];
    })),
  },
  {
    id: 'H16', nombre: 'lazo con recta de 300.000 m (un millón de bandejas por cuadro)', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.hub.sorter.recta = 300_000; })),
  },
  {
    id: 'H16b', nombre: 'lazo con paso de 1 cm (8.500 bandejas: pasa la memoria pero no el dibujo)', esperado: 'presupuesto',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.hub.sorter.paso = 0.01; })),
  },
  {
    id: 'H17', nombre: '1.900.000 personas en un andén (película de 11,5 millones de tramos)', esperado: 'esquema',
    fragmento: () => fragmentoDeTexto(ejemploCon((m) => { m.hub.andenes[0].personas = 1_900_000; })),
  },
];

/** Un fragmento por cada defecto distinto del formato (no son H01–H12: son lo que haría un atacante con paciencia). */
export const FRAGMENTOS_MALFORMADOS: { nombre: string; fragmento: string; esperado: ErrorEnlace }[] = [
  { nombre: 'vacío', fragmento: '', esperado: 'formato' },
  { nombre: 'solo el numeral', fragmento: '#', esperado: 'formato' },
  { nombre: 'clave desconocida', fragmento: 'x=abc', esperado: 'formato' },
  { nombre: 'sin signo igual', fragmento: 'abc', esperado: 'formato' },
  { nombre: 'sin valor', fragmento: 'm=', esperado: 'formato' },
  { nombre: 'sin clave', fragmento: '=abc', esperado: 'formato' },
  { nombre: 'm repetida', fragmento: 'm=abcd&m=abcd', esperado: 'formato' },
  { nombre: 'm con t', fragmento: 'm=abcd&t=hub-chico@1.0.0', esperado: 'formato' },
  { nombre: 'p sin t', fragmento: 'p=abcd', esperado: 'formato' },
  { nombre: 't con formato inválido', fragmento: 't=Hub Chico@1', esperado: 'formato' },
  { nombre: 't con versión incompleta', fragmento: 't=hub-chico@1.0', esperado: 'formato' },
  { nombre: 'm con una letra de más (largo 4n+1)', fragmento: 'm=abcde', esperado: 'formato' },
  { nombre: 'm con una ñ', fragmento: 'm=abcdñ', esperado: 'formato' },
  { nombre: 'm con espacio', fragmento: 'm=abc d', esperado: 'formato' },
  { nombre: 'm que no es deflate', fragmento: 'm=AAAAAAAA', esperado: 'formato' },
  { nombre: 'solo & ', fragmento: '&&&', esperado: 'formato' },
  { nombre: 'r con base64url inválido', fragmento: 'r=+++', esperado: 'formato' },
  { nombre: 'r con una versión de formato desconocida', fragmento: 'r=Ag', esperado: 'formato' },
  { nombre: 'r truncada', fragmento: 'r=AQSR', esperado: 'formato' },
  { nombre: 'muy largo', fragmento: 'm=' + 'A'.repeat(16001), esperado: 'muy-largo' },
];
