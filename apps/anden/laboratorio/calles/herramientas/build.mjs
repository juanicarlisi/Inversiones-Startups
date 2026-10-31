import { build } from "esbuild"; import fs from "node:fs";
fs.mkdirSync("web/dist", { recursive: true });
await build({ entryPoints: ["web/src/main.js"], bundle: true, minify: true, format: "iife", target: "es2022", outfile: "web/dist/app.js", sourcemap: false, logLevel: "info",
  loader: { ".glb": "file" }, define: { "process.env.NODE_ENV": '"production"' } });
fs.copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl.css", "web/dist/maplibre-gl.css");
fs.copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "web/dist/maplibre-gl-worker.mjs");
