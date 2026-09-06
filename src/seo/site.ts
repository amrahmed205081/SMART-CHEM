/** Central site SEO configuration. Set VITE_SITE_URL for production builds. */
export const SITE_NAME = "SmartChem";
export const SITE_TAGLINE = "Smart Chemical Solutions";
export const SITE_DEFAULT_DESCRIPTION =
  "SmartChem supplies high-quality chemical raw materials for coatings, paints, pigments, adhesives, resins and industrial applications.";
export const SITE_DEFAULT_OG_IMAGE = "/assets/site/hero.webp";
export const SITE_DEFAULT_KEYWORDS =
  "SmartChem, chemical raw materials, coatings, paints, pigments, adhesives, resins, industrial chemicals, chemical supplier, specialty additives";

/** Placeholder used only when VITE_SITE_URL is not configured. Replace before production. */
export const SITE_URL_PLACEHOLDER = "https://YOUR-PRODUCTION-DOMAIN";

export function getConfiguredSiteUrl(): string {
  const viteEnv =
    typeof import.meta !== "undefined"
      ? (import.meta as ImportMeta & { env?: { VITE_SITE_URL?: string } }).env?.VITE_SITE_URL
      : undefined;
  const fromEnv = (viteEnv || "").trim().replace(/\/$/, "");
  return fromEnv;
}

function isLocalOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(origin);
}

export function getSiteUrl(): string {
  const configured = getConfiguredSiteUrl();
  if (configured) return configured;

  // Never bake localhost into canonical/OG URLs during preview or prerender.
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, "");
    if (origin && !isLocalOrigin(origin)) return origin;
  }

  return SITE_URL_PLACEHOLDER;
}

export function absoluteUrl(path = "/"): string {
  const normalized = !path || path === "/" ? "/" : path.startsWith("/") ? path.replace(/\/$/, "") : `/${path.replace(/\/$/, "")}`;
  return `${getSiteUrl()}${normalized === "/" ? "/" : normalized}`;
}

export function absoluteAssetUrl(assetPath: string): string {
  if (!assetPath) return absoluteUrl(SITE_DEFAULT_OG_IMAGE);
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const path = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${getSiteUrl()}${path}`;
}
