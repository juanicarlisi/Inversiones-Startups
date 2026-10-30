---
name: herramientas
description: Descubrimiento e integración de herramientas especializadas antes de escribir código propio - investiga el ecosistema (apps profesionales, motores, CLI oficiales, SDK, APIs, MCP, plugins, servicios, IA), verifica en fuentes oficiales, elige una, la instala, la integra y comprueba el resultado. Usar ante cualquier tarea de cierta complejidad (animación, 3D, mapas, simulación, visualización, audio, UX, automatización, integraciones) o cuando se vaya a escribir a mano algo que probablemente ya exista, y para auditar lo ya construido.
---
# /herramientas <tarea o área a auditar>

Principio (`doctrina/09-herramientas-especializadas.md`): **no reinventar con código propio lo que una herramienta especializada hace
mejor.** Elegir y ejecutar; no presentar alternativas al fundador.

## Procedimiento

1. **Encuadrar** la tarea en una frase: qué resultado se busca, para qué plataforma/runtime, con qué restricciones (costo de servidor,
   licencia comercial, peso de la app, offline, SO del entorno: Linux en sesiones cloud).
2. **Mirar lo que ya hay**: stack del proyecto, `docs/LEGAL.md` o equivalente (licencias ya anotadas), decisiones previas
   (`cartera/decisiones.md`). No descartar algo porque «no es parte del stack»: el stack no limita la búsqueda.
3. **Investigar en paralelo** (herramienta Agent, en un solo mensaje): lanzar `investigador-tecnologico` por cada categoría candidata
   (p. ej. animación, runtime, exportación). Para tareas grandes sumar un arquitecto de integración (`Plan`). Ellos no producen
   informes para el fundador: entregan al hilo principal una elección fundamentada y verificada.
4. **Verificar en fuente oficial** (WebSearch/WebFetch a sitio, docs, repo y releases oficiales; fecha de cada dato). Checklist por
   herramienta candidata:
   - [ ] existe y está mantenida (última release, fecha);
   - [ ] CLI oficial / API / SDK / MCP / integración con agentes de código;
   - [ ] se controla por programa y se puede automatizar en CI;
   - [ ] exporta formatos que nuestro runtime lee; hay runtime para nuestra plataforma;
   - [ ] corre en Linux (cloud) y en la máquina del fundador;
   - [ ] licencia compatible con app comercial / anuncios; costo; cuentas requeridas;
   - [ ] qué datos salen del proyecto hacia un tercero.
   Si la red del entorno bloquea una fuente, decirlo y buscar la misma información por otra vía oficial; nunca afirmar «no existe».
5. **Elegir una** por resultado final (calidad, rendimiento, mantenibilidad, velocidad), no por fama ni por facilidad de instalación.
   Anotar en una línea: herramienta, versión, fuente, licencia, por qué esta, regla de corte.
6. **Instalar e integrar de verdad** (gratis/open source/CLI/SDK/plugin/MCP: autonomía total). Correrla con un caso real del proyecto.
   Agregar una dependencia al `package.json` sin ejecutarla no cuenta como integrada.
7. **Comprobar**: visual (capturas, cuadro a cuadro si es animación, vista previa) y técnico (pruebas, peso, tiempos, costo). Para
   reemplazar algo existente, comparar lado a lado y reemplazar solo si es claramente superior.
8. **Revisión independiente**: un agente `general-purpose` revisa el resultado recibiendo el código y el criterio de calidad, no la
   conclusión. Corregir lo que encuentre.
9. **Registrar** en la bitácora/decisiones del proyecto (HECHO con fecha y fuente) y actualizar el `CLAUDE.md` del proyecto si cambia
   la forma de trabajar.

## Cuándo parar y consultar al fundador (solo estos casos)

- decisión comercial o económica (licencia paga, suscripción, plan, gasto);
- riesgo de seguridad o privacidad (datos de usuarios, claves, envío de información a terceros);
- credenciales o accesos que Claude no tiene;
- intervención manual indispensable que Claude no puede hacer (crear una cuenta, instalar algo en su máquina).

En esos casos: dejar todo listo «para apretar el botón» (regla 8 de `CLAUDE.md`) y pedir una sola cosa concreta, con palabras llanas.

## Modo auditoría (`/herramientas auditar <proyecto o carpeta>`)

Recorrer el código buscando: componentes hechos desde cero que existen maduros, visualizaciones o animaciones rígidas o de calidad
inferior, simulaciones limitadas, procesamientos ineficientes, integraciones manuales que tienen SDK/API/MCP oficial, funcionalidades
complejas que aprovecharían un motor especializado. Por cada hallazgo registrar en `auditoria-herramientas.md` del proyecto: hoy /
herramienta candidata (verificada) / evidencia de superioridad / costo de migrar / regla de corte. Ejecutar los hallazgos de mayor
valor sin esperar pedido, **sin reemplazar nada sin validar antes que lo nuevo es superior.**
