# Parte 4: El oficio (herramientas y método de un equipo de software). Notas por día.
Contexto: el estudiante ya sabe qué es un SO, la terminal y programar en JS (Partes 1 a 3). Esta parte es de herramientas reales: todo se muestra con git, npm y los demás corriendo de verdad en el entorno. Senda como caso (workflows, scripts, validadores).

## 04-01 Cómo trabaja un equipo de software: del pedido al producto
Ciclo de vida (requisito → diseño → construcción → prueba → entrega → operación → mantenimiento), quién hace qué (adelanto de [@00-05]), por qué la mayor parte del costo está en el mantenimiento (verificá una fuente seria, p. ej. Software Engineering at Google `swe-google`), flujo real de un cambio chico de punta a punta (idea → rama → commit → revisión → prueba → despliegue) con tiempos típicos como estimación. Logística: el paralelo con el flujo de un pedido de depósito. Senda: el ciclo real de una prueba de Senda (senda/mapa-tecnico.md §11 y §12).

## 04-02 Editores e IDE: VS Code por dentro
Editor vs IDE, qué hace un editor moderno (resaltado, autocompletado, refactor), el servidor de lenguaje (LSP: protocolo de Microsoft, verificá en la especificación oficial) y por qué una sola extensión sirve para muchos editores, el modelo de extensiones y de procesos de VS Code (verificá en la doc oficial: Electron, host de extensiones), depurador integrado, terminal integrada, configuración como código (`settings.json`). Mostrá un mensaje LSP real (JSON-RPC) capturado o armado y corrido contra un servidor de lenguaje instalado (p. ej. typescript-language-server o pyright con npm). Otros: JetBrains, Vim/Neovim, Android Studio, Xcode (solo doc).

## 04-03 La terminal del desarrollador y los scripts
Scripts de shell (shebang, variables, condicionales, bucles, argumentos, códigos de salida, `set -euo pipefail` y sus matices), alias, funciones, `make` como automatizador, tareas repetitivas (renombrar archivos, procesar un CSV de logística INVENTADO). Mostrá scripts reales corridos, con un error provocado y cómo se depura (`bash -x`). Comparación con PowerShell solo por doc. Senda: leé 3 scripts reales de `scripts/` y `.github/workflows/` (por qué usan códigos de salida) con rutas verificadas.

## 04-04 Gestores de paquetes: npm, pip, Gradle, CocoaPods
Qué problema resuelven, el manifiesto (`package.json`, `requirements.txt`/`pyproject.toml`, `build.gradle`, `Podfile`) y el archivo de bloqueo, registros públicos (npm, PyPI, Maven Central, CocoaPods: tamaños con fecha y fuente), qué ocurre al hacer `npm install` de verdad (correlo en un proyecto chico: árbol de `node_modules`, tiempo, tamaño), `npx`, pip y entornos virtuales, resolución de versiones. Senda: `package.json` y `package-lock.json` (conteos reales: dato de grep rotulado), por qué se instala con `npx expo install` (CLAUDE.md de Senda, regla de versiones compatibles con el SDK).

## 04-05 Versionado semántico y el infierno de las dependencias
SemVer (verificá semver.org), rangos `^` y `~` y lo que realmente instalan (probalo con la herramienta `semver`), dependencias transitivas y conflictos de versión (un ejemplo real reproducido), archivos de bloqueo y compilaciones reproducibles, actualizar con criterio (Dependabot/Renovate: solo doc), vulnerabilidades conocidas (`npm audit` real sobre un proyecto chico), el caso left-pad/xz como adelanto de [@15-24]. Senda: rangos reales de `package.json` y qué versiones fija Expo (`~57.0.x`: verificá qué significa `~` en ese contexto).

## 04-06 Configuración, variables de entorno y secretos
Configuración vs código, los 12 factores (`twelve-factor`, ya registrada: factor III), `.env` y por qué no se versiona, variables de entorno (retomá [@02-18]), configuración por entorno, secretos: dónde NO ponerlos (repositorios, imágenes, logs) con un demo local de qué pasa si un secreto falso se commitea (no uses secretos reales: inventá uno con formato obvio) y cómo se detecta (gitleaks o trufflehog, instalalos si se puede). Senda: `EXPO_PUBLIC_*` y qué implica que viaje dentro del bundle (verificá en la doc de Expo) y cómo carga las claves públicas en el APK (senda/mapa-tecnico.md §11; no copies valores).

