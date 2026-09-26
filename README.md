# Opportunity Intelligence & Venture Portfolio

Sistema vivo para **detectar, investigar, evaluar, desarrollar y capturar oportunidades económicas** y construir, en ~5 años, una
cartera de negocios e inversiones que genere caja, se reinvierta y componga. Punto de partida: Argentina (CABA), sep-2026.
Principio: *con poco hacer muchísimo*. Filosofía: *ir un paso adelante*.

> **Empezá por acá**: el informe `informes/2026-09-cartografia-inicial.pdf` (la primera fotografía del terreno) y `TABLERO.md`
> (ranking vivo de oportunidades).

## Qué hay en el repositorio

```
CLAUDE.md                  Sistema operativo para Claude: reglas, equipo, rutinas, convenciones
MANDATO_ORIGINAL.md        El mandato fundacional (fuente)
TABLERO.md                 Ranking generado de oportunidades (no editar a mano)
doctrina/                  Cómo pensamos: principios, marco de evaluación, evidencia, capital, lentes, palanca IA, distribución, riesgo
perfil/fundador.md         Lo que sabemos del fundador y lo que falta (cuestionario)
radar/                     Contexto macro fechado, señales, mapa regulatorio, disparadores de vigilancia, fuentes
oportunidades/             Fichas OP-XX con tesis, evidencia, economía, riesgos y validación; cementerio de ideas descartadas
casos/patrones.md          Empresas estudiadas y patrones transferibles
cartera/                   Estrategia a 5 años, estado de la cartera, libro de capital, decisiones, experimentos, proyección
conocimiento/              Bitácoras de investigación con hechos fechados y fuentes
herramientas/              Tablero, motor de escenarios Monte Carlo, proyección de cartera, modelos por oportunidad
informes/                  Informes PDF y su fuente
.claude/agents/            El equipo: explorador, analista regulatorio, analista de mercado, CFO, growth, abogado del diablo, analista de inversiones, constructor, asignador
.claude/skills/            Rutinas: /radar, /oportunidad, /evaluar, /matar, /experimento, /comite, /revision, /tesis-inversion, /informe
```

## Cómo se usa (con Claude Code)

| Querés... | Decile a Claude |
|---|---|
| Saber qué cambió esta semana | `/radar` |
| Evaluar una idea que se te ocurrió | `/oportunidad <tu idea>` |
| Hacer due diligence completa de una oportunidad | `/evaluar OP-XX` |
| Intentar destruir una tesis antes de poner plata | `/matar OP-XX` |
| Diseñar la prueba más barata | `/experimento OP-XX` |
| Decidir en qué se va el capital del mes | `/comite` |
| Ver cómo va todo | `/revision` |
| Analizar una acción, bono o inmueble | `/tesis-inversion <activo>` |
| Regenerar el informe PDF | `/informe` |

Scripts (sin Claude):

```bash
python3 -m pip install -r requirements.txt
python3 herramientas/oportunidades.py                     # valida fichas y regenera TABLERO.md
python3 herramientas/escenarios.py --todos                # corre todos los modelos Monte Carlo
python3 herramientas/cartera.py proyectar                 # proyección compuesta a 5 años
python3 herramientas/cartera.py resumen                   # libro de capital
python3 informes/construir_informe.py                     # regenera el PDF
```

## Estado al 2026-09-26

- **Fase 0 — Aprender barato** (oct–dic 2026): tres validaciones en paralelo (OP-01 consorcios con IA, OP-02 oficina IA para
  transportistas, OP-04 laboratorio de decisiones logísticas), OP-07 medio vertical como canal, OP-03 maquinaria usada ante un
  pedido real, tesorería en USD activa.
- Detalle: `cartera/cartera.yaml`, `cartera/decisiones.md`, `cartera/experimentos/`.

## Reglas de oro

Evidencia con fecha y fuente · rangos, no precisión falsa · idea ≠ oportunidad · cada dólar compite con todos los demás · pensar en
cartera · la IA prepara, el fundador aprueba todo lo que mueve dinero o habla con terceros · no es asesoramiento financiero regulado.
