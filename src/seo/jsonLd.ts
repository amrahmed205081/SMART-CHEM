import { company } from "../data/company";
import {
  absoluteAssetUrl,
  absoluteUrl,
  getSiteUrl,
  SITE_DEFAULT_DESCRIPTION,
  SITE_NAME,
} from "./site";
import type { Crumb } from "../components/Breadcrumbs";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: SITE_NAME,
    description: company.intro || SITE_DEFAULT_DESCRIPTION,
    url: getSiteUrl(),
    logo: absoluteAssetUrl("/assets/logo/smartchem.webp"),
    email: company.email,
    telephone: company.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "4 Ismail Ghanem Street, New Nozha",
      addressLocality: "Cairo",
      addressRegion: "El Nozha District",
      addressCountry: "EG",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

export function breadcrumbJsonLd(items: Crumb[]) {
  const list =
    items[0]?.label === "Home" ? items : [{ label: "Home", to: "/" as string | undefined }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((item, index) => {
      const entry: Record<string, unknown> = {
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
      };
      if (item.to) {
        entry.item = absoluteUrl(item.to);
      }
      return entry;
    }),
  };
}
