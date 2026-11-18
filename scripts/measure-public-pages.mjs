import { gzipSync } from "node:zlib";

// Anonymous, read-only HTTP measurements. Run against a production build, not next dev.
// Gzip sizes are estimates of transfer size, not browser LCP or a mobile-network simulation.
const base = new URL(process.argv[2] || "http://127.0.0.1:3000");
const results = [];
for (const path of ["/trainee/login", "/"]) {
  const start = performance.now();
  const response = await fetch(new URL(path, base));
  const headersMs = Math.round(performance.now() - start);
  const html = await response.text();
  const documentMs = Math.round(performance.now() - start);
  const scripts = [...new Set([...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]))];
  let scriptGzipBytes = 0;
  for (const src of scripts) {
    const url = new URL(src, base);
    if (url.origin !== base.origin) continue;
    const asset = await fetch(url);
    if (!asset.ok) throw new Error(`Script returned ${asset.status}: ${url.pathname}`);
    scriptGzipBytes += gzipSync(Buffer.from(await asset.arrayBuffer())).length;
  }
  results.push({ path, status: response.status, headersMs, documentMs, htmlGzipBytes: gzipSync(html).length, initialScriptCount: scripts.length, initialScriptGzipBytes: scriptGzipBytes });
}
console.log(JSON.stringify(results, null, 2));
