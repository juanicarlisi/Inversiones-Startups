# Senda: producción del comercial «Una sola Palabra» con video generado (17-11-2026)

Bitácora de cómo se hizo el comercial de 60 s con personas fotorrealistas sin pagar producción. El código y los pasos están en
`scripts/campana/` de la app (`LEEME.md`, pasos 8 a 11).

## Hechos (con fuente y fecha)

- **Vertex AI, prueba gratis de Google Cloud.** USD 300 de crédito por 90 días para cuentas nuevas. En Argentina Google pidió un
  prepago único de USD 30 que, según la pantalla de Google, se devuelve al cerrar la cuenta de facturación (17-11-2026; DEC-2026-11-17-4).
  El proyecto es senda-campana, el único vinculado a esa cuenta.
- **Modelos usados**, todos de disponibilidad general: `veo-3.1-generate-001` (video con sonido), `gemini-2.5-flash-image` (imágenes
  clave). `veo-3.1-fast-generate-001` responde, pero no se usó. Probado contra la API el 17-11-2026.
- **Tarifa publicada de Veo 3.1:** USD 0,40 por segundo a 1080p con sonido; Fast USD 0,12. Fuente:
  cloud.google.com/vertex-ai/generative-ai/pricing, consultada el 17-11-2026.
- **Indemnidad:** los modelos de disponibilidad general de Veo y Gemini figuran en la lista de servicios con indemnidad por lo generado.
  Fuente: cloud.google.com/terms/generative-ai-indemnified-services, consultada el 17-11-2026. La cláusula de propiedad de lo
  generado no se leyó todavía: hay que leerla antes de pautar.
- **Etiquetas de IA en plataformas** (fuentes secundarias del 17-11-2026, a confirmar en la política de cada una):
  - TikTok pide marcar «AI Disclosure» en el anuncio.
  - YouTube pide declarar el contenido realista alterado o sintético.
  - Meta pone su etiqueta «Información de IA» con C2PA.
- **Límites de la API en la prueba:** hay cuota por minuto (devuelve 429) y se reintenta con espera. La API key funciona atada a una
  cuenta de servicio; el proxy del entorno la inyecta como `X-Goog-Api-Key` y nunca aparece en el código.

## Estimación de gasto (ESTIMACIÓN; método: segundos generados × tarifa publicada, más imágenes a ~USD 0,04)

- 17 tomas de video (82 s en total) y unas 30 imágenes clave: **~USD 35** de USD 330.
- Una versión 16:9 con las mismas tomas costaría ~USD 35 más.

## Aprendizajes (INFERENCIA, de revisar cuadro a cuadro)

1. **Las caras de cerca delatan a la IA.** Planos medios y abiertos, de espaldas o de perfil, y poca profundidad de campo. La única cara de frente
   es un plano medio corto.
2. **Pantallas verdes en las tomas → la app real compuesta encima.** Funciona si:
   - las esquinas salen de rectas ajustadas a los lados del verde (no del casco convexo, que deja la app chica o la saca del marco);
   - el alfa es el verde mismo, así las esquinas redondeadas y el dedo quedan bien;
   - el verde que sobra (reflejos, luz en la cara) pasa al violeta de la app.

   El fundador vio la primera versión «rara» y tenía razón: la app se salía del marco.
3. **La pantalla de la iglesia** se genera blanca lisa y se reemplaza por La Pantalla real. La proporción se mantiene con bandas del
   color de fondo. Cuando hay gente delante a contraluz, se desenfoca la pantalla y se funden los bordes; si no, se ven recortes duros.
4. **Las marcas se cuelan.** Una zapatilla salió con una pipa de una marca conocida y se resolvió recortando y oscureciendo los pies.
   Hay que revisar ropa y calzado en cada toma.
5. **La iglesia** se pidió moderna (fachada de vidrio, cruz simple, auditorio con pantalla LED), «no catedral». La calidez se logra con
   planos cercanos de los chicos y una sola toma abierta.
6. **Montaje por tramos.** Cada toma carga solo su tramo, porque el video entero a 1080×1920 no entra en memoria. Así, 60 s se arman
   en unos 35 minutos en 4 núcleos.

## Versión 2 (17-11-2026, después del rechazo del fundador)

