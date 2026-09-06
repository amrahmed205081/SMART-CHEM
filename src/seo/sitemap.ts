import { categories } from "../data/categories";
import { partners } from "../data/partners";
import { products } from "../data/products";
import { categoryPath, getPartnerFamilies } from "../services/catalog";
import type { PartnerId } from "../types";

/** Collect all public, indexable paths for sitemap generation. */
export function collectSitemapPaths(): string[] {
  const paths = new Set<string>([
    "/",
    "/about",
    "/products",
    "/partners",
    "/applications",
    "/contact",
  ]);

  for (const category of categories) {
    paths.add(categoryPath(category.id));

    if (category.id === "smartchem-cell") {
      for (const family of getPartnerFamilies("smartchem-cell", "smartchem-cell")) {
        paths.add(categoryPath("smartchem-cell", "smartchem-cell", family.id));
      }
      continue;
    }

    for (const partnerId of category.partners) {
      paths.add(categoryPath(category.id, partnerId));
      for (const family of getPartnerFamilies(partnerId as PartnerId, category.id)) {
        paths.add(categoryPath(category.id, partnerId, family.id));
      }
    }
  }

  // Partner corporate pages (not legacy /products/partner/* product hubs)
  for (const partner of partners) {
    paths.add(`/partners/${partner.id}`);
  }

  for (const product of products) {
    paths.add(`/products/${product.id}`);
  }

  return Array.from(paths).sort((a, b) => a.localeCompare(b));
}

export function buildSitemapXml(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const urls = collectSitemapPaths();
  const today = new Date().toISOString().slice(0, 10);

  const body = urls
    .map((path) => {
      const loc = path === "/" ? `${base}/` : `${base}${path}`;
      const priority =
        path === "/"
          ? "1.0"
          : path === "/products" || path === "/about" || path === "/contact"
            ? "0.9"
            : path.startsWith("/products/")
              ? "0.7"
              : "0.8";
      const changefreq = path.startsWith("/products/") && path.split("/").length > 3 ? "monthly" : "weekly";
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

export function buildRobotsTxt(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return `User-agent: *
Allow: /

# Public SmartChem pages, assets, CSS and JavaScript are crawlable.
# Update VITE_SITE_URL before production deployment.

Sitemap: ${base}/sitemap.xml
`;
}
