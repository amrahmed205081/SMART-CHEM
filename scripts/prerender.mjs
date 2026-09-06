import { createServer as createViteServer, preview } from "vite";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { networkInterfaces } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = resolve(root, "dist");
const PLACEHOLDER = "https://YOUR-PRODUCTION-DOMAIN";

/** Vercel build/runtime — use serverless Chromium (no system libnspr4). */
const useServerlessChromium = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

const siteUrl = (process.env.VITE_SITE_URL || "").trim().replace(/\/$/, "") || PLACEHOLDER;

if (!process.env.VITE_SITE_URL) {
  console.warn(
    `[prerender] VITE_SITE_URL is not set. Canonical/OG URLs will use ${PLACEHOLDER} (not localhost). Set VITE_SITE_URL before production deploy.`,
  );
}

if (!existsSync(resolve(distDir, "index.html"))) {
  console.error("[prerender] dist/index.html missing. Run vite build first.");
  process.exit(1);
}

async function launchBrowser() {
  if (useServerlessChromium) {
    const { chromium: playwrightChromium } = await import("playwright-core");
    const sparticuz = (await import("@sparticuz/chromium")).default;

    if (typeof sparticuz.setGraphicsMode === "function") {
      sparticuz.setGraphicsMode(false);
    }

    const executablePath = await sparticuz.executablePath();
    const execDir = dirname(executablePath);
    // Critical on Vercel: bundled .so libs live next to the Chromium binary.
    process.env.LD_LIBRARY_PATH = [execDir, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");

    console.log(`[prerender] Using @sparticuz/chromium at ${executablePath}`);
    return playwrightChromium.launch({
      args: sparticuz.args,
      executablePath,
      headless: true,
    });
  }

  const { chromium } = await import("playwright");
  console.log("[prerender] Using local Playwright Chromium");
  return chromium.launch({ headless: true });
}

function routeToFile(route) {
  if (route === "/") return resolve(distDir, "index.html");
  const clean = route.replace(/^\//, "").replace(/\/$/, "");
  return resolve(distDir, clean, "index.html");
}

function rewriteLocalOrigins(html, origins, target) {
  let out = html;
  for (const origin of origins) {
    if (!origin) continue;
    out = out.split(origin).join(target);
  }
  return out;
}

function collectLocalOrigins(port) {
  const origins = new Set([
    `http://127.0.0.1:${port}`,
    `http://localhost:${port}`,
    `http://[::1]:${port}`,
  ]);
  for (const entries of Object.values(networkInterfaces())) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        origins.add(`http://${entry.address}:${port}`);
      }
    }
  }
  return [...origins];
}