**Qué rechazó el fundador de la primera versión:**
- las pantallas vibraban dentro del teléfono y del proyector;
- todo iba lento;
- la gente parecía robot;
- la iglesia como lugar para jugar no es el core de Senda;
- la música no tenía nada que ver con la app.

**Cómo se rehizo (INFERENCIA de lo que falló → decisión):**
1. **Pantallas.** La app ya no se compone sobre teléfonos generados (la detección cuadro a cuadro tiembla). Va en un teléfono dibujado
   por código (Remotion, transformaciones 3D de CSS): la pantalla es parte del teléfono y no puede moverse sola.
2. **Velocidad.**
   - Cortes al compás: 115 golpes por minuto, un plano cada uno o dos tiempos.
   - La app, grabada a velocidad real con el reloj de Playwright y apenas acelerada.
   - Las personas, a 1,08× y en tramos de un segundo.
3. **Personas.** El fundador eligió IA en planos cortos. Lo que cambió:
   - el estilo pasó de «película» a foto documental de teléfono, con luz natural y casas comunes (el mate en la mesa);
   - reacciones chicas, nunca sobreactuadas;
   - dos variantes por toma y se elige la mejor;
   - se revisa a resolución completa el tramo exacto que se usa.

   Se descartaron por mostrar la IA: la reacción sobreactuada (ojos desorbitados), los brazos que se enredan en un grupo de cinco, las
   cabezas que se funden y una cara que cambia en medio segundo.
4. **Core.** Aprender la Biblia jugando, solo o con amigos y familia:
   - la ruleta y la pregunta;
   - la Travesía;
   - la armadura;
   - el duelo con un amigo;
   - los torneos con el grupo;
   - una lección.

   Sin iglesia.
5. **Música.** «Funky Chunk» de Kevin MacLeod (CC BY 4.0), la música del Espadeo que el fundador pidió como estilo. Se usan los últimos
   30 s del tema, así el final real de la música coincide con la cruz del logo. Encima van los sonidos de la app.

**Montaje de la v2 (INFERENCIA de lo que se vio al revisar cuadro a cuadro):**
1. **El render de solo audio de Remotion no carga un iframe.** El cierre real del logo (un HTML) nunca termina de cargar, así que el
   sonido va en una composición propia sin imagen (`Comercial30Audio`) y se une al final.
2. **Las pantallas llenas de la app se recortan arriba y abajo**, porque la app es más alta que el 9:16. Los títulos de arriba
   («¡Ganaste!», «Pieza ganada») se cortaban:
   - el recorte se corre hacia arriba;
   - el acercamiento de cámara se ancla arriba.
3. **Zona segura de redes.** Abajo, TikTok e Instagram ponen la descripción y los botones. Los textos van arriba (y = 190–460 de
   1920); la única excepción es la armadura, que lleva una franja oscura y queda más arriba que antes.
4. **Lany con armadura quieta 1,5 s se sentía muerta.** El baile del Taller de Lany funciona con «Armadura completa»; los gestos
   sueltos no se mueven al grabarlos cuadro a cuadro.
5. **El cierre arranca con la luz ya en camino** (sin medio segundo de fondo vacío). El tiempo del cierre va por tramos, así la cruz
   se enciende igual en el golpe final de la música.
6. **Un toque se ve.** Cada toque en la app lleva un anillo y su sonido en el mismo cuadro (la pregunta y la lección).
7. **Render por tramos de 150 cuadros**, cada uno en su propio proceso: con 4 núcleos y 15 GB, 30 s salen en unos 15 minutos. Al
   cambiar una toma se rehacen solo sus tramos. Ojo: una toma puede cruzar el borde de un tramo, y entonces hay que rehacer los dos.

**Gasto** (ESTIMACIÓN; método: segundos del registro `registro_vertex.jsonl` × USD 0,40, la tarifa con sonido; sin sonido es más
barato, así que es un techo):
- v2: 60 s de video (7 tomas de 4 s y 4 segundas variantes) → ~USD 24;
- v1: 84 s → ~USD 34;
- 29 imágenes clave → ~USD 1.

Total de la campaña: **~USD 59 de USD 330**. Hay que confirmarlo en la consola de facturación de Google Cloud.
