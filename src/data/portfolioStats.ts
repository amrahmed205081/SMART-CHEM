import { applications } from "./applications";
import { partners } from "./partners";

/**
 * Lightweight portfolio counts for Home/About.
 * Avoid importing the full products catalog into the initial bundle.
 * PRODUCT_COUNT is verified against products.length during seo:generate.
 */
export const PRODUCT_COUNT = 423;

export const portfolioStats = {
  products: PRODUCT_COUNT,
  partners: partners.length,
  applications: applications.length,
} as const;
