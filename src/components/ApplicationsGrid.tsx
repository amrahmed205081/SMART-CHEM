import {
  Building2,
  Factory,
  Layers,
  Link as LinkIcon,
  Package,
  Paintbrush,
  Route,
  Sparkles,
  TreePine,
  type LucideIcon,
} from "lucide-react";
import { applications } from "../data/applications";

const icons: Record<string, LucideIcon> = {
  "decorative-paints": Paintbrush,
  "industrial-coatings": Factory,
  "wood-coatings": TreePine,
  construction: Building2,
  adhesives: LinkIcon,
  "road-marking": Route,
  leather: Layers,
  cosmetics: Sparkles,
  plastic: Package,
};

const shortDescriptions: Record<string, string> = {
  "decorative-paints": "Architectural coatings",
  "industrial-coatings": "Protective coatings",
  "wood-coatings": "Wood finishes",
  construction: "Mortars and concrete",
  adhesives: "Industrial adhesives",
  "road-marking": "Traffic marking systems",
  leather: "Leather processing",
  cosmetics: "Formulation applications",
  plastic: "Plastics and polymers",
};

export function ApplicationsGrid() {
  const tiles = applications.slice(0, 9);

  return (
    <div className="relative mx-auto flex w-full max-w-[740px] flex-wrap justify-center gap-2.5 sm:gap-3">
      {tiles.map((app, index) => {
        const Icon = icons[app.id] || Package;
        const description = shortDescriptions[app.id] || app.description;

        return (
          <div
            key={app.id}
            className="applications-chip is-visible"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="applications-chip-icon">
              <Icon size={16} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-semibold leading-tight text-navy sm:text-sm">{app.name}</h3>
              <p className="mt-0.5 truncate text-xs leading-4 text-navy/55">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
