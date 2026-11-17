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
