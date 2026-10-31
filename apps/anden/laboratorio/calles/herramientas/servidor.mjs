// Servidor estatico con soporte de Range (PMTiles lo necesita). Uso: node herramientas/servidor.mjs [puerto]
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const root = path.resolve("web"), port = +(process.argv[2] || 8765);
const T = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".geojson": "application/json", ".bin": "application/octet-stream", ".pmtiles": "application/octet-stream", ".glb": "model/gltf-binary", ".pbf": "application/x-protobuf", ".png": "image/png", ".wasm": "application/wasm" };
http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, "http://x").pathname); let f = path.join(root, u === "/" ? "index.html" : u);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { console.error("404", req.url); res.writeHead(404); return res.end("no"); }
  const st = fs.statSync(f), h = { "Content-Type": T[path.extname(f)] || "application/octet-stream", "Accept-Ranges": "bytes", "Cache-Control": "no-cache" }, r = req.headers.range;
  if (r) { const m = /bytes=(\d*)-(\d*)/.exec(r); const a = m[1] ? +m[1] : 0, b = m[2] ? Math.min(+m[2], st.size-1) : st.size-1; res.writeHead(206, { ...h, "Content-Range": `bytes ${a}-${b}/${st.size}`, "Content-Length": b-a+1 }); fs.createReadStream(f, { start: a, end: b }).pipe(res); }
  else { res.writeHead(200, { ...h, "Content-Length": st.size }); fs.createReadStream(f).pipe(res); }
}).listen(port, "127.0.0.1", () => console.log("http://127.0.0.1:" + port));
