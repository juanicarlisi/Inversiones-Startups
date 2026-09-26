# El sistema que queda funcionando

Este informe es la primera salida de un sistema que vive en el repositorio y trabaja con el fundador de forma continua.

## Componentes

| Componente | Qué hace | Dónde |
|---|---|---|
| Doctrina | Principios, marco de evaluación, estándares de evidencia, asignación de capital, lentes de descubrimiento, palanca IA, distribución, riesgo | `doctrina/` |
| Radar | Contexto macro fechado, registro de señales, mapa regulatorio, disparadores de vigilancia, fuentes | `radar/` |
| Fichas | Una por oportunidad, con frontmatter que alimenta el tablero | `oportunidades/` |
| Modelos | Monte Carlo + sensibilidad por oportunidad; proyección de cartera | `herramientas/` |
| Cartera | Estrategia, estado, libro de capital, decisiones, experimentos | `cartera/` |
| Memoria | Bitácoras de investigación con hechos fechados y fuentes; casos y patrones | `conocimiento/`, `casos/` |
| Equipo | Nueve agentes especializados: explorador, analista regulatorio, analista de mercado, CFO, growth, abogado del diablo, analista de inversiones, constructor, asignador | `.claude/agents/` |
| Rutinas | `/radar`, `/oportunidad`, `/evaluar`, `/matar`, `/experimento`, `/comite`, `/revision`, `/tesis-inversion`, `/informe` | `.claude/skills/` |

## Cadencia

- **Semanal**: `/radar` (señales, normas, disparadores; edición del medio vertical).
- **Por idea**: `/oportunidad` (triage de 30 minutos: ficha o cementerio).
- **Antes de poner dinero**: `/evaluar` + `/matar` + `/experimento`.
- **Mensual**: `/revision` (libro de capital, métricas, costo de IA) y `/comite` (asignación de capital y horas).
- **Trimestral**: `/informe` (nueva versión de este documento).

## Principios de funcionamiento

- Toda afirmación con fuente y fecha; rangos en lugar de precisión falsa.
- Cada oportunidad compite contra todas las demás y contra la tesorería.
- Las decisiones se registran y no se borran; las ideas muertas quedan con la condición que las revive.
- La IA prepara y ejecuta; el fundador aprueba todo lo que mueve dinero o compromete ante terceros.
