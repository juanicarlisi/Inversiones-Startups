# Corte 1 · Paso 0 (anexo de `../corte-1.md`)

Este directorio es el **andamio literal** del corte 1 del simulador Andén. El paso 0 lo copia entero a `apps/anden/simulador/`:

```bash
mkdir -p apps/anden/simulador
cp -r oportunidades/proyectos/anden/corte-1-paso0/. apps/anden/simulador/
rm apps/anden/simulador/LEEME.md
cd apps/anden/simulador && npm install   # opcional para las pruebas: Node 22.18+ corre los .ts sin compilar
npm test                                 # tiene que dar 6 de 6
```

Qué hay:
- `package.json` y `tsconfig.json` del simulador (TypeScript borrable, módulos ES, pruebas con `node --test`).
- `contratos/`: los contratos congelados entre paquetes (copiados literalmente en el Anexo A de `../corte-1.md`), el modelo de
  ejemplo completo (`ejemplos/hub-chico.json`), el **motor de referencia** (`referencia/motor-referencia.ts`, para avanzar antes de que
  exista `nucleo/` y para la prueba diferencial R08) y la **traza de la maqueta** (`fixtures/`, solo para desarrollar vistas e interfaz).
- `contratos/pruebas/paso0.test.ts`: 6 pruebas que confirman que la copia está bien.

Verificado el 17-10-2026: `tsc` 6.0.2 sin errores y 6 de 6 pruebas en Node 22.22.0.
