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

/** Hard per-route wall clock — never let one URL hang the build. */
const ROUTE_TIMEOUT_MS = Math.max(5000, Number(process.env.PRERENDER_ROUTE_TIMEOUT_MS || 18000));

/** Recycle Chromium periodically to avoid Sparticuz memory growth. */
const BROWSER_RESTART_EVERY = Math.max(
  10,
  Number(process.env.PRERENDER_BROWSER_RESTART_EVERY || (useServerlessChromium ? 40 : 80)),
);

/** Cap total browser launches for the whole build (periodic + crash recovery). */
const MAX_BROWSER_LAUNCHES = Math.max(
  5,
  Number(process.env.PRERENDER_MAX_BROWSER_LAUNCHES || (useServerlessChromium ? 25 : 40)),
);

/**
 * Always sequential. Shared browser + periodic restart is not safe with parallel pages,
 * and Vercel Sparticuz cannot sustain concurrency > 1 for this workload.
 */
const CONCURRENCY = 1;

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
    process.env.LD_LIBRARY_PATH = [execDir, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");

    return playwrightChromium.launch({
      args: [
        ...sparticuz.args,
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
        "--no-zygote",
      ],
      executablePath,
      headless: true,
    });
  }

  const { chromium } = await import("playwright");
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
  head = upsertMeta(
    head,
    "property",
    "og:url",
    rewriteLocalOrigins(snapshot.ogUrl || snapshot.canonical, origins, siteUrl),
  );
  head = upsertMeta(
    head,
    "property",
    "og:image",
    rewriteLocalOrigins(snapshot.ogImage || "", origins, siteUrl),
  );
  head = upsertMeta(head, "property", "og:site_name", "SmartChem");
  head = upsertMeta(head, "name", "twitter:card", "summary_large_image");
  head = upsertMeta(head, "name", "twitter:title", snapshot.twitterTitle || title);
  head = upsertMeta(
    head,
    "name",
    "twitter:description",
    snapshot.twitterDescription || snapshot.description,
  );
  head = upsertMeta(
    head,
    "name",
    "twitter:image",
    rewriteLocalOrigins(snapshot.twitterImage || snapshot.ogImage || "", origins, siteUrl),
  );
  head = upsertLink(head, "canonical", rewriteLocalOrigins(snapshot.canonical, origins, siteUrl));
  head = head.replace(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "");

  const jsonLdTags = jsonLd
    .map((text, index) => {
      const id = index === 0 ? "smartchem-global-jsonld" : `smartchem-jsonld-${index}`;
      return `<script type="application/ld+json" id="${id}">${text}</script>`;
    })
    .join("\n    ");

  if (jsonLdTags) head += `\n    ${jsonLdTags}\n  `;
  html = `${head}${rest}`;

  if (!/<div id="root"><\/div>/i.test(html) && !/<div id="root">\s*<\/div>/i.test(html)) {
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>\s*(?=<\/body>)/i,
      `<div id="root">${rootHtml}</div>`,
    );
  } else {
    html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${rootHtml}</div>`);
  }

  return html;
}

function writeFallbackHtml(route, shell) {
  const outFile = routeToFile(route);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, shell, "utf8");
}

function isProductDetailRoute(route) {
  return /^\/products\/(?!category\/|partner\/)[^/]+$/.test(route);
}

function isClosedError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  return /has been closed|Target page|Target closed|browser has been closed|context has been closed|Protocol error|Connection closed|crash|browser disconnected/i.test(
    msg,
  );
}

function isTimeoutError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  return /Route timeout|Timeout|timed out/i.test(msg);
}

function isPageOpen(page) {
  try {
    return Boolean(page) && !page.isClosed();
  } catch {
    return false;
  }
}

async function safeClosePage(page) {
  if (!page) return;
  try {
    if (!page.isClosed()) await page.close({ runBeforeUnload: false });
  } catch {
    // ignore
  }
}

async function safeCloseBrowser(browser) {
  if (!browser) return;
  try {
    if (browser.isConnected()) await browser.close();
  } catch {
    // ignore
  }
}

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
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
  preview: { port: 4173, strictPort: false, host: "127.0.0.1" },
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
console.log(
  `[prerender] Config concurrency=${CONCURRENCY} routeTimeout=${ROUTE_TIMEOUT_MS}ms restartEvery=${BROWSER_RESTART_EVERY} maxBrowserLaunches=${MAX_BROWSER_LAUNCHES} serverless=${useServerlessChromium}`,
);

/** Shared browser lifecycle — one process, recycled periodically. */
let browser = null;
let browserLaunches = 0;
let routesSinceBrowserStart = 0;
const failures = [];
const fallbacks = [];
let completed = 0;
let successCount = 0;

async function startBrowser(reason) {
  if (browserLaunches >= MAX_BROWSER_LAUNCHES) {
    throw new Error(
      `Browser launch limit reached (${MAX_BROWSER_LAUNCHES}). Remaining routes will use SPA fallback.`,
    );
  }
  await safeCloseBrowser(browser);
  browser = null;
  browserLaunches += 1;
  console.log(
    `[prerender] Browser restart (${reason}) launch ${browserLaunches}/${MAX_BROWSER_LAUNCHES}`,
  );
  browser = await launchBrowser();
  routesSinceBrowserStart = 0;
  return browser;
}

async function getBrowser(reason = "ensure") {
  if (browser && browser.isConnected()) return browser;
  return startBrowser(reason);
}

async function captureRouteOnce(page, route) {
  if (!isPageOpen(page)) throw new Error("Page is already closed before capture");

  const url = route === "/" ? `${base}/` : `${base}${route}`;
  const expectedPath = route === "/" ? "/" : route;

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 12000 });
  if (!isPageOpen(page)) throw new Error("Page closed during navigation");

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
    { timeout: 10000 },
  );

  if (!isPageOpen(page)) throw new Error("Page closed while waiting for SEO readiness");

  if (isProductDetailRoute(route)) {
    await page.waitForFunction(
      () => {
        const h1 = document.querySelector("h1")?.textContent?.trim();
        const codeVisible = /product code:/i.test(document.body?.innerText || "");
        return Boolean(h1 && codeVisible);
      },
      { timeout: 6000 },
    );
  }

  if (!isPageOpen(page)) throw new Error("Page closed before page.evaluate()");

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
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(
        (el) => el.textContent || "",
      ),
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
  return html;
}

/**
 * One attempt: open page → capture with wall-clock timeout → always close page.
 * On browser crash: at most ONE restart + one retry for this route.
 */
async function renderRoute(route, index, total) {
  console.log(`[prerender] Rendering [${index}/${total}]: ${route}`);

  // Memory-safe periodic recycle (not per-route relaunch).
  if (browser && routesSinceBrowserStart >= BROWSER_RESTART_EVERY) {
    console.log(
      `[prerender] Memory-safe periodic restart after ${routesSinceBrowserStart} routes`,
    );
    try {
      await startBrowser("periodic");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[prerender] Periodic restart failed: ${message}`);
      writeFallbackHtml(route, spaShell);
      fallbacks.push(route);
      failures.push({ route, error: message, fallback: true });
      completed += 1;
      console.log(`[prerender] Progress: ${completed}/${total}`);
      return;
    }
  }

  let lastError = null;
  let didCrashRestart = false;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let page = null;
    try {
      await getBrowser(attempt === 1 ? "initial" : "retry");
      page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      page.setDefaultTimeout(12000);

      const html = await withTimeout(
        captureRouteOnce(page, route),
        ROUTE_TIMEOUT_MS,
        "Route timeout",
      );

      await safeClosePage(page);
      page = null;

      routesSinceBrowserStart += 1;
      successCount += 1;
      completed += 1;

      const marker =
        `${html.includes("application/ld+json") ? " [json-ld]" : ""}` +
        `${/<h1[\s>]/.test(html) ? " [h1]" : ""}` +
        `${isProductDetailRoute(route) && /"@type"\s*:\s*"Product"/i.test(html) ? " [product]" : ""}`;

      console.log(`[prerender] ✓ ${route}${marker}`);
      console.log(`[prerender] Progress: ${completed}/${total}`);
      return;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      const timedOut = isTimeoutError(err);
      const crashed = isClosedError(err) || (browser && !browser.isConnected());

      if (timedOut) {
        console.warn(`[prerender] Route timeout: ${route}`);
      } else {
        console.warn(`[prerender] Capture failed (${attempt}/2): ${message}`);
      }

      await safeClosePage(page);
      page = null;

      // Timeout / soft errors: do not relaunch browser in a loop — fall through to fallback.
      if (timedOut) break;

      // Crash: restart browser at most once for this route, then retry once.
      if (crashed && !didCrashRestart && browserLaunches < MAX_BROWSER_LAUNCHES) {
        didCrashRestart = true;
        console.warn(`[prerender] Browser crash detected — restarting once and retrying route`);
        try {
          await startBrowser("crash-recovery");
          continue;
        } catch (launchErr) {
          lastError = launchErr;
          break;
        }
      }

      break;
    }
  }

  const errorText = lastError instanceof Error ? lastError.message : String(lastError);
  console.error(`[prerender] Fallback SPA HTML for ${route}: ${errorText}`);
  writeFallbackHtml(route, spaShell);
  fallbacks.push(route);
  failures.push({ route, error: errorText, fallback: true });
  completed += 1;
  // Count toward recycle so we still rotate even when falling back.
  routesSinceBrowserStart += 1;
  console.log(`[prerender] Progress: ${completed}/${total}`);
}

