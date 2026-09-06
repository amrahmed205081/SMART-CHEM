import { SITE_NAME } from "./site";
import type { Product } from "../types";

const TITLE_SOFT_MAX = 70;

function clean(value: string | undefined | null): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

function isSameNameAndCode(product: Product): boolean {
  return clean(product.name).toLowerCase() === clean(product.code).toLowerCase();
}

/**
 * Dynamic product SEO title.
 * Prefer Name | Code | SmartChem when they differ;
 * otherwise Name | Manufacturer | SmartChem.
 * Shorten safely when the title is excessively long — never mid-token.
 */
export function buildProductSeoTitle(product: Product, manufacturerName: string): string {
  const name = clean(product.name);
  const code = clean(product.code);
  const manufacturer = clean(manufacturerName) || SITE_NAME;
  const brand = SITE_NAME;

  if (!name) return `${brand} Product`;

  const candidates: string[] = [];

  if (code && !isSameNameAndCode(product)) {
    candidates.push(`${name} | ${code} | ${brand}`);
  }

  candidates.push(`${name} | ${manufacturer} | ${brand}`);
  candidates.push(`${name} | ${brand}`);

  // Prefer the first candidate within the soft max; otherwise the shortest complete option.
  const withinLimit = candidates.find((title) => title.length <= TITLE_SOFT_MAX);
  if (withinLimit) return withinLimit;

  return candidates.reduce((best, title) => (title.length < best.length ? title : best));
}

function formatApplications(product: Product): string | null {
  const apps = (product.applications || []).map(clean).filter(Boolean);
  if (!apps.length) return null;

  const category = clean(product.category).toLowerCase();
  const filtered = apps.filter((app) => app.toLowerCase() !== category);
  const list = (filtered.length ? filtered : apps).slice(0, 3);

  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list[0]}, ${list[1]}, and ${list[2]}`;
}

function trimMeta(text: string, max = 160): string {
  const normalized = clean(text);
  if (normalized.length <= max) return normalized;

  const slice = normalized.slice(0, max);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("; "), slice.lastIndexOf(", "));
  if (lastStop >= 100) return slice.slice(0, lastStop).trim();

  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim();
}

/**
 * Unique-leaning product meta description from existing catalog fields only.
 * Does not dump shared long descriptions as the sole meta text.
 */
export function buildProductSeoDescription(product: Product, manufacturerName: string): string {
  const name = clean(product.name);
  const code = clean(product.code);
  const manufacturer = clean(manufacturerName) || SITE_NAME;
  const category = clean(product.category);
  const family = clean(product.family);
  const apps = formatApplications(product);

  let description = `${name} by ${manufacturer}, supplied by ${SITE_NAME}`;

  if (apps) {
    description += ` for ${apps}`;
  } else if (category) {
    description += ` for ${category} applications`;
  }

  description += ".";

  // Differentiate products that share marketing copy using real identifiers.
  const extras: string[] = [];
  if (code && !isSameNameAndCode(product)) extras.push(`Code ${code}`);
  if (family) extras.push(family);
  if (category && !description.toLowerCase().includes(category.toLowerCase())) extras.push(category);

  if (extras.length) {
    description = `${description.slice(0, -1)} (${extras.slice(0, 2).join(", ")}).`;
  }

  // Optionally reinforce with a short unique snippet from the real description
  // only when it adds name/code specificity and stays concise.
  const raw = clean(product.description);
  if (raw && raw.length >= 40 && raw.length <= 110) {
    const lowered = raw.toLowerCase();
    const nameLower = name.toLowerCase();
    if (lowered.includes(nameLower) || (code && lowered.includes(code.toLowerCase()))) {
      const combined = `${description} ${raw}`;
      return trimMeta(combined, 160);
    }
  }

  return trimMeta(description, 160);
}

/** Schema.org Product description: prefer real catalog text, else SEO metadata fallback. */
export function buildProductSchemaDescription(product: Product, manufacturerName: string): string {
  const raw = clean(product.description);
  if (raw) return raw;
  return buildProductSeoDescription(product, manufacturerName);
}

/** Product image alt: "{Product Name} – {Manufacturer}" */
export function buildProductImageAlt(product: Product, manufacturerName: string): string {
  const name = clean(product.name) || "Product";
  const manufacturer = clean(manufacturerName) || SITE_NAME;
  return `${name} – ${manufacturer}`;
}

export function productPath(product: Product): string {
  return `/products/${product.id}`;
}
