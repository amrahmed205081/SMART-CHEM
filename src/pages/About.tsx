import { Link } from "react-router-dom";
import { PageHero } from "../components/ui/PageHero";
import { company } from "../data/company";
import { partners } from "../data/partners";
import { usePageMeta } from "../hooks/usePageMeta";
import { portfolioStats } from "../data/portfolioStats";

export function About() {
  usePageMeta(
    "About Us | Chemical Supplier & Distributor | SmartChem",
    "Learn about SmartChem, a chemical trading and distribution company supplying pigments, resins, additives and specialty raw materials for industrial formulations.",
    {
      path: "/about",
      keywords: "about SmartChem, chemical distributor, chemical supplier, specialty chemicals",
      image: "/assets/site/aboutus.webp",
    },
  );

  return (
    <div className="page-enter">
      <PageHero
        eyebrow="About SmartChem"
        title="Trusted chemical sourcing for industrial formulations"
        description={company.about}
      />

      <section className="bg-cream">
        <div className="site-container pt-8 md:pt-10">
          <div className="overflow-hidden rounded-xl bg-cream-dark">
            <img
              src="/assets/site/aboutus.webp"
              alt="SmartChem warehouse, laboratory materials and global chemical distribution"
              width={1200}
              height={676}
              className="h-[200px] w-full object-cover object-center sm:h-[300px] md:h-[360px] lg:h-[480px]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="site-container grid grid-cols-1 gap-4 py-10 sm:grid-cols-3 sm:gap-6 md:py-14 md:gap-8">
        {[
          { label: "Catalogued products", value: `${portfolioStats.products}` },
          { label: "Manufacturing partners", value: `${portfolioStats.partners}` },
          { label: "Application areas", value: `${portfolioStats.applications}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-5 shadow-card sm:p-6">
            <p className="text-2xl font-bold text-teal sm:text-3xl">{stat.value}</p>
            <p className="mt-2 text-sm text-navy/65">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="bg-white">
        <div className="site-container grid gap-8 py-10 md:gap-10 md:py-14 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-navy sm:text-3xl">What we do</h2>
            <p className="mt-4 text-sm leading-7 text-navy/70 sm:text-base">{company.intro}</p>
            <ul className="mt-6 space-y-3">
              {company.strengths.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-navy/80">
                  <span className="text-teal">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:gap-5">
            <div className="rounded-xl bg-cream p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal">Vision</p>
              <p className="mt-3 text-base leading-7 text-navy sm:text-lg sm:leading-8">{company.vision}</p>
            </div>
            <div className="rounded-xl bg-cream-dark p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal">Mission</p>
              <p className="mt-3 text-base leading-7 text-navy sm:text-lg sm:leading-8">{company.mission}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-10 md:py-14">
        <h2 className="text-2xl font-bold text-navy sm:text-3xl">Our product portfolio</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-navy/70 sm:text-base">
          The SmartChem range includes pigments, titanium dioxide, resins, additives, biocides, cellulose ethers and redispersible polymer powders — represented here from official partner documentation.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {company.industries.map((item) => (
            <div key={item} className="rounded-xl border border-line bg-white p-4 text-sm text-navy sm:p-5 sm:text-base">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream-dark">
        <div className="site-container py-10 md:py-14">
          <h2 className="text-2xl font-bold text-navy sm:text-3xl">Global partnerships</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {partners.map((p) => (
              <Link
                key={p.id}
                to={`/partners/${p.id}`}
                className={`flex h-24 items-center justify-center rounded-xl px-3 sm:h-28 ${p.logoOnDark ? "bg-brand" : "bg-white"}`}
              >
                <img src={p.logo} alt={`${p.name} logo`} className="max-h-12 max-w-[120px] object-contain sm:max-h-14 sm:max-w-[140px]" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
