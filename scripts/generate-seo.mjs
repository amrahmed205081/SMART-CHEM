import { createServer } from "vite";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const distDir = resolve(root, "dist");

const PLACEHOLDER = "https://YOUR-PRODUCTION-DOMAIN";
const siteUrl = (process.env.VITE_SITE_URL || "").trim().replace(/\/$/, "") || PLACEHOLDER;

if (!process.env.VITE_SITE_URL) {
  console.warn(
    `[seo] VITE_SITE_URL is not set. Writing sitemap/robots with placeholder ${PLACEHOLDER}. Set VITE_SITE_URL before production deploy.`,
  );
}

const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
  optimizeDeps: { disabled: true },
});

try {
  const { buildSitemapXml, buildRobotsTxt, collectSitemapPaths } = await vite.ssrLoadModule("/src/seo/sitemap.ts");
  const { products } = await vite.ssrLoadModule("/src/data/products.ts");
  const { PRODUCT_COUNT } = await vite.ssrLoadModule("/src/data/portfolioStats.ts");

  if (products.length !== PRODUCT_COUNT) {
    throw new Error(
      `[seo] PRODUCT_COUNT (${PRODUCT_COUNT}) does not match products.length (${products.length}). Update src/data/portfolioStats.ts.`,
    );
  }

  const paths = collectSitemapPaths();
  const sitemap = buildSitemapXml(siteUrl);
  const robots = buildRobotsTxt(siteUrl);

  mkdirSync(publicDir, { recursive: true });
  writeFileSync(resolve(publicDir, "sitemap.xml"), sitemap);
  writeFileSync(resolve(publicDir, "robots.txt"), robots);

  if (existsSync(distDir)) {
    writeFileSync(resolve(distDir, "sitemap.xml"), sitemap);
    writeFileSync(resolve(distDir, "robots.txt"), robots);
  }

  console.log(`[seo] Generated sitemap with ${paths.length} URLs → public/sitemap.xml`);
  console.log(`[seo] Generated robots.txt → public/robots.txt`);
} finally {
  await vite.close();
}
