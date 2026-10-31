// pruebas/mutaciones.ts · P3 · Modelos inválidos (y válidos con avisos) con el diagnóstico exacto que el compilador tiene que dar.
// Cada caso parte del ejemplo de corte-1.md §5, cambia una cosa y declara la clave de texto esperada y el JSON Pointer del campo.
// Lo usan mutados.test.ts (cada caso da su diagnóstico) y textos.test.ts (cada clave emitida tiene texto en es y en, y cada texto
// del diccionario lo emite algún caso).
import { ejemploJson } from './ayudas.ts';

export interface Caso {
  nombre: string;
  /** Clave i18n del diagnóstico esperado: `modelo.diag.<código>[.<caso>]`. El nivel sale del código (E error, A aviso, I info). */
  clave: string;
  /** JSON Pointer esperado (si es undefined, no se revisa). */
  ruta?: string;
  entrada(): unknown;
}

export function nivelDe(clave: string): 'error' | 'aviso' | 'info' {
  const codigo = clave.split('.')[2];
  return codigo[0] === 'E' ? 'error' : codigo[0] === 'A' ? 'aviso' : 'info';
}

type Mut = (m: any) => void;
const P = 'modelo.diag.';

/** Caso que parte del ejemplo y lo muta en el lugar. */
function sobre(nombre: string, clave: string, ruta: string | undefined, f: Mut): Caso {
  return { nombre, clave: P + clave, ruta, entrada: () => { const m = ejemploJson(); f(m); return m; } };
}
/** Caso con una entrada armada a mano. */
function cruda(nombre: string, clave: string, ruta: string | undefined, entrada: () => unknown): Caso {
  return { nombre, clave: P + clave, ruta, entrada };
}

function anidado(niveles: number): unknown {
  let x: unknown = 1;
  for (let i = 0; i < niveles; i++) x = { a: x };
  return x;
}

const PARAM_DESVIO = '/parametros/desvioCamion/valor';