## 04-07 Git I: por qué existe el control de versiones
El problema (copias «final_v3_definitivo»), historia (RCS, CVS, SVN, Git 2005 y su motivo: verificá con Pro Git `git-book` o el anuncio de Linus), snapshots vs diferencias, repositorio local distribuido, los comandos básicos de un día cualquiera corridos de verdad en un repo de práctica (`init`, `add`, `commit`, `status`, `log`, `diff`), qué es un commit (autor, mensaje, fecha, árbol, padre) mostrado con `git cat-file -p`. Analogía honesta (libro mayor de un depósito) con su límite. Mensajes de commit buenos.

## 04-08 Git II: cómo funciona por dentro
Objetos (blob, tree, commit, tag) en `.git/objects`, direcciones por contenido con SHA (SHA-1 por defecto y la migración a SHA-256: verificá el estado), el DAG de commits, referencias (ramas = punteros) y HEAD, el índice (área de preparación), empaquetado (`git gc`, packfiles). Hacelo visible: creá un repo, hacé commits y recorré a mano `.git` con `find`, `cat-file`, `ls-tree`, `rev-parse`; reconstruí un commit con `hash-object` y `update-index`. Diagrama `grafo` del DAG. Senda: el repo de Senda es de un solo commit en este clon superficial (`git log`): explicalo (clon `--depth 1`) y no saques conclusiones de su historia.

## 04-09 Git III: laboratorio de comandos (tipo L)
Un laboratorio completo en un repo de práctica: `add -p`, `restore`, `reset` (soft/mixed/hard con lo que cambia cada uno: demostrado), `revert`, `stash`, `reflog` (recuperar un commit «perdido»), `tag`, `.gitignore`, `blame`, `log --graph --oneline`. Al menos 5 ejercicios con solución que corriste, incluido «arreglá un error de commit» y «recuperá trabajo borrado». Advertencias claras sobre `reset --hard` y `clean -fd`.

## 04-10 Git IV: ramas, merges y conflictos
Ramas como punteros baratos, `merge` (adelantado y de tres vías), conflictos (provocá uno y resolvelo a mano mostrando los marcadores), `rebase` vs `merge` (qué cambia en el historial, la regla de no reescribir historia compartida), `cherry-pick`, estrategias de ramas (trunk-based vs GitFlow: tradeoffs con fuente, p. ej. trunkbaseddevelopment.com o Fowler), `git bisect` (retomá [@03-33]) con un bug sembrado. Todo corrido.

## 04-11 GitHub: remotos, pull requests e issues
Remoto, `clone`/`fetch`/`pull`/`push` (probalo con un remoto local tipo bare repo), forks, pull requests (qué son: una rama más un espacio de conversación y de verificaciones), issues, protección de ramas, CODEOWNERS, GitHub no es Git (GitLab, Bitbucket, Gitea). No uses cuentas ni crees repos reales. Senda: lo verificable en el repo de Senda (`.github/`: workflows, plantillas, si hay protección no se ve) y el uso real de Actions vía la API pública de lectura si está disponible (el redactor de [@02-23] leyó corridas de Actions). Doc: docs.github.com.

## 04-12 Code review: leer y ser leído
Para qué sirve (defectos, conocimiento compartido, consistencia: evidencia de estudios con fuente, p. ej. Microsoft/Google), qué mirar (corrección, diseño, pruebas, legibilidad, seguridad), cómo escribir comentarios útiles, tamaño de cambio, el revisor como par, revisar código generado por IA (adelanto de [@17-29]), checklist; un ejercicio de revisar un diff real chico con 5 problemas sembrados (con solución). Guía: Google Engineering Practices (`google-eng-practices`: verificá URL). El fundador es no técnico: sumá una sección «cómo revisar sin saber programar» (qué preguntar, qué señales mirar).

