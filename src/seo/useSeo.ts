import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  absoluteAssetUrl,
  absoluteUrl,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_KEYWORDS,
  SITE_DEFAULT_OG_IMAGE,
  SITE_NAME,
} from "./site";

export type SeoInput = {
  title: string;
  description: string;
  /** Path relative to site root, e.g. /products. Defaults to current location. */
  path?: string;
  image?: string | null;
  type?: "website" | "article" | "product";
  keywords?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id: string, data: Record<string, unknown> | Record<string, unknown>[]) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}

/**
 * Page-level SEO: title, description, canonical, Open Graph, Twitter, robots, JSON-LD.
 * Safe for SPA route changes — cleans up page-specific JSON-LD on unmount.
 */
export function useSeo({
  title,
  description,
  path,
  image,
  type = "website",
  keywords,
  noindex = false,
  jsonLd,
}: SeoInput) {
  const location = useLocation();
  const resolvedPath = path ?? (`${location.pathname}${location.search}` || "/");
  const canonical = absoluteUrl(resolvedPath.split("?")[0] || "/");
  const desc = (description || SITE_DEFAULT_DESCRIPTION).slice(0, 320);
  const ogImage = absoluteAssetUrl(image || SITE_DEFAULT_OG_IMAGE);

  const jsonLdKey = JSON.stringify(jsonLd ?? null);

  useEffect(() => {
    document.title = title;
    upsertMeta("name", "description", desc);
    upsertMeta("name", "keywords", keywords || SITE_DEFAULT_KEYWORDS);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertMeta("name", "author", SITE_NAME);
    upsertLink("canonical", canonical);

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:type", type === "product" ? "product" : "website");
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "en_US");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", desc);
    upsertMeta("name", "twitter:image", ogImage);

    if (jsonLd) {
      upsertJsonLd("smartchem-page-jsonld", Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
    } else {
      removeJsonLd("smartchem-page-jsonld");
    }

    // Deterministic signal for Playwright prerender (avoids long fixed delays).
    const win = window as Window & { __PRERENDER_READY__?: boolean; __PRERENDER_PATH__?: string };
    win.__PRERENDER_PATH__ = resolvedPath.split("?")[0] || "/";
    win.__PRERENDER_READY__ = true;

    return () => {
      removeJsonLd("smartchem-page-jsonld");
      if (win.__PRERENDER_PATH__ === (resolvedPath.split("?")[0] || "/")) {
        win.__PRERENDER_READY__ = false;
      }
    };
  }, [title, desc, canonical, ogImage, type, keywords, noindex, jsonLd, jsonLdKey, resolvedPath]);
}

/** Backward-compatible helper used by older pages. */
export function usePageMeta(title: string, description: string, extras?: Omit<SeoInput, "title" | "description">) {
  useSeo({ title, description, ...extras });
}
