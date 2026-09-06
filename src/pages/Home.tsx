import { Link } from "react-router-dom";
import { ApplicationsGrid } from "../components/ApplicationsGrid";
import { CategoryCard } from "../components/CategoryCard";
import { ContactForm } from "../components/ContactForm";
import { Hero } from "../components/Hero";
import { SectionHeading } from "../components/ui/SectionHeading";
import { categories } from "../data/categories";
import { company } from "../data/company";
import { partners } from "../data/partners";
import { portfolioStats } from "../data/portfolioStats";
import { usePageMeta } from "../hooks/usePageMeta";

export function Home() {
  usePageMeta(
    "SmartChem | Chemical Raw Materials for Coatings & Industry",
    "SmartChem supplies chemical raw materials for coatings, paints, pigments, adhesives, resins and industrial applications through trusted global partners.",
    {
      path: "/",
      keywords:
        "SmartChem, chemical raw materials, coatings, paints, pigments, adhesives, resins, industrial chemicals, chemical supplier Egypt",
      image: "/assets/site/hero.webp",
    },
  );

  return (
    <div className="page-enter">
      <Hero />

      <section className="bg-cream">
        <div className="site-container grid items-center gap-8 py-12 md:gap-10 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="overflow-hidden rounded-xl bg-cream-dark">
            <img
              src="/assets/site/aboutus.webp"
              alt="SmartChem warehouse, laboratory materials and global chemical distribution"
              width={1200}
              height={676}
              className="h-[220px] w-full object-cover object-center sm:h-[300px] md:h-[360px] lg:h-[460px]"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="min-w-0">
            <SectionHeading
              eyebrow="About Us"
              title="Your Partner in Chemical"
              accent="Solutions"
              description={company.intro}
            />
            <ul className="space-y-3">
              {company.strengths.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-navy/80">
                  <span className="mt-0.5 text-teal">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/about"
              className="mt-7 inline-flex min-h-[44px] items-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cream-muted">
        <div className="site-container py-12 md:py-16 lg:py-20">
          <SectionHeading
            align="center"
            eyebrow="Our Products"
            title="Our Product Categories"
            description="A structured portfolio of pigments, resins, additives and selected specialty chemicals from trusted manufacturing partners."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-cream">
        <div className="applications-section-glow" aria-hidden="true" />
        <div className="site-container-narrow relative py-10 text-center md:py-12">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-teal">Applications</p>
          <h2 className="mt-2 text-2xl font-bold text-navy md:text-3xl">Industries We Serve</h2>
          <p className="mx-auto mt-2 mb-6 max-w-lg text-sm text-navy/65">
            Specialty chemical solutions across diverse industries.
          </p>
          <ApplicationsGrid />
        </div>
      </section>

      <section className="bg-cream-muted">
        <div className="site-container-narrow flex flex-col justify-center py-10 md:py-12 lg:min-h-[320px]">
          <div className="mb-6 text-center md:mb-7">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-teal">Partners</p>
            <h2 className="mt-2 text-xl font-bold text-navy sm:text-2xl md:text-3xl">
              Global Partners, <span className="text-teal">Trusted Quality</span>
            </h2>
          </div>
          <div className="mx-auto grid w-full max-w-4xl grid-cols-2 items-center justify-items-center gap-x-4 gap-y-5 sm:gap-x-8 md:gap-x-10 lg:grid-cols-4 lg:gap-x-12">
            {partners.map((p, index) => (
              <div
                key={p.id}
                className={`partner-logo-item flex h-[64px] w-full max-w-[160px] items-center justify-center rounded-lg px-2 sm:h-[72px] sm:max-w-[180px] sm:px-3 ${
                  p.logoOnDark ? "bg-brand/90" : "bg-white/50"
                }`}
                style={{ animationDelay: `${index * 0.45}s` }}
              >
                <img
                  src={p.logo}
                  alt={`${p.name} logo`}
                  className="max-h-10 max-w-[120px] object-contain transition-all duration-300 ease-out hover:scale-105 hover:brightness-110 hover:drop-shadow-md sm:max-h-12 sm:max-w-[150px]"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-header">
        <div className="site-container relative z-10 grid gap-8 py-12 md:gap-10 md:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
          <div className="min-w-0">
            <SectionHeading
              light
              title="Let's Build Something"
              accent="Together"
              description="Speak with SmartChem about pigments, resins, additives and specialty raw materials for your formulation."
            />
            <div className="space-y-3 break-words text-sm text-white/70 sm:space-y-4">
              <p>{company.phone}</p>
              <p className="break-all">{company.email}</p>
              <p>{company.address}</p>
              <p className="text-white/50">
                Portfolio size represented on this website: {portfolioStats.products} products,{" "}
                {portfolioStats.partners} partners, {portfolioStats.applications} applications.
              </p>
            </div>
          </div>
          <div className="min-w-0 rounded-xl bg-white p-4 sm:p-6 md:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
