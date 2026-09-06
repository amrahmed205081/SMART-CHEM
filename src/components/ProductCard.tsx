import { Link } from "react-router-dom";
import { getSource } from "../data/sources";
import { productImage } from "../services/catalog";
import { buildProductImageAlt, productPath } from "../seo/productSeo";
import type { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  const image = productImage(product);
  const source = getSource(product.partner);
  const manufacturer = source?.shortName || source?.name || "SmartChem";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all duration-300 ease-out hover:-translate-y-[5px] hover:border-teal/35 hover:shadow-lift">
      <div className="h-1 w-full bg-gradient-to-r from-brand via-teal to-gold opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

      {image ? (
        <div className="relative h-36 overflow-hidden bg-brand-light">
          <img
            src={image}
            alt={buildProductImageAlt(product, manufacturer)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="bg-brand-light/70 px-5 pt-4">
          <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase text-brand">
            {product.category}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {!image && (
          <p className="mb-2 text-xs font-medium text-ink-muted">
            {product.family || product.group || product.partner}
          </p>
        )}
        <p className="text-xs font-semibold tracking-[0.16em] uppercase text-teal">{source?.shortName}</p>
        <h3 className="mt-2 break-words text-base font-semibold leading-snug text-navy sm:text-lg">{product.name}</h3>
        <p className="mt-1 break-all text-sm text-ink-muted">Code: {product.code}</p>
        <p className="mt-1 text-xs font-medium text-ink-muted">
          {product.category}
          {product.family ? ` · ${product.family}` : ""}
        </p>
        {product.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-muted">{product.description}</p>
        )}
        {!!product.applications?.length && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.applications.slice(0, 3).map((app) => (
              <span key={app} className="rounded-full bg-brand-light px-2.5 py-1 text-[11px] text-brand">
                {app}
              </span>
            ))}
          </div>
        )}
        <Link
          to={productPath(product)}
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-teal transition-colors group-hover:text-brand"
        >
          View Details <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
