# Informática desde cero: cómo retomar (leer esto al arrancar)

Estudio integral de informática, software y sistemas para el fundador (no ingeniero): 631 días de 20 a 30 minutos, 22 partes, de los bits a la nube, con Senda como hilo conductor.
Un solo HTML (`informatica-desde-cero.html`) con progreso, repaso espaciado, buscador, glosario, diagramas y widgets. Pedido original del 09-11-2026.

## Estado (09-11-2026)
**234 de 631 días escritos** (Parte 0: 6; Parte 1: 36; Parte 2: 32; Parte 3: 59; Parte 4: 25; Parte 5: 32; Parte 6: 44; las siete completas). Los 234 pasan el validador y el QA en navegador (393 bloques de código ejecutados; los únicos «problemas» que imprime qa.cjs son errores mostrados a propósito en 03-03, 03-04, 03-06, 03-07, 03-10, 03-11, 03-15, 03-18, 03-25, 03-45, 03-50 y 04-23); 2.089 fuentes registradas. Artefacto privado: https://claude.ai/artifact/2ZMuUPpsBUr5fguB5oTphY (para actualizarlo: Artifact con `url` de este enlace; el archivo fuente sale de `python3 construir.py <ruta> --artefacto`). Lo no verificado en fuente primaria está en `VERIFICACION.md`. Siguiente: Parte 7 (Backend, 30 días); escribir antes `briefs/parte-07.md` con notas por día (ver `briefs/parte-06.md` como modelo) y lanzar ~16 redactores sonnet de dos días cada uno (prompt corto: leer ESCRIBIR.md incl. §10 y los modelos, sus días, sus notas en el brief, verificar con `verificar_dia.py`, respuesta de tres líneas). Costo observado: 220.000–470.000 tokens por par; una tanda de 16 tarda ~25 minutos. **Tamaño del artefacto (resuelto el 13-11-2026):** `construir.py` comprime `window.DATOS` con gzip + base64 y la página lo descomprime al abrir con `DecompressionStream`; todo el código de la app corre dentro de `arrancar()` (las globales `ORDEN`, `PLAN`, etc. ya no existen en `window`; solo `window.DATOS`). Con 232 días el artefacto pesa 4,3 MB (~18 KB por día): a 631 días rondaría 11–12 MB, bajo el tope de 16 MB; vigilarlo. `scripts/qa.cjs` ya usa `DATOS.orden`. **Entorno de las Partes 3 a 5:** la VM tiene proxy HTTPS (ICMP, UDP y DNS directos interceptados o limitados), sin IPv6, sin `netem` ni WireGuard en el kernel; `ip netns`, veth, nftables, tcpdump y tshark andan; `rm` con comodines está bloqueado por la verificación de seguridad; varios redactores comparten la VM (usar puertos y nombres propios y no usar `pkill` genérico).

`python3 scripts/estado.py` imprime días escritos por parte y el próximo pendiente. El plan completo (los 631 días con título y términos que presenta) ya está fijado en `plan/curriculo-*.txt`.

## Cómo continuar (un lote de días)
1. `python3 scripts/estado.py` → elegir el siguiente grupo de días (de a 2 consecutivos por redactor).
2. Lanzar redactores (agente `general-purpose`, sonnet) con este prompt base: *«Sos redactor del estudio… leé ESCRIBIR.md completo… escribí estos dos días EN ORDEN: X e Y… terminado solo con `verificar_dia.py` en 0 errores y 0 avisos… notas específicas del día…»*. Las notas específicas por día (qué verificar, qué widget usar, qué sección del mapa de Senda leer) son lo que más sube la calidad.
3. Verificar todo: `python3 scripts/verificar_dia.py` (sin argumentos revisa todos) y `python3 scripts/verificar_enlaces.py --dias`.
4. Armar y probar: `python3 construir.py` (archivo con tipografías incrustadas) o `python3 construir.py salida.html --artefacto` (liviano, para publicar como artefacto). Control de calidad en navegador real (render de todos los días y ejecución de todo el código): `node scripts/qa.cjs archivo.html`. Capturas: `node scripts/captura.cjs archivo.html prefijo "#dia-01-09,#inicio"` (las rutas son `#dia-ID`, `#parte-NN`, `#mapa`, `#repaso`, `#glosario`, `#fuentes`, `#ayuda`: el artefacto solo admite `#nombre`).
5. `python3 scripts/consolidar_fuentes.py` (unifica fuentes de los días; avisa de ids repetidos con URL distinta: renombrar el id en el día nuevo) y revisar `VERIFICACION.md`.
6. Publicar: `python3 construir.py /ruta/art.html --artefacto` y Artifact con la **misma ruta** para mantener el enlace. El artefacto no puede imprimir ni descargar: la copia de seguridad es copiar/pegar texto.
7. Commit y push a la rama de trabajo.

