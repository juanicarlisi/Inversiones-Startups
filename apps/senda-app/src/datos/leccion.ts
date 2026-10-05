// Primera lección de la Travesía (Ruta Fundamentos · Sección 1 «Los comienzos» · La creación).
// Preguntas propias con su cita; pasan por revisión doctrinal antes de publicarse (capítulo 23 del proyecto).
export type Pregunta =
  | { tipo: "opcion"; enunciado: string; opciones: string[]; correcta: number; cita: { libro: string; cap: number; vers: number; txt: string } }
  | { tipo: "vf"; enunciado: string; correcta: boolean; cita: { libro: string; cap: number; vers: number; txt: string } };

export type Leccion = { id: string; ruta: string; seccion: string; titulo: string; preguntas: Pregunta[] };

export const LECCION_CREACION: Leccion = {
  id: "fund-1-1",
  ruta: "Fundamentos",
  seccion: "Sección 1 · Los comienzos",
  titulo: "La creación",
  preguntas: [
    { tipo: "opcion", enunciado: "¿Qué creó Dios «en el principio»?", opciones: ["Los cielos y la tierra", "El jardín del Edén", "Al ser humano", "El mar"], correcta: 0, cita: { libro: "GEN", cap: 1, vers: 1, txt: "Génesis 1:1" } },
    { tipo: "vf", enunciado: "Dios creó la luz el primer día.", correcta: true, cita: { libro: "GEN", cap: 1, vers: 3, txt: "Génesis 1:3-5" } },
    { tipo: "opcion", enunciado: "Completa: «Y dijo Dios: Sea la ___; y fue la ___».", opciones: ["luz", "tierra", "noche", "vida"], correcta: 0, cita: { libro: "GEN", cap: 1, vers: 3, txt: "Génesis 1:3" } },
    { tipo: "opcion", enunciado: "¿A imagen de quién fue creado el ser humano?", opciones: ["De los ángeles", "De Dios", "De los animales", "De las estrellas"], correcta: 1, cita: { libro: "GEN", cap: 1, vers: 27, txt: "Génesis 1:27" } },
    { tipo: "vf", enunciado: "Dios descansó el sexto día.", correcta: false, cita: { libro: "GEN", cap: 2, vers: 2, txt: "Génesis 2:2 (fue el séptimo)" } },
    { tipo: "opcion", enunciado: "¿Cómo se llamaba el huerto donde Dios puso al hombre?", opciones: ["Getsemaní", "Galilea", "Edén", "Sion"], correcta: 2, cita: { libro: "GEN", cap: 2, vers: 8, txt: "Génesis 2:8" } },
  ],
};
