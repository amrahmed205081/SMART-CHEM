import { ContactForm } from "../components/ContactForm";
import { PageHero } from "../components/ui/PageHero";
import { company } from "../data/company";
import { usePageMeta } from "../hooks/usePageMeta";

export function Contact() {
  usePageMeta(
    "Contact Us | Chemical Raw Materials Enquiry | SmartChem",
    "Contact SmartChem in Cairo, Egypt for pigments, resins, additives and specialty chemical raw materials for coatings and industrial applications.",
    {
      path: "/contact",
      keywords: "contact SmartChem, chemical enquiry, chemical supplier Cairo",
    },
  );

  return (
    <div className="page-enter">
      <PageHero
        eyebrow="Contact"
        title="Let's discuss your formulation needs"
        description="Use the company details from SmartChem’s official information document. The form is frontend-only and validates locally."
      />

      <section className="site-container grid gap-8 py-12 md:gap-10 md:py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <div className="rounded-xl bg-white p-5 shadow-card sm:p-6">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-teal">Phone</p>
            <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="mt-2 block break-all text-lg font-semibold text-navy sm:text-xl">
              {company.phone}
            </a>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-card sm:p-6">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-teal">Email</p>
            <a href={`mailto:${company.email}`} className="mt-2 block break-all text-lg font-semibold text-navy sm:text-xl">
              {company.email}
            </a>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-card sm:p-6">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-teal">Location</p>
            <p className="mt-2 text-base leading-7 text-navy sm:text-lg sm:leading-8">{company.address}</p>
            <a href={company.mapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-teal">
              Open in Google Maps →
            </a>
          </div>
        </div>
        <div className="min-w-0 rounded-xl bg-white p-5 shadow-card sm:p-6 md:p-8">
          <h2 className="mb-6 text-xl font-bold text-navy sm:text-2xl">Send a message</h2>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
