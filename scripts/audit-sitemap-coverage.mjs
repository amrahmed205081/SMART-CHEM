import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { createServer } from "vite";

const root = resolve(".");
const distDir = resolve(root, "dist");
const sitemapPath = existsSync(resolve(root, "public/sitemap.xml"))
  ? resolve(root, "public/sitemap.xml")
  : resolve(root, "dist/sitemap.xml");

function classifyPath(path) {
  if (path === "/") return "home";
  if (["/about", "/contact", "/products", "/partners", "/applications"].includes(path)) {
    return `static:${path.slice(1)}`;
  }
  if (/^\/products\/category\/[^/]+$/.test(path)) return "product-category";
  if (/^\/products\/category\/[^/]+\/[^/]+$/.test(path)) return "product-partner-under-category";
  if (/^\/products\/category\/[^/]+\/[^/]+\/[^/]+$/.test(path)) return "product-family-under-category";
  if (/^\/products\/partner\/[^/]+$/.test(path)) return "legacy-product-partner";
  if (/^\/products\/partner\/[^/]+\/[^/]+$/.test(path)) return "legacy-product-family";
  if (/^\/products\/[^/]+$/.test(path)) return "product-detail";
  if (/^\/partners\/[^/]+$/.test(path)) return "partner-detail";
  if (/^\/applications\/[^/]+$/.test(path)) return "application-detail";
  return "other";
}

function collectPrerenderedFiles(dir, base = "") {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "assets" || entry.name === "200.html" || entry.name === "404.html") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectPrerenderedFiles(full, `${base}/${entry.name}`));
    } else if (entry.name === "index.html") {
      const route = base || "/";
      out.push(route);
    }
  }
  return out;
}

const sitemapXml = readFileSync(sitemapPath, "utf8");
const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const paths = locs.map((loc) => {
  try {
    const u = new URL(loc);
    return u.pathname.replace(/\/$/, "") || "/";
  } catch {
    return loc;
  }
});

const groups = {};
for (const p of paths) {
  const g = classifyPath(p);
  groups[g] = (groups[g] || 0) + 1;
}

const hasLocalhost = locs.some((l) => /localhost|127\.0\.0\.1/i.test(l));
const hasQuery = locs.some((l) => l.includes("?"));
const uniqueLocs = new Set(locs);
const uniquePaths = new Set(paths);

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
  optimizeDeps: { disabled: true },
});

