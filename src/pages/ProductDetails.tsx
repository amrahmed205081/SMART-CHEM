import { Link, useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ProductCard } from "../components/ProductCard";
import { getSource } from "../data/sources";
import { usePageMeta } from "../hooks/usePageMeta";
import {
  categoryPath,
  getProductById,
  getProductCategoryId,
  getProductFamilies,
  getRelatedProducts,
  productImage,
} from "../services/catalog";
import { productJsonLd } from "../seo/productJsonLd";
import {
  buildProductImageAlt,
  buildProductSeoDescription,
  buildProductSeoTitle,
  productPath,
} from "../seo/productSeo";

export function ProductDetails() {
  const { id } = useParams();
  const product = id ? getProductById(id) : undefined;
  const partner = product ? getSource(product.partner) : undefined;
  const image = product ? productImage(product) : null;
  const related = product ? getRelatedProducts(product) : [];

  usePageMeta(
    product && partner
      ? buildProductSeoTitle(product, partner.name)
      : "Product | SmartChem",
    product && partner
      ? buildProductSeoDescription(product, partner.name)
      : "SmartChem product technical information.",
    {
      path: product ? productPath(product) : undefined,
      image: product ? productImage(product) : undefined,
      type: "product",
      keywords: product && partner
        ? [product.name, product.code, product.category, partner.name, "SmartChem"]
            .filter(Boolean)
            .join(", ")
        : undefined,
      noindex: !product || !partner,
      jsonLd:
        product && partner
          ? productJsonLd(product, partner.name)
          : undefined,
    },
  );

  if (!product || !partner) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-navy">Product not found</h1>
        <Link to="/products" className="mt-6 inline-block text-teal">Back to products</Link>
      </div>
    );
  }

  const tech = Object.entries(product.technicalData || {});
  const families = getProductFamilies(product);
  const primaryFamily = families[0];
  const categoryId = getProductCategoryId(product);

  return (
    <div className="page-enter">
      <section className="page-header">
        <div className="relative z-10 site-container py-10 md:py-12">
          <Breadcrumbs
            items={[
              { label: "Products", to: "/products" },
              ...(categoryId ? [{ label: product.category, to: categoryPath(categoryId) }] : []),
              ...(categoryId && partner.id !== "smartchem-cell"
                ? [{ label: partner.name, to: categoryPath(categoryId, partner.id) }]
                : []),
              ...(primaryFamily && categoryId
                ? [{ label: primaryFamily.name, to: categoryPath(categoryId, partner.id, primaryFamily.id) }]
                : []),
              { label: product.name },
            ]}
          />
          <p className="mt-8 text-xs font-semibold tracking-[0.2em] uppercase text-gold">
            {partner.id === "smartchem-cell" ? "SmartChem Cell" : partner.name}
          </p>
          <h1 className="mt-3 max-w-4xl break-words text-2xl font-bold text-white sm:text-3xl md:text-4xl">{product.name}</h1>
          <p className="mt-3 break-all text-sm text-white/65 sm:text-base">Product code: {product.code}</p>
        </div>
      </section>

      <section className="site-container grid gap-8 py-10 md:gap-10 md:py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0 overflow-hidden rounded-xl bg-white shadow-card">
          {image ? (
            <img
              src={image}
              alt={buildProductImageAlt(product, partner.shortName || partner.name)}
              className="h-56 w-full object-cover sm:h-72 md:h-80"
            />
          ) : (
            <div className="flex h-56 items-end bg-gradient-to-br from-brand to-teal-deep p-5 sm:h-72 sm:p-8 md:h-80">
              <div className="min-w-0">
                <p className="text-sm text-gold">{product.category}</p>
                <p className="mt-2 break-words text-xl font-semibold text-white sm:text-2xl">{product.family || product.group}</p>
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-cream-dark px-3 py-1 text-xs text-navy">{product.category}</span>
            {product.family && <span className="rounded-full bg-cream px-3 py-1 text-xs text-navy">{product.family}</span>}
            {product.group && <span className="rounded-full bg-white px-3 py-1 text-xs text-navy">{product.group}</span>}
          </div>
          {product.description && <p className="mt-6 text-base leading-8 text-navy/75">{product.description}</p>}
          {!!product.applications?.length && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-teal">Applications</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.applications.map((app) => (
                  <span key={app} className="rounded-md bg-white px-3 py-1.5 text-sm text-navy">{app}</span>
                ))}
              </div>
            </div>
          )}
          {families.length > 1 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-teal">Also listed in</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {families.map((family) => (
                  <Link
                    key={family.id}
                    to={
                      categoryId
                        ? categoryPath(categoryId, partner.id, family.id)
                        : family.categoryId
                          ? categoryPath(family.categoryId, partner.id, family.id)
                          : "/products"
                    }
                    className="rounded-md bg-cream px-3 py-1.5 text-sm text-navy"
                  >
                    {family.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/contact" className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-white">
              Request this product
            </Link>
            <Link to="/products" className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-navy">
              Back to Products
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="site-container py-10 md:py-14">
          <h2 className="text-xl font-bold text-navy sm:text-2xl">Technical information</h2>
          {tech.length === 0 ? (
            <p className="mt-4 text-sm text-navy/60">No additional technical values were provided for this listing.</p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-line">
              <dl className="min-w-0 divide-y divide-navy/10">
                {tech.map(([key, value]) => (
                  <div key={key} className="grid gap-2 px-4 py-4 sm:px-5 md:grid-cols-[minmax(140px,220px)_1fr]">
                    <dt className="break-words text-sm font-semibold text-navy">{key}</dt>
                    <dd className="break-words text-sm leading-6 text-navy/70">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="site-container py-10 md:py-14">
          <h2 className="mb-6 text-xl font-bold text-navy sm:text-2xl">Related products</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      <p className="site-container pb-12 text-sm text-navy/50 md:pb-16">
        {partner.id === "smartchem-cell" ? "SmartChem Cell portfolio" : `Partner: ${partner.name}`}
      </p>
    </div>
  );
}
