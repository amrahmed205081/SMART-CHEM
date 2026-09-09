import { Link, useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getSource } from "../data/sources";
import { usePageMeta } from "../hooks/usePageMeta";
import {
  categoryPath,
  getCategoryById,
  getPartnerFamilies,
  getPartnerProducts,
  resolveCanonicalPartnerHubPath,
} from "../services/catalog";

export function ProductPartner() {
  const { categoryId, sourceId, partnerId } = useParams();
  const source = getSource(sourceId || partnerId);
  const category = categoryId ? getCategoryById(categoryId) : undefined;
  const families = source ? getPartnerFamilies(source.id, categoryId) : [];
  const total = families.reduce((sum, family) => sum + family.count, 0) || (source ? getPartnerProducts(source.id).length : 0);
  const canonicalHubPath = source
    ? category
      ? categoryPath(category.id, source.id)
      : resolveCanonicalPartnerHubPath(source.id) ?? `/products/partner/${source.id}`
    : undefined;

  usePageMeta(
    source
      ? category
        ? `${source.name} ${category.name} | SmartChem`
        : `${source.name} Products | SmartChem`
      : "Products | SmartChem",
    source
      ? `${source.description} Explore ${source.name} product families available through SmartChem.`
      : "SmartChem product source.",
    {
      path: canonicalHubPath,
      image: source?.logo,
      keywords: source ? `${source.name}, ${category?.name || "chemical products"}, SmartChem` : undefined,
      noindex: !source,
    },
  );

  if (!source) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-navy">Source not found</h1>
        <Link to="/products" className="mt-6 inline-block text-teal">Back to Products</Link>
      </div>
    );
  }

  const backTo = category ? categoryPath(category.id) : "/products";
  const familyTo = (familyId: string) => {
    if (category) return categoryPath(category.id, source.id, familyId);
    const family = families.find((item) => item.id === familyId);
    return family ? categoryPath(family.categoryId, source.id, family.id) : "/products";
  };

  return (
    <div className="page-enter">
      <section className="page-header">
        <div className="relative z-10 site-container py-10 md:py-12">
          <Breadcrumbs
            items={[
              { label: "Products", to: "/products" },
              ...(category ? [{ label: category.name, to: categoryPath(category.id) }] : []),
              { label: source.name },
            ]}
          />
          <div className="mt-8 grid items-center gap-5 sm:gap-8 lg:grid-cols-[180px_1fr]">
            <div className={`mx-auto flex h-28 w-full max-w-[200px] items-center justify-center rounded-xl px-4 sm:h-32 ${source.logoOnDark ? "bg-brand" : "bg-white"}`}>
              <img
                src={source.logo}
                alt={`${source.name} logo`}
                className={
                  source.id === "smartchem-cell"
                    ? "brand-logo max-h-16 max-w-[160px] sm:max-h-[4.5rem] sm:max-w-[180px]"
                    : "max-h-14 max-w-[140px] object-contain sm:max-h-16 sm:max-w-[150px]"
                }
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold">
                {source.id === "smartchem-cell" ? "SmartChem portfolio" : "Partner"}
              </p>
              <h1 className="mt-2 break-words text-2xl font-bold text-white sm:text-3xl md:text-4xl">{source.name}</h1>
              <p className="mt-4 max-w-3xl text-white/70">{source.description}</p>
              <p className="mt-4 text-sm text-white/50">{total} products across {families.length} families</p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-10 md:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-navy">Product families</h2>
            <p className="mt-2 text-sm text-navy/65">Select a family to view only the products from that portfolio.</p>
          </div>
          <Link to={backTo} className="inline-flex min-h-[44px] items-center rounded-md border border-line px-4 py-2 text-sm font-semibold text-navy">
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {families.map((family) => (
            <Link
              key={family.id}
              to={familyTo(family.id)}
              className="group overflow-hidden rounded-card border border-line bg-white shadow-card transition-all duration-300 ease-out hover:-translate-y-[5px] hover:border-teal/35 hover:shadow-lift"
            >
              {source.id === "hyrox" && family.image && (
                <div className="h-40 overflow-hidden bg-brand">
                  <img
                    src={family.image}
                    alt={`${family.name} family`}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-navy">{family.name}</h3>
                <p className="mt-2 text-sm leading-6 text-navy/65">{family.description}</p>
                <p className="mt-4 text-sm font-semibold text-teal">{family.count} products →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
