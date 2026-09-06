import { categories } from "../data/categories";
import { partners } from "../data/partners";
import { products } from "../data/products";
import { categoryPath, getPartnerFamilies } from "../services/catalog";
import { productPath } from "./productSeo";
import type { PartnerId } from "../types";

/** All catalog partners included for full product detail prerender. */
export const PRERENDER_PRODUCT_PARTNERS = [
  "toda",
  "hyrox",
  "smartchem-cell",
  "lamirsa",
  "eagle-chemicals",
] as const satisfies readonly PartnerId[];

export function collectPrerenderProductRoutes(): string[] {
  const allowed = new Set<string>(PRERENDER_PRODUCT_PARTNERS);
  return products
    .filter((product) => allowed.has(product.partner))
    .map((product) => productPath(product))
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Category → partner hubs and category → partner → family pages.
 * Uses the main /products/category/... hierarchy only (no legacy /products/partner/...).
 */
export function collectPrerenderCatalogHubRoutes(): string[] {
  const paths = new Set<string>();

  for (const category of categories) {
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

  return Array.from(paths).sort((a, b) => a.localeCompare(b));
}

/**
 * Routes included in the current static prerender pass.
 * Core + categories + partners + catalog hubs + products.
 * Application detail pages and legacy /products/partner/* are excluded.
 */
export function collectPrerenderRoutes(): string[] {
  const paths = new Set<string>([
    "/",
    "/about",
    "/products",
    "/applications",
    "/partners",
    "/contact",
  ]);

  for (const category of categories) {
    paths.add(categoryPath(category.id));
  }

  for (const partner of partners) {
    paths.add(`/partners/${partner.id}`);
  }

  for (const route of collectPrerenderCatalogHubRoutes()) {
    paths.add(route);
  }

  for (const route of collectPrerenderProductRoutes()) {
    paths.add(route);
  }

  return Array.from(paths).sort((a, b) => {
    // Prerender `/` last so the SPA shell stays available as fallback while other routes render.
    if (a === "/") return 1;
    if (b === "/") return -1;
    return a.localeCompare(b);
  });
}
