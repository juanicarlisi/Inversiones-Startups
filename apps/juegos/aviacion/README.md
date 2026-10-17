# Hub Nocturno (nombre de trabajo) · prototipo v0

Juego web de gestión de una red aérea, del correo de 1929 a la carga del continente. Es el producto JG4 de Carpincho Games
(`oportunidades/proyectos/P6-juegos.yaml`). Está acá de forma temporal, como Senda en el sprint 0: cuando el fundador cree el
repositorio propio de los juegos, se mueve.

## Cómo se juega (v0)

- Empezás en noviembre de 1929 con un hangar en Buenos Aires y $ 40.000.
- Abrís rutas desde tu red, comprás aviones para cada ruta y cobrás por cada saca, pasajero o tonelada que llega.
- **El hub es el corazón:** lo que va de una ciudad a otra pasando por Buenos Aires tiene que pasar por el centro de transbordo.
  Si no da abasto (aro naranja o rojo), todo llega tarde y se cobra menos.
- **La noche importa:** en 1929 los aviones no despegan de noche sin balizas en la ruta. Iluminar una ruta casi duplica lo que rinde.
- **Carga mínima:** cada ruta elige si el avión sale con lo que haya, con 30%, 60% o lleno. Más carga es más ocupación pero entregas
  más lentas (lección de logística: frecuencia contra ocupación contra puntualidad).
- Tres capítulos (1929 correo, 1946 pasajeros, 1970 jets y carga), 14 misiones, 7 aviones propios, 37 ciudades.
- Mientras no estás, la red sigue a un cuarto de velocidad (hasta 2 horas reales) y gana la mitad; un video opcional lo completa.

## Cómo se corre

```bash
npx serve .            # o cualquier servidor estático; abrir index.html
npm test               # pruebas del modelo (node --test)
node herramientas/balance.mjs 1   # un jugador automático juega todo y mide minutos por misión
```

Balance medido con el jugador automático (semillas 1–3, 17-10-2026): capítulo 1 en 11 minutos, capítulo 2 en unos 17 minutos más,
capítulo 3 en 4–8 horas de juego activo (lo ganado ausente lo acorta). Es un jugador tonto: con personas reales se ajusta en la
prueba del portal.

## Archivos

| Archivo | Qué tiene |
|---|---|
| `js/modelo.js` | Simulación pura (sin DOM): demanda, ruteo por el hub, transbordo, aviones, plata, misiones, ausencia |
| `js/datos.js` | Ciudades, aviones, cargas, capítulos y misiones |
| `js/render.js` | Mapa en canvas (Mercator), rutas, aviones, noche, nombres sin pisarse |
| `js/ui.js`, `js/main.js` | Interfaz, bucle, tocar/arrastrar/zoom, guardado |
| `js/i18n.js` | Español e inglés (los portales piden inglés) |
| `js/portal.js` | Adaptador CrazyGames/Poki (simulado en el prototipo) |
| `js/mapa.js` | Costas y fronteras de Natural Earth 1:50m (dominio público), generado con `herramientas/extraer_mapa.mjs` |
| `pruebas/modelo.test.mjs` | 6 pruebas: reglas, hub, noche y balizas, economía, ausencia, guardado |

Peso total: ~150 KB sin comprimir (57 KB son el mapa), sin dependencias ni servidor. Capturas en `capturas/`.

## Propiedad intelectual (regla del holding: mecánicas de más de 20 años o propias)

| Mecánica | De dónde viene | Estado |
|---|---|---|
| Gestión de aerolínea con rutas y aviones | Aerobiz (1992), Transport Tycoon (1994), Airline Tycoon (1998) | Más de 20 años |
| Ganancia mientras no estás (idle) | Progress Quest (2002) | Más de 20 años |
| Control de tráfico aéreo | Air Traffic Controller (1978) | Más de 20 años (no usado en v0) |
| Transbordo del hub, balizas por ruta, carga mínima, capítulos históricos | Propias | — |
| **Evitado:** dibujar trayectorias con el dedo | Nintendo US7637813B2 (vigente hasta 22-05-2027) y US10843074B2 (hasta 14-05-2032) | No se usa: las rutas se eligen tocando dos ciudades |
| **Evitado:** gerentes que automatizan y reinicio con multiplicador | Clickers de 2013–2014 | No se usa |
| **A revisar antes de publicar:** premios por tiempo y "acelerar" | EA US8851978B1 y US9975045B2 | Revisar contra la ganancia por ausencia y el video que la completa |

- Nombres: "Airline Tycoon", "Airport Tycoon" y "Airline(s) Manager" son de terceros: no se usan. "Hub Nocturno / Night Hub" y las
  alternativas están sin verificar en INPI, EUIPO y USPTO (pendiente antes de publicar).
- Aviones con nombres propios (aves del sur), arte propio dibujado por código. Mapa de dominio público.
- Antes de publicar: búsqueda profesional de libertad de operación y consulta legal (regla del 11-10-2026).

## Dato histórico del capítulo 1 (verificado el 17-10-2026)

El 1 de noviembre de 1929 salió el primer vuelo del correo aéreo de Bahía Blanca a Comodoro Rivadavia, con escalas en San Antonio
Oeste y Trelew. Fuentes: [Diario Jornada](https://www.diariojornada.com.ar/257685/magazine/a_90_anos_del_vuelo_inaugural_de_la_aeroposta),
[C5N](https://www.c5n.com/sociedad/aniversario-95-anos-el-hecho-historico-la-aviacion-argentina-que-incluye-al-escritor-el-principito-antoine-saint-exupery-n183623),
[Wikipedia](https://en.wikipedia.org/wiki/Aeroposta_Argentina). El juego no usa el nombre de la empresa histórica ni personas reales.

## Para el portal (requisitos de CrazyGames y Poki, consultados el 17-10-2026)

- Inglés obligatorio (hecho), PEGI 12 (sin violencia), anda en un Chromebook de 4 GB (canvas 2D liviano).
- Guardado en `localStorage` con try/catch (hecho); en el lanzamiento completo, el módulo de datos del SDK (hasta 1 MB).
- Video con premio siempre opcional y con otra forma de conseguir lo mismo (hecho: cobrar normal). Cortes publicitarios cada 3 min
  como máximo (no hay en v0).
- Poki no permite compras dentro del juego y pide 16:9 y carga en menos de 10 s.

## Lo que sigue (v1, antes del lanzamiento de prueba)

1. Que el fundador lo juegue 20 minutos y anote lo que no se entiende (su realismo logístico es el control de calidad).
2. Tutorial en 3 toques (flecha a Buenos Aires, al destino y a comprar).
3. Ronda nocturna activa de 3 minutos en el hub (asignar posiciones y salidas antes del corte), la mecánica propia que más diferencia.
4. Música y sonidos con identidad; ícono y portada para el portal.
5. Cuenta de desarrollador en CrazyGames (la crea el fundador) y lanzamiento básico, que mide gratis si la gente vuelve.
