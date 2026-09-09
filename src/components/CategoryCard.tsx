import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Category } from "../types";

const images: Record<string, string> = {
  pigments: "/assets/site/pigmentscatigories.webp",
  resins: "/assets/site/resins.webp",
  additives: "/assets/site/additives.webp",
  "smartchem-cell": "/assets/logo/smartchem.webp",
};

const links: Record<string, string> = {
  pigments: "/products/category/pigments",
  resins: "/products/category/resins",
  additives: "/products/category/additives",
  "smartchem-cell": "/products/category/smartchem-cell",
};

export function CategoryCard({ category }: { category: Category }) {
  const image = images[category.id];
  const isLogo = category.id === "smartchem-cell";

  return (
    <Link
      to={links[category.id] || "/products"}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all duration-300 ease-out hover:-translate-y-[5px] hover:border-teal/40 hover:shadow-lift"
    >
      <div className={`relative h-36 overflow-hidden sm:h-44 md:h-48 ${isLogo ? "bg-brand-light" : "bg-brand-muted"}`}>
        <img
          src={image}
          alt={`${category.name} chemical raw materials for coatings and industry`}
          width={900}
          height={507}
          className={
            isLogo
              ? "brand-logo brand-logo-feature"
              : "h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          }
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-navy sm:text-xl">{category.name}</h3>
        <p className="mt-3 flex-1 text-sm leading-6 text-ink-muted">{category.description}</p>
        <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal">
          Explore Products
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}
