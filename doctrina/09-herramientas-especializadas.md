# 09 · Herramientas especializadas primero (no reinventar con código propio)

*Registrada el 30-10-2026 (DEC-2026-10-30-4). Aplica a todos los proyectos del holding: Senda, Andén/Hub y los que vengan.*

## Principio

> **No reinventar con código propio algo que una herramienta especializada puede hacer mejor.**
> El código propio sirve para conectar herramientas, resolver lo particular del negocio y crear lo que da ventaja; no para reconstruir
> motores, sistemas o funcionalidades que ya existen y están resueltos.

El caso que lo motivó: Lany (Senda) se hizo primero con un escritor propio del binario de Rive; el motor oficial rechazaba el archivo.
Existía el Rive CLI oficial (`rive.app/agents`) y no se había buscado. Con la herramienta oficial ese error no puede volver
(DEC-2026-10-30-3). La lección es general: **no afirmar que algo no existe sin verificarlo en fuentes oficiales.**

## Cuándo se aplica

Ante cualquier tarea de cierta complejidad (más que un script corto o un cambio de texto), antes de escribir código propio:

1. **¿Qué categoría de problema es?** Animación, 3D, mapas/geoespacial, simulación, visualización de datos, audio, diseño UX/UI,
   automatización, pagos, mensajería, extracción de datos, OCR, búsqueda, etc.
2. **Barrer el ecosistema**, no solo paquetes de programación: aplicaciones profesionales, motores, CLI oficiales, SDK, APIs, servidores
   MCP, plugins, agentes especializados, servicios externos y herramientas de IA. A veces lo mejor es incorporar una aplicación
   profesional y usar sus archivos dentro del desarrollo.
3. **Verificar que existe y sirve** (fuente oficial, no memoria):
   - sitio y documentación oficiales, repositorio oficial, releases vigentes (fecha);
   - ¿tiene CLI oficial? ¿se controla por programa? ¿hay API o SDK? ¿admite agentes de código o MCP?
   - ¿exporta archivos que nuestro runtime lee? ¿corre en Linux/nuestra plataforma? ¿tiene runtime para móvil/web?
   - ¿licencia y costo? (ver límites abajo).
4. **Elegir una y ejecutar** (no presentar diez opciones al fundador): criterio profesional, no «la más conocida» ni «la más fácil
   de instalar». Registrar la elección en una línea con su porqué y su regla de corte.
5. **Instalar de verdad e integrar**: que corra, no solo que figure en `package.json`. Probar con un caso real.
6. **Comprobar el resultado** visual y técnicamente (capturas, métricas, pruebas) y corregir.
7. **Antes de reemplazar algo existente**, validar que la nueva solución es superior (comparación lado a lado).

## Qué puede hacer Claude solo y qué no

- **Solo:** instalar y configurar herramientas gratuitas y de código abierto, CLI oficiales, dependencias, SDK, plugins y servidores MCP;
  verificar que funcionen.
- **Con aprobación del fundador (regla 8 de `CLAUDE.md`):** licencias o suscripciones pagas; crear cuentas; compartir información
  privada o datos de usuarios con un servicio externo; cualquier acción con consecuencias importantes; cualquier gasto.
- **Se consulta solo si:** hace falta una decisión comercial/económica, hay un riesgo de seguridad o privacidad, faltan credenciales o
  acceso que Claude no tiene, o es indispensable una intervención manual que Claude no puede hacer.
- **Licencias:** toda herramienta o activo que entre a un producto se anota con su licencia (en Senda, `docs/LEGAL.md`). Una licencia
  incompatible con apps comerciales o con anuncios descarta la herramienta aunque sea la mejor técnicamente.

## Equipo para tareas complejas

Para tareas complejas, lanzar en paralelo (herramienta Agent), sin informes para el fundador:

| Rol | Hace | Agente |
|---|---|---|
| Tool Researcher | Descubre y verifica herramientas en fuentes oficiales | `investigador-tecnologico` |
| Architecture Engineer | Evalúa integración con el stack y la plataforma | `Plan` o `general-purpose` con ese encargo |
| Implementation Engineer | Instala, integra y construye | `constructor` |
| Quality Reviewer | Revisa el resultado de forma independiente, sin heredar la conclusión | `general-purpose` con el código y el criterio, no la conclusión |

El procedimiento completo vive en la skill `/herramientas` (`.claude/skills/herramientas/SKILL.md`).

## Auditoría de lo existente

Cada proyecto con código revisa periódicamente dónde hay implementación propia que una herramienta madura mejoraría
sustancialmente. Se mira con atención:

- componentes hechos desde cero que existen maduros;
- visualizaciones o animaciones de calidad inferior a la alcanzable (movimientos rígidos, en bloque);
- simulaciones limitadas o procesamientos ineficientes;
- integraciones programadas a mano que tienen SDK, API o MCP oficial;
- funcionalidades complejas que aprovecharían un motor especializado.

Cada hallazgo se registra en `auditoria-herramientas.md` del proyecto (o en la bitácora del proyecto), con: qué hay hoy, qué
herramienta lo reemplazaría, evidencia de que es superior, costo de migrar y regla de corte. **No se reemplaza nada sin comparar antes.**

## Registro

Cada vez que se elige una herramienta nueva: una línea en la bitácora del proyecto con **fecha, herramienta, versión, fuente oficial,
licencia, por qué esta y no otras, y regla de corte.** Esto es un HECHO con fuente, como exige `02-estandares-de-evidencia.md`.
