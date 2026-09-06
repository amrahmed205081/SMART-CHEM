/**
 * Copy Vite's SPA shell to 200.html / 404.html for hosts that rewrite
 * unmatched routes (Vercel vercel.json → /200.html, Netlify _redirects).
 * Used by build:vercel where Playwright prerender does not run.
 */
import { copyFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(root, "dist");
const indexHtml = resolve(distDir, "index.html");

if (!existsSync(indexHtml)) {
  console.error("[spa-shell] dist/index.html missing. Run vite build first.");
  process.exit(1);
}

copyFileSync(indexHtml, resolve(distDir, "200.html"));
copyFileSync(indexHtml, resolve(distDir, "404.html"));
console.log("[spa-shell] Wrote dist/200.html and dist/404.html from dist/index.html");
