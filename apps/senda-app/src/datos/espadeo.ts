// Banco inicial de Espadeo: dos preguntas por categoría para la ruleta de práctica (el banco completo llega en el MVP).
import type { Categoria } from "../tema";

export type PreguntaEspadeo = { cat: Categoria; enunciado: string; opciones: string[]; correcta: number; cita: string };

export const BANCO: PreguntaEspadeo[] = [
  { cat: "escudo", enunciado: "¿Quién construyó el arca?", opciones: ["Moisés", "Noé", "Abraham", "David"], correcta: 1, cita: "Génesis 6:14" },
  { cat: "escudo", enunciado: "¿Quién venció a Goliat?", opciones: ["Saúl", "Sansón", "David", "Josué"], correcta: 2, cita: "1 Samuel 17:50" },
  { cat: "espada", enunciado: "¿En qué libro está «Jehová es mi pastor; nada me faltará»?", opciones: ["Salmos", "Proverbios", "Isaías", "Juan"], correcta: 0, cita: "Salmo 23:1" },
  { cat: "espada", enunciado: "Completa: «Porque de tal manera amó Dios al ___…»", opciones: ["pueblo", "mundo", "hombre", "cielo"], correcta: 1, cita: "Juan 3:16" },
  { cat: "casco", enunciado: "¿Qué pueblo salió de Egipto guiado por Moisés?", opciones: ["Babilonia", "Roma", "Israel", "Asiria"], correcta: 2, cita: "Éxodo 12–14" },
  { cat: "casco", enunciado: "¿Qué libro cuenta el día de Pentecostés y el comienzo de la iglesia?", opciones: ["Romanos", "Hechos", "Juan", "Apocalipsis"], correcta: 1, cita: "Hechos 2" },
  { cat: "coraza", enunciado: "¿Cuántos mandamientos escribió Dios en las tablas del Sinaí?", opciones: ["Siete", "Doce", "Cinco", "Diez"], correcta: 3, cita: "Deuteronomio 10:4" },
  { cat: "coraza", enunciado: "Según Jesús, ¿cuál es el primero y gran mandamiento?", opciones: ["Amar a Dios con todo el corazón", "Guardar el día de reposo", "Ofrecer sacrificios", "Ayunar dos veces por semana"], correcta: 0, cita: "Mateo 22:37-38" },
  { cat: "cinturon", enunciado: "Jesús dijo: «Yo soy el camino, y la verdad, y la…»", opciones: ["luz", "puerta", "vida", "paz"], correcta: 2, cita: "Juan 14:6" },
  { cat: "cinturon", enunciado: "¿Qué día de la semana resucitó Jesús?", opciones: ["El viernes", "El primer día de la semana", "El sábado", "El quinto día"], correcta: 1, cita: "Lucas 24:1" },
  { cat: "botas", enunciado: "¿En qué ciudad nació Jesús?", opciones: ["Nazaret", "Jerusalén", "Belén", "Capernaúm"], correcta: 2, cita: "Mateo 2:1" },
  { cat: "botas", enunciado: "¿A qué ciudad mandó Dios a Jonás?", opciones: ["Tarsis", "Nínive", "Jope", "Babilonia"], correcta: 1, cita: "Jonás 1:2" },
];

export function preguntaAlAzar(cat: Categoria, excepto?: string): PreguntaEspadeo {
  const opciones = BANCO.filter((p) => p.cat === cat && p.enunciado !== excepto);
  return opciones[Math.floor(Math.random() * opciones.length)];
}
