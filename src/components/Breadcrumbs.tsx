import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { breadcrumbJsonLd } from "../seo/jsonLd";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const location = useLocation();

  useEffect(() => {
    const withCurrent = items.map((item, index) =>
      index === items.length - 1 && !item.to
        ? { ...item, to: location.pathname }
        : item,
    );
    const id = "smartchem-breadcrumb-jsonld";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(breadcrumbJsonLd(withCurrent));
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [location.pathname, JSON.stringify(items)]);

  return (
    <nav aria-label="Breadcrumb" className="max-w-full text-xs text-white/60 sm:text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex max-w-full items-center gap-2">
            {index > 0 && <span className="shrink-0 text-white/35">/</span>}
            {item.to ? (
              <Link to={item.to} className="break-words hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className="break-words text-white">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
