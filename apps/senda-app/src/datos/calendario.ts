// Eventos de la «semana Senda» (capítulo 11): una cita fija por día. Los del grupo y los personales llegan con cuentas (v1).
export type Evento = { hora: string; titulo: string; detalle: string; capa: "senda" | "grupo" | "mia"; color: string };

const VIOLETA = "#6E56F7";
const AMBAR = "#F5A524";
const VERDE = "#2FBF71";
const AZUL = "#3D7BFF";
const CIAN = "#17B3D1";
const LILA = "#9C6BFF";

export function eventosDelDia(d: Date): Evento[] {
  switch (d.getDay()) {
    case 1: return [{ hora: "Todo el día", titulo: "Arranca la fecha de la semana", detalle: "Nuevo partido y misión semanal", capa: "senda", color: VIOLETA }];
    case 2: return [{ hora: "Todo el día", titulo: "Versículo de la semana", detalle: "Desafío De memoria con tus amigos", capa: "senda", color: "#FF8A2B" }];
    case 3: return [{ hora: "Todo el día", titulo: "De a dos", detalle: "Escuadra 2 contra 2 con un amigo", capa: "senda", color: AZUL }];
    case 4: return [{ hora: "Todo el día", titulo: "Pulso de la semana", detalle: "La encuesta y los resultados de la anterior", capa: "senda", color: CIAN }];
    case 5: return [{ hora: "21:00", titulo: "Viernes de Espadeo", detalle: "15 preguntas en vivo, todos a la vez", capa: "senda", color: AMBAR }];
    case 6: return [
      { hora: "18:00", titulo: "Reunión de jóvenes", detalle: "Ejemplo de evento de tu grupo", capa: "grupo", color: VERDE },
      { hora: "Todo el día", titulo: "Día de reunión", detalle: "Primer sábado: torneo relámpago a las 18 h", capa: "senda", color: VERDE },
    ];
    default: return [{ hora: "Todo el día", titulo: "Desafío del domingo", detalle: "El juego que arma tu pastor con su mensaje", capa: "senda", color: LILA }];
  }
}
