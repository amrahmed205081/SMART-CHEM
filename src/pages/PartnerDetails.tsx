import { Link, useParams } from "react-router-dom";
import { partnerById } from "../data/partners";
import { usePageMeta } from "../hooks/usePageMeta";
import { categoryPath, getPartnerFamilies, getPartnerProducts } from "../services/catalog";

export function PartnerDetails() {
  const { id } = useParams();
  const partner = id ? partnerById[id as keyof typeof partnerById] : undefined;
  const families = partner ? getPartnerFamilies(partner.id) : [];
  const total = partner ? getPartnerProducts(partner.id).length : 0;

  usePageMeta(
    partner ? `${partner.name} | Manufacturing Partner | SmartChem` : "Partner | SmartChem",
    partner
      ? `${partner.description} Explore ${partner.name} product families available through SmartChem.`
      : "SmartChem manufacturing partner.",
    {
      path: partner ? `/partners/${partner.id}` : undefined,
      image: partner?.logo,
      keywords: partner ? `${partner.name}, chemical manufacturer, SmartChem partner` : undefined,
      noindex: !partner,
    },
  );

  if (!partner) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-navy">Partner not found</h1>
        <Link to="/partners" className="mt-6 inline-block text-teal">Back to partners</Link>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <section className="page-header">
        <div className="site-container relative z-10 grid items-center gap-6 py-10 md:gap-8 md:py-12 lg:grid-cols-[200px_1fr]">
          <div className={`mx-auto flex h-24 w-full max-w-[200px] items-center justify-center rounded-xl px-4 sm:h-28 ${partner.logoOnDark ? "bg-brand" : "bg-white"}`}>
            <img src={partner.logo} alt={`${partner.name} logo`} className="max-h-14 max-w-[140px] object-contain sm:max-h-16 sm:max-w-[160px]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold">Partner</p>
            <h1 className="mt-2 break-words text-2xl font-bold text-white sm:text-3xl md:text-4xl">{partner.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70 sm:mt-4 sm:text-base">{partner.description}</p>
            <p className="mt-3 text-sm text-white/50 sm:mt-4">{total} products across {families.length} families</p>
          </div>
        </div>
      </section>

      <section className="site-container py-8 md:py-10">
        <h2 className="text-lg font-semibold text-navy sm:text-xl">Product focus</h2>
        <p className="mt-2 text-sm text-navy/70 sm:text-base">{partner.focus}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {partner.applications.map((app) => (
            <span key={app} className="rounded-full bg-white px-3 py-1.5 text-sm text-navy">{app}</span>
          ))}
        </div>
      </section>

      <section className="site-container pb-12 md:pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-xl font-bold text-navy sm:text-2xl">Product families</h2>
          <Link to="/products" className="inline-flex min-h-[44px] items-center text-sm font-semibold text-teal">
            Browse Products →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {families.map((family) => (
            <Link
              key={family.id}
              to={categoryPath(family.categoryId, partner.id, family.id)}
              className="rounded-xl bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-lift sm:p-6"
            >
              <h3 className="text-lg font-semibold text-navy">{family.name}</h3>
              <p className="mt-2 text-sm leading-6 text-navy/65">{family.description}</p>
              <p className="mt-4 text-sm font-semibold text-teal">{family.count} products →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
