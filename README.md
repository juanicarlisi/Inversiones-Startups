# Opportunity Intelligence & Venture Portfolio

Sistema vivo para **detectar, investigar, evaluar, desarrollar y capturar oportunidades económicas** y construir, en ~5 años, una
cartera de negocios e inversiones que genere caja, se reinvierta y componga. Punto de partida: Argentina (CABA), sep-2026.
Principio: *con poco hacer muchísimo*. Filosofía: *ir un paso adelante*.

> **Empezá por acá**: `informes/2026-09-el-plan.pdf` (**informe 3: el plan**, con las 60 alternativas evaluadas, las que conviene
> hacer ya y el paso a paso). Antecedentes: `informes/2026-09-ingresos-sin-vender.pdf` (informe 2) y
> `informes/2026-09-cartografia-inicial.pdf` (informe 1). Vivo: `oportunidades/CATALOGO.md` y `TABLERO.md`. Cada PDF tiene una
> versión `.html` que se abre sola en cualquier navegador.

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
python3 herramientas/catalogo.py --md                     # puntúa y simula las 60 alternativas → oportunidades/CATALOGO.md
python3 informes/construir_informe3.py                    # regenera el informe 3 (el plan)
python3 herramientas/plan_sin_venta.py                    # simula el plan del informe 2 a 60 meses
python3 informes/construir_informe.py                     # regenera el informe 1 (cartografía inicial)
python3 informes/construir_ingresos_sin_vender.py         # regenera el informe 2 (ingresos sin salir a vender)
```

## Estado al 2026-09-26

- **El plan** (DEC-2026-09-26-6): motor 1 **OP-15 suite cristiana** (EXP-09, desde oct-2026), motor 2 **OP-16 Logistic Lab**
  (EXP-10, desde dic-2026), **renta en USD** (OP-09) y **compra chica de una app con AdMob verificado** (OP-08, EXP-08, meses 6–9).
  Segunda ola: radar de nichos del Play Store. Opcional: turbo entrenando IA. En pausa lo que requiere vender.
- Detalle: `cartera/cartera.yaml`, `cartera/decisiones.md`, `cartera/experimentos/`, `oportunidades/catalogo.yaml`.

## Reglas de oro

Evidencia con fecha y fuente · rangos, no precisión falsa · idea ≠ oportunidad · cada dólar compite con todos los demás · pensar en
cartera · la IA prepara, el fundador aprueba todo lo que mueve dinero o habla con terceros · no es asesoramiento financiero regulado.