function upsertMeta(headHtml, attr, key, content) {
  const re = new RegExp(`<meta\\s+[^>]*${attr}=["']${key}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  if (re.test(headHtml)) return headHtml.replace(re, tag);
  return `${headHtml}\n    ${tag}`;
}

function upsertLink(headHtml, rel, href) {
  const re = new RegExp(`<link\\s+[^>]*rel=["']${rel}["'][^>]*>`, "i");
  const tag = `<link rel="${rel}" href="${escapeAttr(href)}" />`;
  if (re.test(headHtml)) return headHtml.replace(re, tag);
  return `${headHtml}\n    ${tag}`;
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function buildPageHtml(shell, snapshot, origins) {
  const title = snapshot.title;
  const rootHtml = rewriteLocalOrigins(snapshot.rootHtml, origins, siteUrl);
  const jsonLd = snapshot.jsonLd.map((block) => rewriteLocalOrigins(block, origins, siteUrl));

  let html = shell;

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(title)}</title>`);

  const headClose = html.indexOf("</head>");
  if (headClose === -1) throw new Error("SPA shell missing </head>");

  let head = html.slice(0, headClose);
  const rest = html.slice(headClose);

  head = upsertMeta(head, "name", "description", snapshot.description);
  if (snapshot.keywords) head = upsertMeta(head, "name", "keywords", snapshot.keywords);
  head = upsertMeta(head, "name", "robots", snapshot.robots || "index, follow");
  head = upsertMeta(head, "property", "og:title", snapshot.ogTitle || title);
  head = upsertMeta(head, "property", "og:description", snapshot.ogDescription || snapshot.description);
  head = upsertMeta(head, "property", "og:type", snapshot.ogType || "website");
  head = upsertMeta(head, "property", "og:url", rewriteLocalOrigins(snapshot.ogUrl || snapshot.canonical, origins, siteUrl));
  head = upsertMeta(head, "property", "og:image", rewriteLocalOrigins(snapshot.ogImage || "", origins, siteUrl));
  head = upsertMeta(head, "property", "og:site_name", "SmartChem");
  head = upsertMeta(head, "name", "twitter:card", "summary_large_image");
  head = upsertMeta(head, "name", "twitter:title", snapshot.twitterTitle || title);
  head = upsertMeta(head, "name", "twitter:description", snapshot.twitterDescription || snapshot.description);
  head = upsertMeta(head, "name", "twitter:image", rewriteLocalOrigins(snapshot.twitterImage || snapshot.ogImage || "", origins, siteUrl));
  head = upsertLink(head, "canonical", rewriteLocalOrigins(snapshot.canonical, origins, siteUrl));

  // Drop any previous injected JSON-LD from a prior prerender pass on this shell copy.
  head = head.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "");

  const jsonLdTags = jsonLd
    .map((text, index) => {
      const id = index === 0 ? "smartchem-global-jsonld" : `smartchem-jsonld-${index}`;
      return `<script type="application/ld+json" id="${id}">${text}</script>`;
    })
    .join("\n    ");

  if (jsonLdTags) {
    head += `\n    ${jsonLdTags}\n  `;
  }

  html = `${head}${rest}`;

  if (!/<div id="root"><\/div>/i.test(html) && !/<div id="root">\s*<\/div>/i.test(html)) {
    // Shell may already contain whitespace inside root.
    html = html.replace(/<div id="root">[\s\S]*?<\/div>\s*(?=<\/body>)/i, `<div id="root">${rootHtml}</div>`);
  } else {
    html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${rootHtml}</div>`);
  }

  return html;
}

async function loadRoutes() {
  const vite = await createViteServer({
    root,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
    optimizeDeps: { disabled: true },
  });
  try {
    const mod = await vite.ssrLoadModule("/src/seo/prerenderRoutes.ts");
    return mod.collectPrerenderRoutes();
  } finally {
    await vite.close();
  }
}

const routes = await loadRoutes();
const startedAt = Date.now();
console.log(`[prerender] Preparing ${routes.length} routes…`);

const spaShell = readFileSync(resolve(distDir, "index.html"), "utf8");
writeFileSync(resolve(distDir, "200.html"), spaShell);
writeFileSync(resolve(distDir, "404.html"), spaShell);

const publicRedirects = resolve(root, "public", "_redirects");
if (!existsSync(publicRedirects)) {
  writeFileSync(
    publicRedirects,
    `# SPA fallback for non-prerendered routes on Netlify and other hosts that support _redirects.
# Vercel ignores this file — SPA fallback on Vercel is configured in vercel.json → /200.html.
# Existing prerendered files (/, /about/index.html, etc.) are served first.
/*    /200.html   200
`,
  );
}
writeFileSync(
  resolve(distDir, "_redirects"),
  `# SPA fallback for non-prerendered routes (Netlify / _redirects hosts).
# Vercel uses vercel.json rewrites to /200.html instead.
/*    /200.html   200
`,
);

const previewServer = await preview({
  root,
  preview: {
    port: 4173,
    strictPort: false,
    host: "127.0.0.1",
  },
  logLevel: "error",
});

const previewUrl = previewServer.resolvedUrls?.local?.[0] || previewServer.resolvedUrls?.network?.[0];
if (!previewUrl) {
  console.error("[prerender] Could not resolve Vite preview URL.");
  await previewServer.close();
  process.exit(1);
}

const base = previewUrl.replace(/\/$/, "");
const port = new URL(base).port || "4173";
const localOrigins = collectLocalOrigins(port);

console.log(`[prerender] Preview server at ${base}`);

const CONCURRENCY = Math.max(1, Math.min(3, Number(process.env.PRERENDER_CONCURRENCY || 3)));
const browser = await launchBrowser();
const failures = [];
let completed = 0;

function isProductDetailRoute(route) {
  return /^\/products\/(?!category\/|partner\/)[^/]+$/.test(route);
}

