import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer, preview } from "vite";
import { chromium } from "playwright";

const distDir = resolve("dist");

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
  optimizeDeps: { disabled: true },
});

let collectPrerenderCatalogHubRoutes;
let collectPrerenderRoutes;
let collectSitemapPaths;
let resolveCanonicalFamilyPath;
let resolveCanonicalPartnerHubPath;
let partnerFamilies;
let partners;

try {
  ({ collectPrerenderCatalogHubRoutes, collectPrerenderRoutes } = await vite.ssrLoadModule(
    "/src/seo/prerenderRoutes.ts",
  ));
  ({ collectSitemapPaths } = await vite.ssrLoadModule("/src/seo/sitemap.ts"));
  ({ resolveCanonicalFamilyPath, resolveCanonicalPartnerHubPath } = await vite.ssrLoadModule(
    "/src/services/catalog.ts",
  ));
  ({ partnerFamilies } = await vite.ssrLoadModule("/src/data/partnerFamilies.ts"));
  ({ partners } = await vite.ssrLoadModule("/src/data/partners.ts"));
} finally {
  await vite.close();
}

const hubRoutes = collectPrerenderCatalogHubRoutes();
const allPrerender = collectPrerenderRoutes();
const sitemapPaths = collectSitemapPaths();

const partnerHubs = hubRoutes.filter((p) => p.split("/").length === 5);
const familyHubs = hubRoutes.filter((p) => p.split("/").length === 6);
const legacyInSitemap = sitemapPaths.filter((p) => p.startsWith("/products/partner/"));
const legacyInPrerender = allPrerender.filter((p) => p.startsWith("/products/partner/"));
const categoryPartnerInSitemap = sitemapPaths.filter(
  (p) => /^\/products\/category\/[^/]+\/[^/]+$/.test(p),
);
const categoryFamilyInSitemap = sitemapPaths.filter(
  (p) => /^\/products\/category\/[^/]+\/[^/]+\/[^/]+$/.test(p),
);

function inspectHtml(route, expectH1Contains) {
  const file =
    route === "/"
      ? resolve(distDir, "index.html")
      : resolve(distDir, route.replace(/^\//, ""), "index.html");
  if (!existsSync(file)) return { route, ok: false, error: "missing html" };
  const html = readFileSync(file, "utf8");
  const title = (html.match(/<title>([^<]*)<\/title>/i)?.[1] || "").replace(/&amp;/g, "&");
  const description = html.match(/name="description"\s+content="([^"]*)"/i)?.[1] || "";
  const canonical = html.match(/rel="canonical"\s+href="([^"]*)"/i)?.[1] || "";
  const ogTitle = html.match(/property="og:title"\s+content="([^"]*)"/i)?.[1] || "";
  const hasJsonLd = /application\/ld\+json/i.test(html);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = (h1Match?.[1] || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const notFound = /not found/i.test(html);
  const localhost = /localhost|127\.0\.0\.1/i.test(html);

  const checks = {
    fileExists: true,
    title: Boolean(title),
    description: Boolean(description),
    canonical: Boolean(canonical) && canonical.includes(route === "/" ? "/" : route),
    ogTitle: Boolean(ogTitle),
    jsonLd: hasJsonLd,
    h1:
      Boolean(h1) &&
      (!expectH1Contains || h1.toLowerCase().includes(String(expectH1Contains).toLowerCase())),
    notFound: !notFound,
    noLocalhost: !localhost,
  };

  return { route, ok: Object.values(checks).every(Boolean), checks, title, description, canonical, h1 };
}

const applicationsPage = inspectHtml("/applications", "Applications");
const partnerSamples = partnerHubs.slice(0, 3).map((route) => inspectHtml(route));
const familySamples = [
  familyHubs[0],
  familyHubs[Math.floor(familyHubs.length / 2)],
  familyHubs[familyHubs.length - 1],
]
  .filter(Boolean)
  .map((route) => inspectHtml(route));

const newHtmlResults = [applicationsPage, ...partnerSamples, ...familySamples];
const titles = newHtmlResults.map((r) => r.title).filter(Boolean);
const metas = newHtmlResults.map((r) => r.description).filter(Boolean);

const productDirs = existsSync(resolve(distDir, "products"))
  ? readdirSync(resolve(distDir, "products"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  : [];

let legacyHtmlCount = 0;
function countLegacy(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) countLegacy(full);
    else if (entry.name === "index.html") legacyHtmlCount += 1;
  }
}
countLegacy(resolve(distDir, "products", "partner"));

const server = await preview({
  preview: { port: 4181, strictPort: true, host: "127.0.0.1" },
  logLevel: "error",
});
const base = server.resolvedUrls.local[0].replace(/\/$/, "");
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

async function readCanonical(route) {
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(document.querySelector('link[rel="canonical"]')));
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  const h1 = (await page.locator("h1").first().innerText()).trim();
  const legacyLinks = await page.locator('a[href^="/products/partner/"]').count();
  return { route, canonical: canonical || "", h1, legacyLinks, loads: !/not found/i.test(h1) };
}

const legacyHubChecks = [];
for (const partner of partners) {
  const route = `/products/partner/${partner.id}`;
  const expected = resolveCanonicalPartnerHubPath(partner.id);
  const result = await readCanonical(route);
  legacyHubChecks.push({
    ...result,
    expectedCanonicalPath: expected,
    ok: expected
      ? result.canonical.endsWith(expected) && result.loads && result.legacyLinks === 0
      : result.canonical.endsWith(route) && result.loads && result.legacyLinks === 0,
  });
}