## Archivos clave
- `plan/curriculo-a|b|c|d.txt` (fuente del plan) → `scripts/plan.py` → `plan/plan.json`. Los ids de día son estables (el progreso del lector se guarda por id): nunca renumerar; para insertar, usar sufijo (`03-07b`).
- `dias/ID.json`: un día. Esquema y reglas en `ESCRIBIR.md`; modelos: `dias/01-09.json` (concepto) y `dias/00-02.json` (con Senda).
- `fuentes/base.py` → `fuentes/fuentes.json` (156 fuentes base; cada día puede sumar `fuentes_nuevas`). `scripts/verificar_enlaces.py` prueba las URLs (algunas, como ACM, W3C y cppreference, bloquean robots y dan 403 aunque existan).
- `senda/mapa-tecnico.md`: mapa verificado de Senda (commit `25e08fa`, 2026-11-09, 1.600 líneas). **Fuente única** sobre Senda para los días S. Si Senda cambia mucho, volver a generarlo (agente que lea el repo y verifique rutas).
- `app/` (estilos.css, bloques.js, widgets.js, app.js, plantilla.html) y `construir.py`: la app. Widgets existentes en `ESCRIBIR.md` §5; para sumar uno, agregarlo en `widgets.js` y al conjunto `WIDGETS` de `scripts/verificar_dia.py`.

## Decisiones de diseño (por qué es así)
- **Plan completo desde el día cero**: el lector ve todo el camino (los días no escritos aparecen como «próximamente» con los términos que presentarán).
- **Ningún término se usa antes de presentarse**: el validador lo exige con el plan (regla heredada de Senda: «empezar por el principio»).
- **Preguntas que no se delatan por el largo** y repaso espaciado de cajas (1, 3, 7, 16, 35 días), todo guardado en el navegador del lector, con copia descargable.
- **Senda solo con hechos verificados**: rutas reales (el validador las comprueba), «implementado» separado de «planificado», commit y fecha de lo observado.
- **Principio vs herramienta**: cada día lleva etiqueta de vigencia y las cosas que caducan van en recuadros con fecha.

## Pendiente conocido
- Escribir los días restantes (ver `estado.py`). El orden pedagógico ya está fijado.
- Widgets futuros: SQL en el navegador (sql.js, para la Parte 9), terminal simulada, simulador de DNS/HTTP, visor de pila de llamadas.
- Hallazgos de Senda a conversar (detalle en `senda/mapa-tecnico.md` §17): clave de respuestas `preguntas_clave` desincronizada de `contenido/espadeo.json`; «plan» Premium/Max como interruptor local sin compras conectadas; workflow AAB sin validadores; sin reporte remoto de fallos.

## Lecciones de las tandas (para el prompt de los próximos redactores)
- Referencias a otros días siempre con `[@id]` (el validador avisa si escriben «día N»). Ids de fuentes específicos y únicos (`aosp-zygote-proceso`, no `android`): `consolidar_fuentes.py` avisa de choques y hay que renombrar en el día nuevo.
- Que corran y muestren salidas REALES (Linux de este entorno: Ubuntu 24.04, kernel 6.18, VM sin systemd ni módulos) y que rotulen lo que es inferencia o «según X» funcionó muy bien; es lo que alimenta `VERIFICACION.md`.
- No pasarle `--help` a los scripts de `scripts/` (no parsean argumentos y reescriben archivos derivados: ya pasó dos veces con `verificar_enlaces.py` y `consolidar_fuentes.py`).
- Varios redactores trabajan en la misma VM: pedirles que usen nombres únicos en cgroups y directorios temporales y que limpien lo que crean.
