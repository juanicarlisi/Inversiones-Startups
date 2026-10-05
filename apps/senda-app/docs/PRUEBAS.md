# Cómo probar Senda

## 1. Vista previa web (ya, sin cuentas ni costo)

Cada sprint publica una página privada en claude.ai con la app completa. Se abre desde el celular con tu sesión de claude.ai.
Funciona como la app, salvo la vibración, la voz del teléfono (depende del navegador) y que todo queda guardado en ese navegador.

Para generarla: `npm run vista-previa` → carpeta `vista-previa/` lista para publicar (rutas relativas).

## 2. En tu teléfono Android (desde fines de octubre)

Con una cuenta gratis de Expo se compila un APK de prueba con EAS Build (15 compilaciones gratis por mes) y se instala directamente,
sin Google Play. Requisito del entorno de Claude: permitir `expo.dev` y `api.expo.dev` en la configuración de red.

## 3. Prueba cerrada en Google Play (fines de noviembre)

Con la cuenta de Google Play: 12 testers durante 14 días (requisito de Google para cuentas personales nuevas) antes de publicar.

## 4. iPhone

Con la cuenta de Apple (USD 99 por año): TestFlight. Sin cuenta, la vista previa web funciona en Safari.

## Qué mirar en cada prueba (30 minutos)

1. ¿Se ve profesional al lado de Duolingo, Preguntados o Candy Crush? ¿Algo se ve infantil o «hecho en Claude»?
2. ¿Qué te hizo sentir algo (alegría, sorpresa, ternura)? ¿Qué te dejó frío?
3. ¿Algo confuso o lento? ¿Algún texto raro?
4. ¿Qué cambiarías primero?