try {
  const { collectSitemapPaths } = await vite.ssrLoadModule("/src/seo/sitemap.ts");
  const { collectPrerenderRoutes } = await vite.ssrLoadModule("/src/seo/prerenderRoutes.ts");
  const { products } = await vite.ssrLoadModule("/src/data/products.ts");
  const { categories } = await vite.ssrLoadModule("/src/data/categories.ts");
  const { partners } = await vite.ssrLoadModule("/src/data/partners.ts");
  const { applications } = await vite.ssrLoadModule("/src/data/applications.ts");
  const { partnerFamilies } = await vite.ssrLoadModule("/src/data/partnerFamilies.ts");
  const { categoryPath, getPartnerFamilies } = await vite.ssrLoadModule("/src/services/catalog.ts");
  const { absoluteUrl } = await vite.ssrLoadModule("/src/seo/site.ts");
  const {
    buildProductSeoTitle,
    buildProductSeoDescription,
    productPath,
  } = await vite.ssrLoadModule("/src/seo/productSeo.ts");
  const { getSource } = await vite.ssrLoadModule("/src/data/sources.ts");

  const sitemapFromCode = collectSitemapPaths();
  const prerenderFromCode = collectPrerenderRoutes();
  const prerenderedOnDisk = collectPrerenderedFiles(distDir).map((p) => p.replace(/\\/g, "/"));

  const sitemapSet = new Set(paths);
  const prerenderCodeSet = new Set(prerenderFromCode);
  const prerenderDiskSet = new Set(prerenderedOnDisk);

  const inBoth = [...sitemapSet].filter((p) => prerenderCodeSet.has(p));
  const sitemapNotPrerender = [...sitemapSet].filter((p) => !prerenderCodeSet.has(p));
  const prerenderNotSitemap = [...prerenderCodeSet].filter((p) => !sitemapSet.has(p));

  const missingByType = {};
  for (const p of sitemapNotPrerender) {
    const t = classifyPath(p);
    if (!missingByType[t]) missingByType[t] = [];
    missingByType[t].push(p);
  }

  // Expected route inventory from data (app router capability)
  const expected = new Set([
    "/",
    "/about",
    "/products",
    "/partners",
    "/applications",
    "/contact",
  ]);
  for (const c of categories) expected.add(categoryPath(c.id));
  for (const c of categories) {
    if (c.id === "smartchem-cell") {
      for (const f of getPartnerFamilies("smartchem-cell", "smartchem-cell")) {
        expected.add(categoryPath("smartchem-cell", "smartchem-cell", f.id));
      }
      continue;
    }
    for (const pid of c.partners) {
      expected.add(categoryPath(c.id, pid));
      for (const f of getPartnerFamilies(pid, c.id)) {
        expected.add(categoryPath(c.id, pid, f.id));
      }
    }
  }
  for (const p of partners) {
    expected.add(`/partners/${p.id}`);
  }
  for (const p of products) expected.add(productPath(p));

  const sitemapNotInApp = [...sitemapSet].filter((p) => !expected.has(p));
  const appNotInSitemap = [...expected].filter((p) => !sitemapSet.has(p));

  // SEO uniqueness for products
  const titles = new Map();
  const metas = new Map();
  const canonicals = new Map();
  let redundant = 0;
  for (const product of products) {
    const mfr = getSource(product.partner)?.name || "SmartChem";
    const title = buildProductSeoTitle(product, mfr);
    const meta = buildProductSeoDescription(product, mfr);
    const canon = absoluteUrl(productPath(product));
    titles.set(title, (titles.get(title) || 0) + 1);
    metas.set(meta, (metas.get(meta) || 0) + 1);
    canonicals.set(canon, (canonicals.get(canon) || 0) + 1);
    const parts = title.split(" | ").map((x) => x.trim().toLowerCase());
    if (parts.length >= 3 && parts[0] === parts[1]) redundant += 1;
  }

  // Indexability policy from code (static analysis)
  const indexability = {
    home: { robots: "index,follow", source: "usePageMeta default" },
    staticPages: { robots: "index,follow", source: "usePageMeta default" },
    productCategory: { robots: "index,follow", source: "usePageMeta; noindex only if not found" },
    productPartner: { robots: "index,follow", source: "usePageMeta; noindex only if not found" },
    productFamily: { robots: "index,follow", source: "usePageMeta; noindex only if not found" },
    productDetail: { robots: "index,follow", source: "noindex only when product/partner missing" },
    partnerDetail: { robots: "index,follow", source: "noindex only if partner missing" },
    applicationHub: { robots: "index,follow", source: "usePageMeta on /applications" },
    notFound: { robots: "noindex,nofollow", source: "NotFound.tsx explicit" },
  };

  // Internal linking reachability (static graph from known UI)
  const linkedFromNav = ["/", "/about", "/products", "/applications", "/partners", "/contact"];
  const linkedFromFooterCategories = categories.map((c) => categoryPath(c.id));
  const linkedFromFooterApps = ["/applications"];
  const linkedFromHomeCategories = categories.map((c) => categoryPath(c.id));
  // Partner details linked from Partners page + About; product partners from category pages
  // Families linked from partner pages; products from family pages + cards + related

  const orphanCandidates = sitemapNotPrerender.filter((p) => {
    // legacy partner routes may still be linked from older paths / partner pages
    return classifyPath(p) === "legacy-product-partner" || classifyPath(p) === "legacy-product-family";
  });

  // Sample inspect prerendered HTML for a few types if dist exists
  function sampleHtml(route) {
    const file =
      route === "/"
        ? resolve(distDir, "index.html")
        : resolve(distDir, route.replace(/^\//, ""), "index.html");
    if (!existsSync(file)) return { route, exists: false };
    const html = readFileSync(file, "utf8");
    return {
      route,
      exists: true,
      title: Boolean(html.match(/<title>[^<]+<\/title>/i)),
      description: /name="description"\s+content="[^"]+"/i.test(html),
      canonical: /rel="canonical"\s+href="https?:\/\/[^"]+"/i.test(html),
      localhost: /localhost|127\.0\.0\.1/i.test(html),
      h1: /<h1[\s>]/i.test(html),
      robots: (html.match(/name="robots"\s+content="([^"]*)"/i) || [])[1] || null,
      canonicalHref: (html.match(/rel="canonical"\s+href="([^"]*)"/i) || [])[1] || null,
    };
  }

  const samples = [
    "/",
    "/about",
    "/products",
    "/products/category/pigments",
    "/products/category/pigments/toda",
    "/products/category/pigments/toda/universal-grade",
    "/products/toda-ur101",
    "/partners/eagle-chemicals",
    "/applications",
  ].map(sampleHtml);

  // Family / partner / application counts from data for breakdown verification
  let categoryPartnerCount = 0;
  let categoryFamilyCount = 0;
  for (const c of categories) {
    if (c.id === "smartchem-cell") {
      categoryFamilyCount += getPartnerFamilies("smartchem-cell", "smartchem-cell").length;
      continue;
    }
    categoryPartnerCount += c.partners.length;
    for (const pid of c.partners) {
      categoryFamilyCount += getPartnerFamilies(pid, c.id).length;
    }
  }

  let legacyPartner = partners.length;
  let legacyFamily = 0;
  for (const p of partners) {
    for (const f of partnerFamilies.filter((x) => x.partner === p.id)) {
      if (getPartnerFamilies(p.id).some((item) => item.id === f.id)) legacyFamily += 1;
    }
  }

  const report = {
    sitemapFile: sitemapPath,
    totalSitemapLocs: locs.length,
    uniqueSitemapLocs: uniqueLocs.size,
    uniqueSitemapPaths: uniquePaths.size,
    hasLocalhost,
    hasQuery,
    groupCounts: groups,
    groupSum: Object.values(groups).reduce((a, b) => a + b, 0),
    codeSitemapCount: sitemapFromCode.length,
    prerenderCodeCount: prerenderFromCode.length,
    prerenderDiskCount: prerenderDiskSet.size,
    coverage: {
      sitemapAndPrerender: inBoth.length,
      sitemapNotPrerender: sitemapNotPrerender.length,
      prerenderNotSitemap: prerenderNotSitemap.length,
      prerenderNotSitemapList: prerenderNotSitemap,
    },
    sitemapNotPrerenderByType: Object.fromEntries(
      Object.entries(missingByType).map(([k, v]) => [k, { count: v.length, samples: v.slice(0, 8) }]),
    ),
    dataInventory: {
      products: products.length,
      categories: categories.length,
      partners: partners.length,
      applications: applications.length,
      categoryPartnerPages: categoryPartnerCount,
      categoryFamilyPages: categoryFamilyCount,
      legacyPartnerPages: legacyPartner,
      legacyFamilyPages: legacyFamily,
      partnerDetailPages: partners.length,
      applicationDetailPages: 0,
      applicationsHubPage: 1,
    },
    expectedRouteCount: expected.size,
    sitemapNotInAppData: sitemapNotInApp,
    appNotInSitemapCount: appNotInSitemap.length,
    appNotInSitemapSamples: appNotInSitemap.slice(0, 20),
    productSeo: {
      uniqueTitles: [...titles.keys()].length,
      dupTitles: [...titles.values()].filter((n) => n > 1).length,
      uniqueMetas: [...metas.keys()].length,
      dupMetas: [...metas.values()].filter((n) => n > 1).length,
      uniqueCanonicals: [...canonicals.keys()].length,
      dupCanonicals: [...canonicals.values()].filter((n) => n > 1).length,
      redundantTitles: redundant,
    },
    indexability,
    samples,
    orphanLikely: {
      count: orphanCandidates.length,
      samples: orphanCandidates.slice(0, 15),
      note: "Legacy /products/partner/* routes may duplicate category-based partner/family URLs",
    },
    robotsTxt: readFileSync(resolve(root, "public/robots.txt"), "utf8"),
  };

  console.log(JSON.stringify(report, null, 2));
} finally {
  await vite.close();
}
