import { applications } from "../data/applications";
import { categories, categoryById } from "../data/categories";
import { partnerFamilies, type PartnerFamily } from "../data/partnerFamilies";
import { partners } from "../data/partners";
import { products } from "../data/products";
import { getSource } from "../data/sources";
import type { PartnerId, Product } from "../types";

export const catalogStats = {
  products: products.length,
  partners: partners.length,
  applications: applications.length,
  categories: categories.length,
};

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getPartnerProducts(partner: PartnerId) {
  return products.filter((p) => p.partner === partner);
}

export function getCategoryById(categoryId: string) {
  return categoryById[categoryId];
}

export function getCategoryProducts(categoryId: string) {
  const category = categoryById[categoryId];
  if (!category) return [];
  return products.filter((product) => product.category === category.name);
}

export function getCategorySources(categoryId: string) {
  const category = categoryById[categoryId];
  if (!category) return [];
  return category.partners
    .map((id) => getSource(id))
    .filter((source): source is NonNullable<typeof source> => Boolean(source));
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.category === product.category &&
        (p.partner === product.partner || p.family === product.family || p.color === product.color),
    )
    .slice(0, limit);
}

export function productImage(product: Product) {
  if (product.partner === "toda" && product.image) {
    return `/assets/toda/${product.image}.png`;
  }
  if (product.partner === "hyrox") {
    const color = (product.color || "red").toLowerCase();
    const ext = ["black", "red", "yellow"].includes(color) ? "jpg" : "png";
    return `/assets/hyrox/hyrox-${color}.${ext}`;
  }
  return null;
}

export function getProductCategoryId(product: Product) {
  const match = categories.find((category) => category.name === product.category);
  return match?.id;
}

export function filterProducts(filters: {
  query?: string;
  partner?: string;
  category?: string;
  application?: string;
}) {
  const q = filters.query?.trim().toLowerCase() || "";
  const category = filters.category
    ? categories.find((item) => item.id === filters.category || item.name === filters.category)
    : undefined;

  return products.filter((p) => {
    if (filters.partner && filters.partner !== "all" && p.partner !== filters.partner) return false;
    if (category && p.category !== category.name) return false;
    if (
      filters.application &&
      filters.application !== "all" &&
      !(p.applications || []).includes(filters.application) &&
      !(p.portfolios || []).includes(filters.application)
    ) {
      return false;
    }
    if (q && !(p.searchText || `${p.name} ${p.code} ${p.description || ""}`.toLowerCase()).includes(q)) {
      return false;
    }
    return true;
  });
}

export function partnerName(id: PartnerId) {
  return getSource(id)?.name || id;
}

export function getPartnerFamilies(partner: PartnerId, categoryId?: string) {
  return partnerFamilies
    .filter((family) => family.partner === partner && (!categoryId || family.categoryId === categoryId))
    .map((family) => ({
      ...family,
      count: products.filter((product) => product.partner === partner && family.match(product)).length,
    }))
    .filter((family) => family.count > 0);
}

export function getFamily(partner: PartnerId, familyId: string) {
  return partnerFamilies.find((family) => family.partner === partner && family.id === familyId);
}

export function getFamilyProducts(partner: PartnerId, family: PartnerFamily) {
  return products.filter((product) => product.partner === partner && family.match(product));
}

export function getProductFamilies(product: Product) {
  return partnerFamilies.filter((family) => family.partner === product.partner && family.match(product));
}

export function categoryPath(categoryId: string, sourceId?: string, familyId?: string) {
  if (sourceId && familyId) return `/products/category/${categoryId}/${sourceId}/${familyId}`;
  if (sourceId) return `/products/category/${categoryId}/${sourceId}`;
  return `/products/category/${categoryId}`;
}

/** Categories that list this partner in the main product hierarchy. */
export function getPartnerCategoryIds(partner: PartnerId): string[] {
  return categories.filter((category) => category.partners.includes(partner)).map((c) => c.id);
}

/**
 * Canonical category hub for a partner when exactly one category applies.
 * Returns null when the partner spans multiple categories (e.g. Eagle Chemicals).
 */
export function resolveCanonicalPartnerHubPath(partner: PartnerId): string | null {
  const categoryIds = getPartnerCategoryIds(partner);
  if (categoryIds.length !== 1) return null;
  return categoryPath(categoryIds[0], partner);
}

/** Canonical category family path from partner family metadata. */
export function resolveCanonicalFamilyPath(partner: PartnerId, familyId: string): string | null {
  const family = getFamily(partner, familyId);
  if (!family?.categoryId) return null;
  return categoryPath(family.categoryId, partner, family.id);
}

export const uniqueCategories = categories.map((category) => category.name);
export const uniqueApplications = Array.from(
  new Set(products.flatMap((p) => p.applications || [])),
).sort();
