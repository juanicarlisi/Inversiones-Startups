# La ilustración de Lany para la entrada: prompt para generarla con otra IA

**Fecha:** 24-10-2026 (prueba 34). El fundador vio la pose generada con el motor de Rive («parece con los brazos quebrados») y pidió no
reintentar: generar la imagen con otra IA (ChatGPT/DALL·E, Midjourney, Ideogram, Gemini) a partir de este prompt y de la lámina de
referencia `consola/propuestas/lany/lany_referencia.png`, y después ver si se anima.

## Cómo usarlo

1. Subí la **lámina de referencia** junto con el prompt (los generadores que aceptan imagen de referencia respetan mucho mejor al
   personaje). Si el generador no acepta imágenes, el prompt describe a Lany entero.
2. Pedí **fondo transparente** (o, si no se puede, fondo blanco liso: se recorta) y el **cuerpo entero, con los pies**.
3. Generá 4 variantes y elegí la que más se parezca a la Lany de la referencia (mismos colores, mismas proporciones: cabeza grande,
   cuerpo de lana, brazos y patas finos). Si el generador «inventa» ropa, pelaje negro u ojos distintos, pedile que corrija eso.
4. Mandámela en el chat (PNG, lo más grande que salga, ideal 2000 px de alto o más). La pongo en la entrada en la próxima prueba.
   Si querés la versión **con la armadura** (para el festejo de la armadura completa), hay un segundo prompt abajo.

## Prompt (en inglés, que es lo que mejor entienden los generadores)

> Character illustration, full body, transparent background, PNG. The character is **Lany**, the mascot of a Bible-learning app:
> a young, slim, cool-looking sheep. **Face, ears, arms and legs are warm cinnamon brown** (a lighter cinnamon on the muzzle and
> around the eyes); **the body is a cloud of soft cream-white wool**, slightly pear-shaped, with a small curly cream tuft of wool on
> top of the head like a quiff. Big friendly eyes with blue-violet irises and bright white highlights, cream eyebrows, small smile,
> pink inner ears. An **orange neckerchief** tied with a knot in front. Thin brown arms with rounded hands, thin brown legs, **white
> sneakers with an orange stripe**. No clothes other than the neckerchief. **Pose:** standing confidently facing the viewer at a slight
> three-quarter angle, **fists on the hips, elbows out, chest out, chin slightly up**, weight on one leg, a confident half-smile and
> one eyebrow raised, like an athlete posing for the team photo. **Style:** modern 2D vector mascot for a premium mobile game, clean
> shapes, **two-tone cel shading with soft volume** (no gradients, no 3D render, no photorealism), no outlines or very thin ones,
> consistent lighting from the top left. Centered, full body visible including the feet, nothing cropped, no text, no logo, no
> background elements, no shadow on the ground.

**Variante con la armadura de Dios** (agregar al final del prompt):

> Lany wears the full «armor of God»: a silver helmet with an orange rim, a silver breastplate over the wool, a brown belt with a
> golden buckle, silver boots with orange trim replacing the sneakers, a round **blue shield with a golden cross** on the left arm and a
> short silver sword with a golden hilt held upright in the right hand. Same cinnamon face and cream wool, same style.

**Si sale mal, correcciones típicas (en inglés):** «keep the face cinnamon brown, not black», «the body is cream wool, not a shirt»,
«thin arms and legs, big round head», «two-tone cel shading only, no gradients», «full body, feet visible», «transparent background».

## Lo que no puede ser (blindaje legal, docs/LEGAL.md)

- Nada que se parezca a Shaun the Sheep (cara negra con lana clara y copete) ni a la mascota de otra app: Lany es **canela** con lana
  crema, y así tiene que quedar.
- No pedirle al generador «como Duolingo» ni «como Preguntados»: se describe a Lany, no a otro personaje.
- La imagen generada se anota en `docs/LEGAL.md` con el generador y la fecha (los términos de uso de cada generador dicen si el
  resultado se puede usar comercialmente; ChatGPT/DALL·E, Midjourney con suscripción e Ideogram lo permiten; se verifica el día que
  se genera).

## Qué hago yo después

1. Recorto el fondo si hace falta, la escalo a dos tamaños (entrada y festejo) y la pongo en `assets/lani/` con su crédito.
2. La entrada la usa quieta, con los movimientos que ya tiene la pantalla (entra desde abajo, respira, la luz y los medallones se
   mueven alrededor): con una sola imagen bien hecha alcanza para que se vea de primer nivel.
3. Si después queremos que Lany se mueva en la entrada (parpadeo, el copete al viento), le pedimos al mismo generador la misma pose
   **en capas** (cabeza, ojos cerrados, brazos, cuerpo, copete) y la armo en Rive. Es un paso aparte y no frena nada.
