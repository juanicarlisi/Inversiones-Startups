// Pulso: una pregunta por día. Sin servidor todavía: los porcentajes son de ejemplo y se muestran como tales.
import { diaDelAnio } from "../util/fechas";

export type Pulso = { pregunta: string; opciones: [string, string]; ejemplo: [number, number] };

const PULSOS: Pulso[] = [
  { pregunta: "¿Leíste la Biblia hoy antes de abrir las redes?", opciones: ["Sí", "Todavía no"], ejemplo: [63, 37] },
  { pregunta: "¿Te cuesta más leer la Biblia de mañana o de noche?", opciones: ["De mañana", "De noche"], ejemplo: [41, 59] },
  { pregunta: "¿Oraste hoy por alguien de tu grupo?", opciones: ["Sí", "Todavía no"], ejemplo: [55, 45] },
  { pregunta: "¿Prefieres leer solo o con amigos?", opciones: ["Solo", "Con amigos"], ejemplo: [48, 52] },
];

export function pulsoDeHoy(d: Date = new Date()): Pulso {
  return PULSOS[diaDelAnio(d) % PULSOS.length];
}
