import { CategoryCard } from "../components/CategoryCard";
import { PageHero } from "../components/ui/PageHero";
import { categories } from "../data/categories";
import { usePageMeta } from "../hooks/usePageMeta";

export function Products() {
  usePageMeta(
    "Products | Chemical Raw Materials | SmartChem",
    "Browse SmartChem chemical raw materials by category: pigments, resins, additives and SmartChem Cell specialty products for coatings and industry.",
    {
      path: "/products",
      keywords: "chemical products, pigments, resins, additives, cellulose ethers, SmartChem catalog",
    },
  );

  return (
    <div className="page-enter">
      <PageHero
        eyebrow="Product Portfolio"
        title="Select a product category"
        description="Start with Pigments, Resins, Additives or SmartChem Cell. Each category then shows only the relevant partners or SmartChem-owned products."
      />

      <section className="site-container py-10 md:py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
}