await getBrowser("startup");

if (CONCURRENCY === 1) {
  for (let i = 0; i < routes.length; i += 1) {
    // If we hit launch cap mid-build, write fallbacks for the rest and stop Chromium work.
    if (browserLaunches >= MAX_BROWSER_LAUNCHES && (!browser || !browser.isConnected())) {
      const remaining = routes.slice(i);
      console.warn(
        `[prerender] Browser launch budget exhausted — writing SPA fallback for ${remaining.length} remaining routes`,
      );
      for (const route of remaining) {
        writeFallbackHtml(route, spaShell);
        fallbacks.push(route);
        failures.push({
          route,
          error: "Browser launch budget exhausted",
          fallback: true,
        });
        completed += 1;
        console.log(`[prerender] Progress: ${completed}/${routes.length}`);
      }
      break;
    }
    await renderRoute(routes[i], i + 1, routes.length);
  }
} else {
  const queue = routes.map((route, i) => ({ route, index: i + 1 }));
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const next = queue.shift();
      if (!next) break;
      await renderRoute(next.route, next.index, routes.length);
    }
  });
  await Promise.all(workers);
}

await safeCloseBrowser(browser);
browser = null;
await previewServer.close();

const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);

if (failures.length) {
  console.error("");
  console.error("==================================================");
  console.error("[prerender] FAILED ROUTES REPORT");
  console.error("==================================================");
  console.error(`[prerender] Failed captures: ${failures.length}`);
  console.error(`[prerender] SPA fallbacks: ${fallbacks.length}`);
  console.error(`[prerender] Successful prerenders: ${successCount}`);
  for (const [index, failure] of failures.entries()) {
    console.error(`[${index + 1}/${failures.length}] ${failure.route} — ${failure.error}`);
  }
  console.error("==================================================");
}

console.log(
  `[prerender] Done. ${routes.length} routes processed in ${elapsedSec}s ` +
    `(ok=${successCount}, fallback=${fallbacks.length}, browserLaunches=${browserLaunches}).`,
);

// Always succeed if every route has HTML (prerendered or SPA fallback).
const missing = routes.filter((route) => !existsSync(routeToFile(route)));
if (missing.length) {
  console.error(`[prerender] Missing HTML for ${missing.length} routes — failing build.`);
  process.exit(1);
}

if (fallbacks.length) {
  console.warn(
    `[prerender] ${fallbacks.length} route(s) used SPA fallback HTML. Deployment continues.`,
  );
}
