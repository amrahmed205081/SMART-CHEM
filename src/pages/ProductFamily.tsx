import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { ProductCard } from "../components/ProductCard";
import { getSource } from "../data/sources";
import { usePageMeta } from "../hooks/usePageMeta";
import { categoryPath, getCategoryById, getFamily, getFamilyProducts, resolveCanonicalFamilyPath } from "../services/catalog";

export function ProductFamily() {
  const { categoryId, sourceId, partnerId, familyId } = useParams();
  const source = getSource(sourceId || partnerId);
  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const family = source && familyId ? getFamily(source.id, familyId) : undefined;
  const items = source && family ? getFamilyProducts(source.id, family) : [];
  const [query, setQuery] = useState("");
  const canonicalFamilyPath =
    source && family
      ? category
        ? categoryPath(category.id, source.id, family.id)
        : resolveCanonicalFamilyPath(source.id, family.id) ?? undefined
      : undefined;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((product) =>
      (product.searchText || `${product.name} ${product.code} ${product.description || ""}`)
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  usePageMeta(
    source && family
      ? `${family.name} | ${source.name} | SmartChem`
      : "Product family | SmartChem",
    family
      ? `${family.description} View ${family.name} products from ${source?.name || "SmartChem"}.`
      : "SmartChem product family.",
    {
      path: canonicalFamilyPath,
      image: family?.image,
      keywords:
        source && family
          ? `${family.name}, ${source.name}, chemical raw materials, SmartChem`
          : undefined,
      noindex: !source || !family,
    },
  );

  if (!source || !family) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-navy">Product family not found</h1>
        <Link to="/products" className="mt-6 inline-block text-teal">Back to Products</Link>
      </div>
    );
  }

  const resolvedCategoryId = category?.id || family.categoryId;
  const backTo = category
    ? category.id === "smartchem-cell"
      ? categoryPath(category.id)
      : categoryPath(category.id, source.id)
    : categoryPath(resolvedCategoryId, source.id);

  return (
    <div className="page-enter">
      <section className="page-header">
        <div className="relative z-10 site-container py-10 md:py-12">
          <Breadcrumbs
            items={[
              { label: "Products", to: "/products" },
              ...(category ? [{ label: category.name, to: categoryPath(category.id) }] : []),
              ...(resolvedCategoryId === "smartchem-cell"
                ? []
                : [{ label: source.name, to: categoryPath(resolvedCategoryId, source.id) }]),
              { label: family.name },
            ]}
          />
          <p className="mt-8 text-xs font-semibold tracking-[0.2em] uppercase text-gold">
            {source.id === "smartchem-cell" ? "SmartChem Cell" : source.name}
          </p>
          <h1 className="mt-3 break-words text-2xl font-bold text-white sm:text-3xl md:text-4xl">{family.name}</h1>
          <p className="mt-4 max-w-3xl text-white/70">{family.description}</p>
          <p className="mt-4 text-sm text-white/50">{items.length} products in this family</p>
        </div>
      </section>

      <section className="site-container py-10 md:py-12 lg:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="block w-full max-w-md">
            <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-navy/55">Search products</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Product name or code"
              className="w-full min-h-[44px] rounded-md border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-teal"
            />
          </label>
          <Link to={backTo} className="inline-flex min-h-[44px] items-center rounded-md border border-line px-4 py-2 text-center text-sm font-semibold text-navy">
            Back to Products
          </Link>
        </div>

        <p className="mb-6 text-sm text-navy/60">{visible.length} products</p>

        {visible.length === 0 ? (
          <p className="text-navy/60">No products match this search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
