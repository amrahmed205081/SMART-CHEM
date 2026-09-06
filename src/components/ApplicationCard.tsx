import {
  Box,
  Factory,
  HardHat,
  Layers,
  Link2,
  Paintbrush,
  Palette,
  Route,
  Sparkles,
  TreePine,
  type LucideIcon,
} from "lucide-react";
import type { Application } from "../types";

const icons: Record<string, LucideIcon> = {
  "decorative-paints": Paintbrush,
  "industrial-coatings": Factory,
  "wood-coatings": TreePine,
  construction: HardHat,
  adhesives: Link2,
  "road-marking": Route,
  leather: Layers,
  cosmetics: Sparkles,
  plastic: Box,
  "other-pigment-applications": Palette,
};

const shortDescriptions: Record<string, string> = {
  "decorative-paints": "Binders, pigments and additives for architectural coatings.",
  "industrial-coatings": "Raw materials for protective and industrial coatings.",
  "wood-coatings": "Resins and additives for high-performance wood finishes.",
  construction: "Chemical materials for mortars, concrete and construction systems.",
  adhesives: "Specialty binders and additives for industrial adhesives.",
  "road-marking": "Materials for durable traffic and road marking systems.",
  leather: "Specialty chemicals for leather processing and finishing.",
  cosmetics: "Selected specialty chemicals for formulation applications.",
  plastic: "Pigments and materials for plastics and polymer applications.",
  "other-pigment-applications": "Pigments for paper, ceramics and related industrial uses.",
};

/** Informational application tile — no navigation. */
export function ApplicationCard({ application }: { application: Application }) {
  const Icon = icons[application.id] || Palette;
  const description = shortDescriptions[application.id] || application.description;

  return (
    <div className="flex h-auto min-h-[100px] items-center gap-3 rounded-lg border border-line bg-white px-3 py-3 shadow-[0_4px_14px_rgba(15,31,45,0.05)] sm:h-[118px] sm:gap-3.5 sm:px-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal/10 text-teal">
        <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-semibold leading-tight text-navy">{application.name}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-navy/60">{description}</p>
      </div>
    </div>
  );
}