const legacyFamilyChecks = [];
for (const family of partnerFamilies.filter((f) => partners.some((p) => p.id === f.partner))) {
  const route = `/products/partner/${family.partner}/${family.id}`;
  const expected = resolveCanonicalFamilyPath(family.partner, family.id);
  const result = await readCanonical(route);
  legacyFamilyChecks.push({
    ...result,
    expectedCanonicalPath: expected,
    ok: Boolean(expected) && result.canonical.endsWith(expected) && result.loads,
  });
}

// Applications hub is informational (no detail links)
await page.goto(`${base}/applications`, { waitUntil: "networkidle" });
const appDetailLinks = await page.locator('a[href^="/applications/"]').count();
const applicationsHubOk = Boolean(await page.locator("h1").count()) && appDetailLinks === 0;

// Products → Category → Partner → Family → Product
await page.goto(`${base}/products`, { waitUntil: "networkidle" });
await page.locator('a[href="/products/category/pigments"]').first().click();
await page.waitForURL("**/products/category/pigments");
await page.waitForTimeout(400);
await page.locator('a[href="/products/category/pigments/toda"]').first().click();
await page.waitForURL("**/products/category/pigments/toda");
await page.waitForTimeout(400);
await page.locator('a[href^="/products/category/pigments/toda/"]').first().click();
await page.waitForURL(/\/products\/category\/pigments\/toda\/[^/]+$/);
await page.waitForTimeout(400);
const productLink = page.locator('a[href^="/products/toda-"]').first();
await productLink.waitFor({ state: "visible" });
const productHref = await productLink.getAttribute("href");
await Promise.all([page.waitForURL((url) => url.pathname === productHref), productLink.click()]);
await page.waitForFunction(() => /product code:/i.test(document.body?.innerText || ""));
const catalogNavOk = /product code:/i.test(await page.locator("body").innerText());

await page.goBack({ waitUntil: "networkidle" });
const backOk = /\/products\/category\/pigments\/toda\//.test(page.url());

const refreshRoute = partnerHubs[0] || "/applications";
await page.goto(`${base}${refreshRoute}`, { waitUntil: "networkidle" });
await page.reload({ waitUntil: "networkidle" });
const refreshOk = Boolean(await page.locator("h1").first().innerText());

const directOk = [];
for (const sample of newHtmlResults) {
  await page.goto(`${base}${sample.route}`, { waitUntil: "networkidle" });
  const body = await page.locator("body").innerText();
  directOk.push({
    route: sample.route,
    ok: Boolean(await page.locator("h1").count()) && !/not found/i.test(body),
  });
}

await browser.close();
await server.close();

const eagleHub = legacyHubChecks.find((c) => c.route === "/products/partner/eagle-chemicals");

const report = {
  counts: {
    partnerHubs: partnerHubs.length,
    familyHubs: familyHubs.length,
    hubRoutesTotal: hubRoutes.length,
    allPrerender: allPrerender.length,
    sitemap: sitemapPaths.length,
    legacyInSitemap: legacyInSitemap.length,
    legacyInPrerender: legacyInPrerender.length,
    categoryPartnerInSitemap: categoryPartnerInSitemap.length,
    categoryFamilyInSitemap: categoryFamilyInSitemap.length,
    productDirs: productDirs.filter((n) => !["category", "partner"].includes(n)).length,
  },
  newHtmlResults,
  htmlAllOk: newHtmlResults.every((r) => r.ok),
  uniqueSampleTitles: new Set(titles).size === titles.length,
  uniqueSampleMetas: new Set(metas).size === metas.length,
  legacyHtmlCount,
  legacyNotPrerendered: legacyHtmlCount === 0,
  legacyHubChecks,
  legacyFamilyChecks,
  legacyHubsOk: legacyHubChecks.every((c) => c.ok),
  legacyFamiliesOk: legacyFamilyChecks.every((c) => c.ok),
  eagleHubHandling: eagleHub
    ? {
        route: eagleHub.route,
        canonical: eagleHub.canonical,
        selfCanonical: eagleHub.canonical.endsWith("/products/partner/eagle-chemicals"),
        note: "Multi-category partner; kept self-canonical (no single safe category hub).",
      }
    : null,
  applicationsHubOk,
  catalogNavOk,
  backOk,
  refreshOk,
  directOk,
  directAllOk: directOk.every((d) => d.ok),
  consoleErrors: errors,
};

console.log(JSON.stringify(report, null, 2));

if (
  !report.htmlAllOk ||
  !report.uniqueSampleTitles ||
  !report.uniqueSampleMetas ||
  !report.legacyNotPrerendered ||
  !report.legacyHubsOk ||
  !report.legacyFamiliesOk ||
  !report.applicationsHubOk ||
  !report.catalogNavOk ||
  !report.backOk ||
  !report.refreshOk ||
  !report.directAllOk ||
  report.counts.allPrerender !== 468 ||
  report.counts.sitemap !== 468 ||
  report.counts.legacyInSitemap !== 0 ||
  report.counts.legacyInPrerender !== 0 ||
  report.counts.categoryPartnerInSitemap < 5 ||
  report.counts.categoryFamilyInSitemap < 26 ||
  errors.length
) {
  process.exit(1);
}
