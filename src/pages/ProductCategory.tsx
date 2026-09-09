import { Link, useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { usePageMeta } from "../hooks/usePageMeta";
import {
  categoryPath,
  getCategoryById,
  getCategoryProducts,
  getCategorySources,
  getPartnerFamilies,
} from "../services/catalog";

export function ProductCategory() {
  const { categoryId } = useParams();
  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const sources = categoryId ? getCategorySources(categoryId) : [];
  const families = categoryId === "smartchem-cell" ? getPartnerFamilies("smartchem-cell", "smartchem-cell") : [];
  const count = categoryId ? getCategoryProducts(categoryId).length : 0;

  usePageMeta(
    category ? `${category.name} | Chemical Raw Materials | SmartChem` : "Category | SmartChem",
    category
      ? `${category.description} Browse ${category.name.toLowerCase()} supplied by SmartChem.`
      : "SmartChem product category.",
    {
      path: category ? `/products/category/${category.id}` : undefined,
      keywords: category
        ? `${category.name}, chemical raw materials, SmartChem, ${category.partners.join(", ")}`
        : undefined,
      noindex: !category,
    },
  );

  if (!category) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-navy">Category not found</h1>
        <Link to="/products" className="mt-6 inline-block text-teal">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <section className="page-header">
        <div className="relative z-10 site-container py-10 md:py-12">
          <Breadcrumbs items={[{ label: "Products", to: "/products" }, { label: category.name }]} />
          <p className="mt-8 text-xs font-semibold tracking-[0.2em] uppercase text-gold">Category</p>
          <h1 className="mt-3 break-words text-2xl font-bold text-white sm:text-3xl md:text-4xl">{category.name}</h1>
          <p className="mt-4 max-w-3xl text-white/70">{category.description}</p>
          <p className="mt-4 text-sm text-white/50">{count} products</p>
        </div>
      </section>

      <section className="site-container py-10 md:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-navy">
              {category.id === "smartchem-cell" ? "SmartChem product types" : "Select a source"}
            </h2>
            <p className="mt-2 text-sm text-navy/65">
              {category.id === "smartchem-cell"
                ? "These are SmartChem’s own products, not an external partner range."
                : "Only sources that supply this category are shown."}
            </p>
          </div>
          <Link to="/products" className="inline-flex min-h-[44px] items-center rounded-md border border-line px-4 py-2 text-sm font-semibold text-navy">
            Back to Products
          </Link>
        </div>

        {category.id === "smartchem-cell" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {families.map((family) => (
              <Link
                key={family.id}
                to={categoryPath("smartchem-cell", "smartchem-cell", family.id)}
                className="rounded-xl bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
              >
                <h3 className="text-lg font-semibold text-navy">{family.name}</h3>
                <p className="mt-2 text-sm leading-6 text-navy/65">{family.description}</p>
                <p className="mt-4 text-sm font-semibold text-teal">{family.count} products →</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {sources.map((source) => {
              const sourceFamilies = getPartnerFamilies(source.id, category.id);
              const sourceCount = sourceFamilies.reduce((sum, family) => sum + family.count, 0);
              return (
                <Link
                  key={source.id}
                  to={categoryPath(category.id, source.id)}
                  className="group flex h-full flex-col rounded-xl border border-line bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
                >
                  <div
                    className={`mb-6 flex h-24 items-center justify-center rounded-lg px-3 sm:h-28 ${
                      source.id === "smartchem-cell"
                        ? "bg-transparent"
                        : source.logoOnDark
                          ? "bg-brand"
                          : "bg-cream"
                    }`}
                  >
                    <img
                      src={source.logo}
                      alt={`${source.name} logo`}
                      className={
                        source.id === "smartchem-cell"
                          ? "brand-logo max-h-14 max-w-[220px] sm:max-h-16 sm:max-w-[260px]"
                          : "max-h-16 max-w-[180px] object-contain"
                      }
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-navy">{source.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-navy/65">{source.focus}</p>
                  <p className="mt-4 text-sm text-navy/55">
                    {sourceFamilies.length} families · {sourceCount} products
                  </p>
                  <p className="mt-5 text-sm font-semibold text-teal">View families →</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