export const CASOS: Caso[] = [
  // ---- Forma del documento (E-ESQUEMA) ----
  sobre('esquema desconocido', 'E-ESQUEMA.esquema-desconocido', '/esquema', (m) => { m.esquema = 'anden.modelo/2'; }),
  sobre('familia desconocida', 'E-ESQUEMA.familia-desconocida', '/familia', (m) => { m.familia = 'almacen'; }),
  sobre('falta un campo requerido', 'E-ESQUEMA.requerido', '/hub', (m) => { delete m.hub; }),
  sobre('campo que no existe', 'E-ESQUEMA.campo-desconocido', '/extra', (m) => { m.extra = 1; }),
  sobre('número escrito como texto', 'E-ESQUEMA.tipo-numero', '/hub/sorter/paso', (m) => { m.hub.sorter.paso = '0.6'; }),
  sobre('id que no es texto', 'E-ESQUEMA.tipo-texto', '/id', (m) => { m.id = 5; }),
  sobre('booleano escrito como texto', 'E-ESQUEMA.tipo-booleano', '/hub/sorter/paradas/activas', (m) => { m.hub.sorter.paradas.activas = 'si'; }),
  sobre('objeto que es una lista', 'E-ESQUEMA.tipo-objeto', '/hub/playa', (m) => { m.hub.playa = []; }),
  sobre('lista que es un objeto', 'E-ESQUEMA.tipo-lista', '/hub/andenes', (m) => { m.hub.andenes = {}; }),
  sobre('Num que no es número ni referencia', 'E-ESQUEMA.tipo-num', '/demanda/papeleo', (m) => { m.demanda.papeleo = true; }),
  sobre('Dist que es un número suelto', 'E-ESQUEMA.tipo-dist', '/demanda/desvio', (m) => { m.demanda.desvio = 5; }),
  sobre('valor de parámetro que es un texto', 'E-ESQUEMA.tipo-valor', '/parametros/ausentismo/valor', (m) => { m.parametros.ausentismo.valor = 'mucho'; }),
  sobre('camiones que es un número', 'E-ESQUEMA.tipo-camiones', '/demanda/camiones', (m) => { m.demanda.camiones = 5; }),
  sobre('asignación de rampas que es un número', 'E-ESQUEMA.tipo-asignacion', '/personas/rampa/asignacion', (m) => { m.personas.rampa.asignacion = 5; }),
  sobre('id vacío', 'E-ESQUEMA.id', '/hub/andenes/0/id', (m) => { m.hub.andenes[0].id = ''; }),
  sobre('título en blanco', 'E-ESQUEMA.texto-vacio', '/titulo', (m) => { m.titulo = '   '; }),
  sobre('fecha en otro formato', 'E-ESQUEMA.fecha', '/parametros/induccionBase/fecha', (m) => { m.parametros.induccionBase.fecha = '17/10/2026'; }),
  sobre('url que no es http', 'E-ESQUEMA.url', '/parametros/induccionBase/url', (m) => { m.parametros.induccionBase.url = 'ftp://ejemplo.org'; }),
  sobre('id de plantilla con mayúsculas y espacios', 'E-ESQUEMA.plantilla-id', '/plantilla/id', (m) => { m.plantilla.id = 'Hub Chico'; }),
  sobre('versión de plantilla incompleta', 'E-ESQUEMA.plantilla-version', '/plantilla/version', (m) => { m.plantilla.version = '1.0'; }),
  sobre('puntero de la decisión sin barra', 'E-ESQUEMA.puntero', '/decision/variable/ruta', (m) => { m.decision.variable.ruta = 'personas'; }),
  sobre('nombre de parámetro que empieza con un número', 'E-ESQUEMA.nombre-parametro', '/parametros/1abc', (m) => { m.parametros['1abc'] = m.parametros.ausentismo; }),
  sobre('opción que no existe', 'E-ESQUEMA.opcion', '/unidades/tiempo', (m) => { m.unidades.tiempo = 'min'; }),
  sobre('lista que necesita al menos un elemento', 'E-ESQUEMA.lista-corta', '/hub/andenes', (m) => { m.hub.andenes = []; }),
  sobre('más escenarios que el máximo', 'E-ESQUEMA.lista-larga', '/escenarios', (m) => {
    m.escenarios = Array.from({ length: 51 }, (_, i) => ({ id: `e${i}`, titulo: `Escenario ${i}`, parche: [] }));
  }),
  sobre('150 campos desconocidos: se corta la lista de diagnósticos', 'E-ESQUEMA.demasiados', '', (m) => {
    for (let i = 0; i < 150; i++) m[`sobra${i}`] = i;
  }),
  cruda('anidamiento de 40 niveles', 'E-ESQUEMA.profundidad', undefined, () => anidado(40)),
  cruda('25.000 elementos', 'E-ESQUEMA.nodos', undefined, () => new Array(25000).fill(0)),
  cruda('clave __proto__ (JSON.parse la deja como propiedad propia)', 'E-ESQUEMA.clave-prohibida', '/__proto__', () => JSON.parse('{"__proto__":{"admin":true}}')),
  cruda('clave constructor', 'E-ESQUEMA.clave-prohibida', '/constructor', () => JSON.parse('{"constructor":{"prototype":{}}}')),
  sobre('número infinito', 'E-ESQUEMA.no-finito', '/hub/sorter/velocidad', (m) => { m.hub.sorter.velocidad = Infinity; }),
  sobre('NaN', 'E-ESQUEMA.no-finito', '/hub/sorter/paso', (m) => { m.hub.sorter.paso = NaN; }),
  sobre('texto de 1.001 caracteres', 'E-ESQUEMA.texto-largo', '/titulo', (m) => { m.titulo = 'x'.repeat(1001); }),
  sobre('texto con un carácter nulo', 'E-ESQUEMA.texto-control', '/titulo', (m) => { m.titulo = 'a\u0000b'; }),
  sobre('texto con una marca de dirección que disfraza (U+202E)', 'E-ESQUEMA.texto-control', '/titulo', (m) => { m.titulo = 'Hub ‮odnuf'; }),
  sobre('texto con un sustituto suelto (UTF-16 inválido)', 'E-ESQUEMA.texto-control', '/titulo', (m) => { m.titulo = 'a\ud800b'; }),
  cruda('un Map en lugar de un objeto', 'E-ESQUEMA.no-plano', undefined, () => new Map()),
  cruda('una función', 'E-ESQUEMA.tipo-no-json', undefined, () => () => 1),
  sobre('undefined dentro de una lista', 'E-ESQUEMA.tipo-no-json', '/hub/andenes/0', (m) => { m.hub.andenes = [undefined]; }),

  // ---- Referencias (E-REF) ----
  sobre('referencia a un parámetro que no existe', 'E-REF.parametro', '/demanda/desvio', (m) => { m.demanda.desvio = '@noExiste'; }),
  sobre('referencia a una distribución donde va un número', 'E-REF.tipo-parametro', '/demanda/papeleo', (m) => { m.demanda.papeleo = '@induccionBase'; }),
  sobre('cinta que sale de un andén inexistente', 'E-REF.anden', '/hub/cintas/0/desde', (m) => { m.hub.cintas[0].desde = 'A9'; }),
  sobre('dos cintas del mismo andén', 'E-REF.anden-dos-cintas', '/hub/cintas/1/desde', (m) => { m.hub.cintas[1].desde = 'A1'; }),
  sobre('andén sin cinta', 'E-REF.anden-sin-cinta', '/hub/andenes/2', (m) => { m.hub.cintas.pop(); }),
  sobre('ruta que apunta a una rampa inexistente', 'E-REF.rampa', '/hub/planClasificacion/rutas/0/rampas/1', (m) => { m.hub.planClasificacion.rutas[0].rampas = ['R01', 'R99']; }),
  sobre('variable de la decisión que no existe', 'E-REF.decision-ruta', '/decision/variable/ruta', (m) => { m.decision.variable.ruta = '/personas/induccion/noExiste'; }),
  sobre('variable de la decisión que no es un entero', 'E-REF.decision-ruta', '/decision/variable/ruta', (m) => { m.decision.variable.ruta = '/hub/sorter/paso'; }),

  // ---- Rangos (E-RANGO) ----
  sobre('entero con decimales', 'E-RANGO.entero', '/personas/induccion/puestosActivos', (m) => { m.personas.induccion.puestosActivos = 3.5; }),
  sobre('paso del lazo en cero (H08)', 'E-RANGO.mayor-que', '/hub/sorter/paso', (m) => { m.hub.sorter.paso = 0; }),
  sobre('velocidad negativa (H09)', 'E-RANGO.mayor-que', '/hub/sorter/velocidad', (m) => { m.hub.sorter.velocidad = -1; }),
  sobre('papeleo negativo', 'E-RANGO.minimo', '/demanda/papeleo', (m) => { m.demanda.papeleo = -5; }),
  sobre('probabilidad mayor que 1', 'E-RANGO.maximo', '/demanda/atrasoComun/probabilidad', (m) => { m.demanda.atrasoComun.probabilidad = 1.5; }),
  sobre('uniforme con min mayor que max', 'E-RANGO.orden', PARAM_DESVIO, (m) => { m.parametros.desvioCamion.valor = { tipo: 'uniforme', min: 600, max: -300 }; }),
  sobre('triangular degenerada', 'E-RANGO.orden-estricto', PARAM_DESVIO, (m) => { m.parametros.desvioCamion.valor = { tipo: 'triangular', min: 1, moda: 1, max: 1 }; }),
  sobre('discreta con valores y pesos de largos distintos', 'E-RANGO.largos-distintos', '/parametros/desvioCamion/valor/pesos', (m) => {
    m.parametros.desvioCamion.valor = { tipo: 'discreta', valores: [1, 2], pesos: [1] };
  }),
  sobre('discreta con pesos en cero', 'E-RANGO.pesos-cero', '/parametros/desvioCamion/valor/pesos', (m) => {
    m.parametros.desvioCamion.valor = { tipo: 'discreta', valores: [1, 2], pesos: [0, 0] };
  }),
  sobre('empírica desordenada', 'E-RANGO.empirica-orden', '/parametros/desvioCamion/valor/valores/1', (m) => {
    m.parametros.desvioCamion.valor = { tipo: 'empirica', valores: [3, 1] };
  }),
  sobre('Erlang con más fases que uniformes por dirección', 'E-RANGO.maximo', '/parametros/desvioCamion/valor/k', (m) => {
    m.parametros.desvioCamion.valor = { tipo: 'erlang', k: 600, media: 10 };
  }),
  sobre('lognormal con media cero', 'E-RANGO.mayor-que', '/parametros/ritmoDescarga/valor/media', (m) => { m.parametros.ritmoDescarga.valor = { tipo: 'lognormal', media: 0, cv: 0.5 }; }),
  sobre('parámetro fuera de su rango', 'E-RANGO.fuera-de-rango', '/parametros/ausentismo/valor', (m) => { m.parametros.ausentismo.valor = 0.5; }),
  sobre('pesos de «incierto» que no suman 1', 'E-RANGO.pesos-incierto', '/parametros/ausentismo/incierto/pesos', (m) => { m.parametros.ausentismo.incierto.pesos = [0.5, 0.5, 0.5]; }),
  sobre('«incierto» fuera del rango', 'E-RANGO.incierto-fuera', '/parametros/ausentismo/incierto/alto', (m) => { m.parametros.ausentismo.incierto.alto = 0.9; }),
  sobre('«incierto» desordenado', 'E-RANGO.orden', '/parametros/ausentismo/incierto', (m) => { m.parametros.ausentismo.incierto.bajo = 0.08; }),
  sobre('confianza que no está admitida', 'E-RANGO.confianza', '/experimento/confianza', (m) => { m.experimento.confianza = 0.5; }),
  sobre('duración que puede dar valores negativos', 'E-RANGO.soporte-negativo', '/demanda/atrasoComun/demora', (m) => { m.demanda.atrasoComun.demora = { tipo: 'uniforme', min: -10, max: 10 }; }),
  sobre('cinta de largo cero', 'E-RANGO.cinta-sin-largo', '/hub/cintas/2/puntos', (m) => { m.hub.cintas[2].puntos = [[-2, -10], [-2, -10]]; }),
  sobre('acumulación donde no entra un paquete', 'E-RANGO.acumulacion-sin-lugar', '/hub/acumulacion/largo', (m) => { m.hub.acumulacion.largo = 0.3; }),
  sobre('lazo de una sola bandeja', 'E-RANGO.bandejas', '/hub/sorter/paso', (m) => { m.hub.sorter.recta = 0; m.hub.sorter.radio = 0.1; }),
  sobre('lazo que avanza en menos de un milisegundo', 'E-RANGO.tick', '/hub/sorter/velocidad', (m) => { m.hub.sorter.velocidad = 1e6; }),
  sobre('asignación con menos listas que personas', 'E-RANGO.asignacion-largo', '/personas/rampa/asignacion', (m) => {
    m.personas.rampa.asignacion = [['R01', 'R02', 'R03', 'R04'], ['R05', 'R06', 'R07', 'R08'], ['R09', 'R10', 'R11', 'R12']];
  }),
  sobre('noche mostrada que no existe', 'E-RANGO.noche-mostrada', '/experimento/nocheMostrada', (m) => { m.experimento.nocheMostrada = 150; }),
  sobre('camiones sin ningún paquete', 'E-RANGO.sin-paquetes', '/demanda/camiones', (m) => { m.demanda.camiones.paquetes = 0; }),
  sobre('rutas con peso cero', 'E-RANGO.pesos-cero', '/hub/planClasificacion/rutas', (m) => { for (const r of m.hub.planClasificacion.rutas) r.peso = 0; }),
  sobre('réplicas mínimas mayores que las máximas', 'E-RANGO.orden', '/experimento/replicasMax', (m) => { m.experimento.replicasMin = 500; }),

  // ---- Chequeos que cruzan campos ----
  sobre('id de rampa repetido', 'E-ID-DUPLICADO', '/hub/rampas/1/id', (m) => { m.hub.rampas[1].id = 'R01'; }),
  sobre('un andén y una rampa con el mismo id', 'E-ID-DUPLICADO', '/hub/rampas/0/id', (m) => { m.hub.rampas[0].id = 'A1'; }),
  sobre('id de escenario repetido', 'E-ID-DUPLICADO', '/escenarios/1/id', (m) => { m.escenarios[1].id = 'base'; }),
  sobre('rampa fuera del lazo', 'E-S-FUERA-DEL-LAZO', '/hub/rampas/0/s', (m) => { m.hub.rampas[0].s = 500; }),
  sobre('lector fuera del lazo', 'E-S-FUERA-DEL-LAZO', '/hub/sorter/lector/s', (m) => { m.hub.sorter.lector.s = 90; }),
  sobre('dos rampas en la misma ranura', 'E-RANURA-REPETIDA', '/hub/rampas/1/s', (m) => { m.hub.rampas[1].s = 12.1; }),
  sobre('perfil de paquetes que no suma 1', 'E-FRACCIONES', '/hub/perfilPaquete/clases', (m) => { m.hub.perfilPaquete.clases[0].fraccion = 0.6; }),
  sobre('más puestos activos que físicos', 'E-PUESTOS', '/personas/induccion/puestosActivos', (m) => { m.personas.induccion.puestosActivos = 6; }),
  sobre('más temporarios que puestos activos', 'E-TEMPORARIOS', '/personas/induccion/temporarios', (m) => { m.personas.induccion.temporarios = 4; }),
  sobre('fin del turno antes del inicio', 'E-HORAS.orden', '/calendario/fin', (m) => { m.calendario.fin = '21:00'; }),
  sobre('hora que no existe', 'E-HORAS.formato', '/calendario/corte', (m) => { m.calendario.corte = '25:75'; }),
  sobre('hora con formato de 12 horas', 'E-HORAS.formato', '/calendario/inicio', (m) => { m.calendario.inicio = '10:00 PM'; }),
  sobre('corte antes del inicio', 'E-HORAS.corte', '/calendario/corte', (m) => { m.calendario.corte = '21:00'; }),
  sobre('pausa que dura todo el ciclo', 'E-PAUSAS', '/personas/induccion/pausas/duracion', (m) => { m.personas.induccion.pausas.duracion = 7200; }),
  sobre('rampas sin ninguna persona', 'E-RAMPA-SIN-PERSONA.ninguna', '/personas/rampa/cantidad', (m) => { m.personas.rampa.cantidad = 0; }),
  sobre('rampa que ninguna persona atiende', 'E-RAMPA-SIN-PERSONA.rampa', '/hub/rampas/6', (m) => {
    m.personas.rampa.asignacion = [['R01'], ['R02'], ['R03'], ['R04'], ['R05'], ['R06']];
  }),
  sobre('ruta sin rampa', 'E-RUTA-SIN-RAMPA', '/hub/planClasificacion/rutas/2/rampas', (m) => { m.hub.planClasificacion.rutas[2].rampas = []; }),
  sobre('rampa en dos rutas', 'E-RAMPA-EN-DOS-RUTAS', '/hub/planClasificacion/rutas/3/rampas/0', (m) => { m.hub.planClasificacion.rutas[3].rampas = ['R03']; }),
  sobre('misma rampa dos veces en una ruta', 'E-ID-DUPLICADO', '/hub/planClasificacion/rutas/0/rampas/1', (m) => { m.hub.planClasificacion.rutas[0].rampas = ['R01', 'R01']; }),
  sobre('paquetes: 1e9 (H07)', 'E-PRESUPUESTO.paquetes', '/demanda/camiones', (m) => { m.demanda.camiones.paquetes = 1e9; }),
  sobre('un millón de camiones', 'E-PRESUPUESTO.paquetes', '/demanda/camiones', (m) => { m.demanda.camiones.cantidad = 1e6; }),
  sobre('pasos del lazo que no entran en el presupuesto de eventos', 'E-PRESUPUESTO.eventos', '', (m) => { m.hub.sorter.paso = 0.001; }),
  sobre('una película de 23 millones de tramos (SEG-01: 40 camiones de 48.100 paquetes, sin error de pronóstico)', 'E-PRESUPUESTO.traza', '/demanda/camiones', (m) => {
    m.demanda.camiones.cantidad = 40; m.demanda.camiones.paquetes = 48100; m.parametros.errorPronosticoCv.valor = 0;
  }),
  sobre('una acumulación con un lugar cada nanómetro pediría terabytes', 'E-PRESUPUESTO.memoria', '', (m) => { m.hub.acumulacion.paso = 1e-9; }),
  sobre('una acumulación de 1e12 m (más que la cota física de 2.000 m, SEG-R1)', 'E-RANGO.maximo', '/hub/acumulacion/largo', (m) => { m.hub.acumulacion.largo = 1e12; }),
  sobre('una coordenada a mil millones de metros (SEG-R1)', 'E-RANGO.maximo', '/hub/acumulacion/x', (m) => { m.hub.acumulacion.x = 1e9; }),
  sobre('una cinta de 12 km (SEG-R1)', 'E-RANGO.cinta-larga', '/hub/cintas/0/puntos', (m) => { m.hub.cintas[0].puntos = [[-14, -10], [4000, -10], [-4000, -10]]; }),
  sobre('un lazo con un paso de 1 cm: 8.500 bandejas por cuadro (SEG-R2)', 'E-PRESUPUESTO.dibujo', '/hub/sorter/paso', (m) => { m.hub.sorter.paso = 0.01; }),
  sobre('maxVueltas de 255: los contadores del motor son de 8 bits (REV-D3)', 'E-RANGO.maximo', '/hub/sorter/maxVueltas', (m) => { m.hub.sorter.maxVueltas = 255; }),
  sobre('1.900.000 personas en un andén (SEG-R3)', 'E-RANGO.maximo', '/hub/andenes/0/personas', (m) => { m.hub.andenes[0].personas = 1_900_000; }),
  sobre('un lazo de mil millones de metros (más que la cota física de 2.000 m de recta)', 'E-RANGO.maximo', '/hub/sorter/recta', (m) => { m.hub.sorter.recta = 1e9; }),
  sobre('una rampa con capacidad de mil millones', 'E-PRESUPUESTO.memoria', '', (m) => { m.hub.rampas[0].capacidad = 1e9; }),
  sobre('una rampa con mil millones de lugares', 'E-PRESUPUESTO.memoria', '', (m) => { m.hub.rampas[0].capacidad = 1e9; }),
  sobre('mil millones de personas de rampa (más que el máximo por rol, SEG-R3)', 'E-RANGO.maximo', '/personas/rampa/cantidad', (m) => { m.personas.rampa.cantidad = 1e9; }),
  sobre('una playa de capacidad 1e12', 'E-PRESUPUESTO.memoria', '', (m) => { m.hub.playa.capacidad = 1e12; }),
  sobre('pausas cada milisegundo', 'E-PRESUPUESTO.recurrentes', '', (m) => {
    m.personas.rampa.pausas = { duracion: 0.0005, cada: 0.001, primera: 0, escalon: 0 };
  }),
  sobre('micro-paradas cada 0,8 milisegundos', 'E-PRESUPUESTO.recurrentes', '', (m) => {
    m.parametros.paradaLazoEntre.valor = { tipo: 'fija', valor: 0.0004 };
    m.parametros.paradaLazoDuracion.valor = { tipo: 'fija', valor: 0.0004 };
  }),
  sobre('moneda de los costos distinta de la del modelo', 'E-UNIDAD', '/costos/moneda', (m) => { m.costos.moneda = 'USD'; }),

  // ---- Escenarios y decisión ----
  sobre('escenario que deja el modelo inválido', 'E-ESCENARIO.invalido', '/escenarios/1/parche', (m) => {
    m.escenarios[1].parche = [{ op: 'replace', path: '/personas/induccion/puestosActivos', value: 9 }];
  }),
  sobre('escenario con un parche que no se puede aplicar', 'E-ESCENARIO.parche', '/escenarios/1/parche/0', (m) => {
    m.escenarios[1].parche = [{ op: 'replace', path: '/personas/noExiste', value: 1 }];
  }),
  sobre('escenario con un test que falla', 'E-ESCENARIO.parche', '/escenarios/1/parche/0', (m) => {
    m.escenarios[1].parche = [{ op: 'test', path: '/personas/induccion/puestosActivos', value: 99 }];
  }),
  sobre('decisión con mínimo mayor que máximo', 'E-DECISION.orden', '/decision/variable', (m) => { m.decision.variable.min = 5; m.decision.variable.max = 2; }),
  sobre('decisión con demasiados valores', 'E-DECISION.rango', '/decision/variable', (m) => { m.decision.variable.max = 100; }),
  sobre('un valor de la decisión que deja el modelo inválido', 'E-DECISION.valor', '/decision/variable', (m) => { m.decision.variable.max = 6; }),

  // ---- Avisos (el modelo compila) ----
  sobre('pesos de rutas que no suman 1 (se normalizan)', 'A-PESOS', '/hub/planClasificacion/rutas', (m) => { m.hub.planClasificacion.rutas[0].peso = 0.4; }),
  sobre('la descarga no da abasto', 'A-RHO.descarga', '/personas/descarga/ritmo', (m) => { for (const a of m.hub.andenes) a.personas = 1; }),
  sobre('la inducción no da abasto', 'A-RHO.induccion', '/personas/induccion/puestosActivos', (m) => { m.personas.induccion.puestosActivos = 2; }),
  sobre('el sorter no da abasto', 'A-RHO.sorter', '/hub/sorter/velocidad', (m) => { m.hub.sorter.velocidad = 0.5; }),
  sobre('las rampas no dan abasto', 'A-RHO.rampas', '/personas/rampa/cantidad', (m) => { m.personas.rampa.cantidad = 2; }),
  sobre('corte imposible con las capacidades medias', 'A-CORTE-IMPOSIBLE', '/calendario/corte', (m) => { m.calendario.corte = '24:00'; }),
  sobre('«incierto.medio» distinto del valor', 'A-INCIERTO', '/parametros/ausentismo/incierto/medio', (m) => { m.parametros.ausentismo.incierto.medio = 0.06; }),
  sobre('procedencia de un campo que no existe', 'A-PROCEDENCIA', '/procedencia/~1hub~1noExiste', (m) => {
    m.procedencia['/hub/noExiste'] = { etiqueta: 'SUPUESTO', fuente: 'Prueba.' };
  }),
  sobre('rampa que no pertenece a ninguna ruta', 'A-RAMPA-SIN-RUTA', '/hub/rampas/12', (m) => { m.hub.rampas.push({ id: 'R13', s: 62, lado: 1, capacidad: 20 }); }),
  sobre('sorter de banda cruzada (el motor del corte 1 lo simula como bandejas: HUB-R11)', 'A-SORTER-TIPO', '/hub/sorter/tipo', (m) => { m.hub.sorter.tipo = 'banda-cruzada'; }),
  sobre('el ejemplo limpio informa los supuestos', 'I-SUPUESTOS', '/parametros', () => {}),
  sobre('el ejemplo limpio informa los controles', 'I-CONTROLES', '', () => {}),
];
