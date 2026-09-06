import { ApplicationCard } from "../components/ApplicationCard";
import { PageHero } from "../components/ui/PageHero";
import { applications } from "../data/applications";
import { usePageMeta } from "../hooks/usePageMeta";

export function Applications() {
  usePageMeta(
    "Applications | Coatings, Construction & Industrial Uses | SmartChem",
    "Explore industries served by SmartChem including decorative paints, industrial coatings, wood coatings, construction, adhesives, leather and cosmetics.",
    {
      path: "/applications",
      keywords: "paint raw materials, industrial coatings, construction chemicals, adhesives chemicals",
    },
  );

  return (
    <div className="page-enter">
      <PageHero
        eyebrow="Industries"
        title="Applications we serve"
        description="Each application maps to the partners and product families documented in the SmartChem portfolio files."
      />
      <section className="site-container py-8 md:py-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      </section>
    </div>
  );
}
