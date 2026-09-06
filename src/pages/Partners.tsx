import { PartnerCard } from "../components/PartnerCard";
import { partners } from "../data/partners";
import { usePageMeta } from "../hooks/usePageMeta";

export function Partners() {
  usePageMeta(
    "Partners | Global Chemical Manufacturers | SmartChem",
    "SmartChem partners with Eagle Chemicals, TODA / ZJUP, HYROX and LAMIRSA to supply trusted pigments, resins and specialty additives.",
    { path: "/partners", keywords: "Eagle Chemicals, TODA, HYROX, LAMIRSA, chemical partners" },
  );

  return (
    <div className="page-enter">
      <section className="page-header">
        <div className="site-container relative z-10 py-10 md:py-12">
          <p className="mb-2 text-xs font-semibold tracking-[0.22em] uppercase text-gold">
            Global Partners
          </p>
          <h1 className="max-w-3xl text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Trusted manufacturers. Technical portfolios.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Each partner section is built from the official documents and logos supplied in the SmartChem project files.
          </p>
        </div>
      </section>

      <section className="site-container-narrow py-8 md:py-10">
        <div className="mx-auto grid grid-cols-1 items-start gap-4 sm:gap-5 md:grid-cols-2">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </section>
    </div>
  );
}