## 04-13 Depuración profesional
Más allá de `console.log`: depurador real (node `--inspect` y Chrome DevTools o VS Code; mostrá una sesión con puntos de interrupción condicionales y pila de llamadas), logs estructurados, `git bisect` (retomá), reproducir con un caso mínimo, depuración de producción (observabilidad: adelanto de [@16-14]), herramientas del SO (`strace`, `gdb` real con un programa C chico: punto de interrupción y backtrace), heisenbugs, estudiar un bug real famoso con informe oficial (p. ej. Heartbleed o el apagón de Knight Capital 2012: verificá los informes).

## 04-14 Testing I: por qué y la pirámide de pruebas
Qué es una prueba automatizada, costo de un bug según cuándo se detecta (cuidado: el «costo 100x» es un mito discutido; verificá la fuente y contalo con matices), la pirámide (unitarias, integración, extremo a extremo) y sus alternativas (trofeo, panal), pruebas de regresión, qué NO prueban las pruebas. Senda: qué pruebas tiene (`pruebas/arranque`, `pruebas/nube`, validadores de contenido; senda/mapa-tecnico.md §12) y cuáles no (hallazgo: `tsc` ni lint en CI): presentarlo sin dramatizar.

## 04-15 Testing II: pruebas unitarias en la práctica
Arrange-Act-Assert, un framework real (Jest o el `node:test` incorporado: corrélo), pruebas que fallan primero, mocks/stubs/fakes y cuándo molestan, pruebas deterministas (tiempo, azar y red controlados), buenos nombres de pruebas, cobertura (qué mide y qué no). Escribí y corré una suite chica con 10 pruebas sobre funciones de logística INVENTADAS; mostrá una prueba que detecta un bug real sembrado. Senda: leé un archivo de prueba real (`pruebas/arranque/arranque.test.tsx`) y explicalo.

## 04-16 Testing III: integración, E2E, TDD y cobertura
Pruebas de integración (con una base de verdad: SQLite o Postgres local si se puede), extremo a extremo con Playwright (ya instalado: corré una prueba real contra una página local), TDD (ciclo rojo-verde-refactor, con una práctica corta; fuente: Beck), cobertura y su uso erróneo (Goodhart), pruebas inestables (flaky: un ejemplo reproducido y cómo se cuarentenan), pruebas de contrato (adelanto de [@08-14]), el costo de mantenerlas. Senda: `pruebas/nube` (la base de prueba igual a Supabase: senda/mapa-tecnico.md §12) como caso de integración.

## 04-17 Refactorización y deuda técnica
Refactor = cambiar estructura sin cambiar comportamiento (Fowler: fuente), olores de código (función larga, duplicación, clase dios, números mágicos) con ejemplos corridos antes/después y la red de pruebas, la metáfora de la deuda técnica (Ward Cunningham: verificá el origen y su matiz), deuda deliberada vs accidental, cuándo refactorizar y cuándo no, cómo medir deuda sin mitos (complejidad ciclomática con una herramienta real). Senda: dos hallazgos reales ya medidos en esta serie (p. ej. el `.catch(() => {})` vacío de [@03-16], la clave de respuestas duplicada del mapa §17.1) tratados como casos de deuda, con cifras verificadas.

## 04-18 Lint, formato y análisis estático
Qué detecta un linter (ESLint: instalalo y corrélo con un caso real), formateadores (Prettier: el fin de las discusiones de estilo), el compilador como analizador (TypeScript estricto: retomá [@03-46]), análisis estático más profundo (CodeQL/Semgrep: solo doc o corrida local si se puede), reglas útiles vs ruidosas, ganchos de pre-commit (Husky o `core.hooksPath`: demostralo), integración en el editor. Senda: no tiene ESLint ni Prettier configurados (verificalo con `ls -a` y `package.json`) y por qué eso importa; sin dramatizar.

## 04-19 Build: compilar, empaquetar y optimizar
Qué hace un build (transpilar, empaquetar, minificar, eliminar código muerto, generar mapas de fuente), un bundler real mostrado (esbuild, Vite o Rollup: empaquetá un proyecto chico y mirá el resultado y su tamaño antes/después de minificar), tree shaking (demostrado), mapas de fuente, Metro en React Native (qué hace distinto: doc oficial), builds de móvil (Gradle: adelanto de [@10-26]), tiempos de build y cachés. Senda: `metro.config.js`, el peso del APK (docs/PESO.md: 89,1 MB en el APK 33 según CLAUDE.md del holding: verificalo en el repo) y qué mide el armado.

