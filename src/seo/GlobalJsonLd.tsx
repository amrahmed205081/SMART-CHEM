import { useEffect } from "react";
import { organizationJsonLd, websiteJsonLd } from "../seo/jsonLd";

/** Injects site-wide Organization + WebSite JSON-LD once. */
export function GlobalJsonLd() {
  useEffect(() => {
    const id = "smartchem-global-jsonld";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify([organizationJsonLd(), websiteJsonLd()]);
  }, []);

  return null;
}
