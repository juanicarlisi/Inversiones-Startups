# Senda

App cristiana para conocer la Biblia **jugando, leyendo y en comunidad**. Expo + React Native + TypeScript.

- Instrucciones para trabajar en el repo (también para Claude): [`CLAUDE.md`](CLAUDE.md)
- Plan hasta el lanzamiento (18-12-2026): [`docs/SPRINTS.md`](docs/SPRINTS.md)
- Cómo probar: [`docs/PRUEBAS.md`](docs/PRUEBAS.md)
- Diseño emocional: [`docs/DISENO_EMOCIONAL.md`](docs/DISENO_EMOCIONAL.md)
- Proyecto completo: repositorio del holding, `oportunidades/proyectos/senda/` (PDF v2.1)

```bash
npm install
./scripts/descargar_biblias.sh   # solo si faltan assets/biblia/*.bib
npx tsc --noEmit
npm run vista-previa             # versión web lista para publicar en vista-previa/
```

Textos bíblicos: Reina-Valera 1909 (dominio público), La Biblia en Español Sencillo (CC BY 4.0, AudioBiblia.org / Irma Flores) y
Palabra de Dios para ti (CC BY-SA 4.0). Tipografías Unbounded, Plus Jakarta Sans y Literata (SIL Open Font License).
Código privado; todos los derechos reservados.