async function captureRoute(page, route) {
  const url = route === "/" ? `${base}/` : `${base}${route}`;
  const expectedPath = route === "/" ? "/" : route;

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  await page.waitForFunction(
    (path) => {
      const win = window;
      const root = document.getElementById("root");
      const ready = Boolean(win.__PRERENDER_READY__);
      const readyPath = win.__PRERENDER_PATH__ || "";
      const pathOk = readyPath === path || (path === "/" && (readyPath === "/" || readyPath === ""));
      const title = document.title || "";
      const desc = document.querySelector('meta[name="description"]')?.getAttribute("content");
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
      const bodyText = document.body?.innerText || "";
      const notFound = /product not found/i.test(bodyText);
      return Boolean(ready && pathOk && root?.childElementCount && title && desc && canonical && !notFound);
    },
    expectedPath,
    { timeout: 30000 },
  );

  if (isProductDetailRoute(route)) {
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector("h1")?.textContent?.trim();
        const codeVisible = /product code:/i.test(document.body?.innerText || "");
        return Boolean(h1 && codeVisible);
      },
      { timeout: 10000 },
    );
  }

  const snapshot = await page.evaluate(() => {
    const meta = (attr, key) =>
      document.head.querySelector(`meta[${attr}="${key}"]`)?.getAttribute("content") || "";
    const canonical = document.head.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
    return {
      title: document.title,
      description: meta("name", "description"),
      keywords: meta("name", "keywords"),
      robots: meta("name", "robots"),
      canonical,
      ogTitle: meta("property", "og:title"),
      ogDescription: meta("property", "og:description"),
      ogType: meta("property", "og:type"),
      ogUrl: meta("property", "og:url"),
      ogImage: meta("property", "og:image"),
      twitterTitle: meta("name", "twitter:title"),
      twitterDescription: meta("name", "twitter:description"),
      twitterImage: meta("name", "twitter:image"),
      rootHtml: document.getElementById("root")?.innerHTML || "",
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((el) => el.textContent || ""),
    };
  });

  if (!snapshot.rootHtml || snapshot.rootHtml.length < 50) {
    throw new Error("Root HTML was empty after render");
  }

  if (/localhost|127\.0\.0\.1/i.test(snapshot.canonical || "")) {
    throw new Error(`Canonical still points at localhost: ${snapshot.canonical}`);
  }

  const html = buildPageHtml(spaShell, snapshot, localOrigins);
  const outFile = routeToFile(route);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, html, "utf8");

  completed += 1;
  const hasJsonLd = html.includes("application/ld+json");
  const hasH1 = /<h1[\s>]/i.test(html);
  const hasProductSchema = /"@type"\s*:\s*"Product"/i.test(html);
  const marker =
    `${hasJsonLd ? " [json-ld]" : ""}${hasH1 ? " [h1]" : ""}${
      isProductDetailRoute(route) && hasProductSchema ? " [product]" : ""
    }`;

  if (completed === routes.length || completed % 10 === 0 || !isProductDetailRoute(route)) {
    console.log(`[prerender] ✓ (${completed}/${routes.length}) ${route}${marker}`);
  }
}

console.log(`[prerender] Concurrency=${CONCURRENCY}`);

const queue = [...routes];
const workers = Array.from({ length: CONCURRENCY }, async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  while (queue.length) {
    const route = queue.shift();
    if (!route) break;
    try {
      await captureRoute(page, route);
    } catch (err) {
      failures.push({ route, error: err instanceof Error ? err.message : String(err) });
      console.error(`[prerender] ✗ ${route}:`, err instanceof Error ? err.message : err);
    }
  }
  await page.close();
});

await Promise.all(workers);
await browser.close();
await previewServer.close();

const elapsedMs = Date.now() - startedAt;
const elapsedSec = (elapsedMs / 1000).toFixed(1);

if (failures.length) {
  console.error("");
  console.error("==================================================");
  console.error("[prerender] FAILED ROUTES REPORT");
  console.error("==================================================");

  failures.forEach((failure, index) => {
    console.error("");
    console.error(`[${index + 1}/${failures.length}] ROUTE: ${failure.route}`);
    console.error(`ERROR: ${failure.error}`);
  });

  console.error("");
  console.error("==================================================");
  console.error(
    `[prerender] Failed ${failures.length}/${routes.length} routes in ${elapsedSec}s.`
  );
  console.error("==================================================");

  process.exit(1);
}

console.log(`[prerender] Done. ${routes.length} pages written to dist/ in ${elapsedSec}s.`);
