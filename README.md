# Opportunity Intelligence & Venture Portfolio

Sistema vivo para **detectar, investigar, evaluar, desarrollar y capturar oportunidades económicas** y construir, en ~5 años, una
cartera de negocios e inversiones que genere caja, se reinvierta y componga. Punto de partida: Argentina (CABA), sep-2026.
Principio: *con poco hacer muchísimo*. Filosofía: *ir un paso adelante*.

> **Nuevo (30-09-2026)**: `informes/2026-09-senda-proyecto.pdf`, el **proyecto completo de Senda** (la app cristiana, P1): 27
> capítulos con definición, módulos, gamificación, UX/UI, marca, monetización, tecnología, legal y patentes, presupuesto y roadmap
> por fases con hoja A3. Fuente: `oportunidades/proyectos/senda/`.
>
> **Empezá por acá**: `informes/2026-09-el-holding-v3.pdf` (**informe 3, versión 3: el holding**, con los 9 proyectos definidos,
> el plan mes a mes hasta 2030 en una hoja A3, el caso de negocio de cada uno a 2031 y el backlog de 38 ideas en su versión viable).
> Antecedentes: `informes/2026-09-el-plan.pdf` (informe 3 v2, las alternativas una por una), `informes/2026-09-ingresos-sin-vender.pdf`
> (informe 2) y `informes/2026-09-cartografia-inicial.pdf` (informe 1). Vivo: `oportunidades/proyectos/`, `oportunidades/CATALOGO.md`
> y `TABLERO.md`. Cada PDF tiene una versión `.html` que se abre sola en cualquier navegador.

## Qué hay en el repositorio

```
CLAUDE.md                  Sistema operativo para Claude: reglas, equipo, rutinas, convenciones
MANDATO_ORIGINAL.md        El mandato fundacional (fuente)
TABLERO.md                 Ranking generado de oportunidades (no editar a mano)
doctrina/                  Cómo pensamos: principios, marco de evaluación, evidencia, capital, lentes, palanca IA, distribución, riesgo
perfil/fundador.md         Lo que sabemos del fundador y lo que falta (cuestionario)
radar/                     Contexto macro fechado, señales, mapa regulatorio, disparadores de vigilancia, fuentes
oportunidades/             Fichas OP-XX, catálogo de alternativas, proyectos del holding (proyectos/P1–P9), backlog y cementerio
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
python3 herramientas/catalogo.py --md                     # puntúa y simula las 81 alternativas → oportunidades/CATALOGO.md
python3 herramientas/holding.py                           # casos de negocio de los 9 proyectos a 2031 → cartera/holding-resultados.md
python3 informes/construir_senda.py                       # regenera el proyecto completo de Senda (P1, con hoja A3)
python3 informes/construir_plan_v3.py                     # regenera el informe 3 v3 (el holding, con hoja A3)
python3 informes/construir_informe3.py                    # regenera el informe 3 v2 (el plan, alternativa por alternativa)
python3 herramientas/plan_sin_venta.py                    # simula el plan del informe 2 a 60 meses
python3 informes/construir_informe.py                     # regenera el informe 1 (cartografía inicial)
python3 informes/construir_ingresos_sin_vender.py         # regenera el informe 2 (ingresos sin salir a vender)
```

## Estado al 2026-09-28

- **El holding** (DEC-2026-09-28-1): nueve proyectos definidos en `oportunidades/proyectos/` (misión, alcance, versiones, difusión
  sin costo y sin cara, roadmap, nombres, caso de negocio): **Senda** (suite cristiana, desde oct-2026), **Andén** (Logistic Lab,
  desde dic-2026), **Cimiento** (renta en USD), **Adopción** (compra de una app en jul-2027), **Palanca Apps** (fábrica: Todo Bien,
  Rutea, Me Toca, De Turno y radar), **Carpincho Games** (juegos web), **Posta** (alquileres con aviso anticipado), **Sobremesa** y
  **Remanso** (música con IA). Entrenar IA y las horas en dólares quedan fuera del plan.
- **Backlog**: 38 ideas en su versión viable (`oportunidades/backlog.yaml`); 7 secundarias entran desde fines de 2028.
- **Catálogo**: 81 alternativas, con la familia nueva Municipio y Estado (`oportunidades/catalogo.yaml` → `CATALOGO.md`).
- **Informe**: `informes/2026-09-el-holding-v3.pdf` (70 páginas, 21 capítulos + anexo; hoja A3 del plan en la página 56).
- **Senda, proyecto completo** (DEC-2026-09-30-1): `informes/2026-09-senda-proyecto.pdf` (96 páginas, 27 capítulos + anexo; hoja A3
  del roadmap en la página 90). MVP publicado el 18-12-2026 y una versión cada dos semanas; 12 decisiones pendientes en el capítulo 27.
- Detalle: `cartera/cartera.yaml`, `cartera/decisiones.md`, `cartera/holding-resultados.md`, `doctrina/08-formas-de-pensar.md`.

## Reglas de oro

Evidencia con fecha y fuente · rangos, no precisión falsa · idea ≠ oportunidad · cada dólar compite con todos los demás · pensar en
cartera · la IA prepara, el fundador aprueba todo lo que mueve dinero o habla con terceros · no es asesoramiento financiero regulado.