## 04-20 Integración continua
Qué es CI y qué problema resuelve, anatomía de un pipeline (disparadores, trabajos, pasos, artefactos, cachés, matrices), runners (alojados vs propios), tiempo de feedback, ramas protegidas y verificaciones obligatorias; mostrá un workflow real de GitHub Actions armado y validado localmente (con `actionlint` si se instala) y explicado línea por línea. Senda: los 10 workflows de `.github/workflows/` (senda/mapa-tecnico.md §11.2): para qué sirve cada uno, y qué verificaciones corren y cuáles no (hallazgos ya registrados: sin `tsc` ni lint en CI; `aab.yml` sin validadores).

## 04-21 Entrega y despliegue continuos
Entrega continua vs despliegue continuo, puertas de calidad, artefactos versionados, entornos (adelanto de [@14-13]), desplegar con frecuencia como práctica de riesgo bajo (DORA: `Accelerate`/informe DORA: verificá con fecha las métricas y citalas con cuidado), feature flags a nivel conceptual, marcha atrás (rollback). Mobile: la entrega pasa por las tiendas (revisión, escalonado: adelanto de [@10-27]). Senda: cómo llega una versión a un teléfono hoy (senda/mapa-tecnico.md §11.4): APK en Releases de GitHub, sin actualización por aire (hallazgo verificado), y qué cambiaría con Play Store.

## 04-22 Metodologías y gestión de proyectos
Cascada vs ágil (Manifiesto Ágil 2001: citá la fuente oficial), Scrum (roles, eventos, artefactos: la Guía de Scrum), Kanban (límites de trabajo en curso, con un ejemplo de logística: un tablero de depósito), estimación (puntos, tiempos: la falacia de planificación, adelanto de [@19-19]), backlog e historias (adelanto de [@19-04]), issue trackers (GitHub Issues, Jira, Linear: solo doc), cuándo cada enfoque, el «teatro ágil» como crítica. Equipo de una persona + IA (el caso del fundador): qué se queda y qué sobra.

## 04-23 Documentar: README, ADR y contratos
Qué documentar y qué no, README bueno (mostrá un README real de un proyecto chico armado y probado), registros de decisión de arquitectura (formato de Nygard: verificá y mostrá uno completo inventado o real de Senda con rutas), documentación como código (Markdown en el repo, `docs/` de Senda), comentarios (el porqué, no el qué), documentación de APIs (adelanto de [@08-14]), mantenerla viva. Senda: la carpeta `docs/` (lista real con 35+ archivos) y el CLAUDE.md como documento operativo: qué funciona y qué se desactualiza (el mapa §17.8 documenta discrepancias reales entre docs y código).

## 04-24 Cómo se trabaja en Senda: repositorio, scripts, validadores y workflows (tipo S)
Día de síntesis anclado al código: leé senda/mapa-tecnico.md §3.10, §11, §12 y verificá en /home/user/senda-app: estructura del repo (carpetas y su función), el flujo de un cambio de contenido (JSON → validadores en `scripts/autor/` → pruebas → APK), los validadores (qué verifican: ejemplos reales de reglas sin copiar texto bíblico), los 10 workflows, la prueba de arranque, la prueba de humo en emulador, versionado y números de compilación (`src/compilacion.json`, `app.json`). Al menos 3 bloques `senda` con 8 archivos reales. Cerrá con «qué haría un equipo humano distinto» sin crítica personal.

## 04-25 Cierre de la Parte 4: del teclado al usuario (tipo R; escribilo al final, cuando existan los demás)
Traza completa de un cambio chico (por ejemplo «corregir un texto de una pregunta») de punta a punta: editor → rama → commit → pruebas → revisión → CI → artefacto → entrega, uniendo [@04-02] a [@04-23]; `flujo`/`secuencia`; tabla «pregunta típica → día que la responde»; 8 a 12 preguntas que mezclan días; mapa mental; qué viene (Parte 5, redes).
