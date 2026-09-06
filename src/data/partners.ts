import type { Partner } from "../types";

export const partners: Partner[] = [
  {
    id: "eagle-chemicals",
    name: "Eagle Chemicals",
    shortName: "EAGLE",
    logo: "/assets/partners/eagle-chemicals.webp",
    focus: "Resins, emulsions and specialty additives for coatings, adhesives and construction.",
    description:
      "Eagle Chemicals supplies chemical raw materials for decorative paints, adhesives, construction, road marking, wood coatings and additives — including emulsions, alkyds, acrylics and specialty binders.",
    applications: [
      "Decorative Paints",
      "Adhesives",
      "Construction",
      "Road Marking",
      "Wood Coatings",
      "Additives",
    ],
    categories: ["Resins", "Additives"],
  },
  {
    id: "toda",
    name: "TODA / ZJUP",
    shortName: "TODA",
    logo: "/assets/partners/toda.webp",
    focus: "Iron oxide pigment solutions across construction, coatings and specialty grades.",
    description:
      "TODA United Industrial (Zhejiang) — ZJUP — supplies iron oxide pigments with the complete color range of red, yellow, black, orange, brown and compound green, across universal, construction, paint & coating, micronized and special treatment grades.",
    applications: [
      "Construction",
      "Decorative Paints",
      "Industrial Coatings",
      "Plastic",
      "Leather",
      "Other Pigment Applications",
    ],
    categories: ["Pigments"],
  },
  {
    id: "hyrox",
    name: "HYROX",
    shortName: "HYROX",
    logo: "/assets/partners/hyrox.webp",
    focus: "Iron oxide pigments for construction, coatings, plastics and industrial applications.",
    description:
      "HYROX supplies synthetic iron oxide pigments in red, yellow, black, brown, orange and green, for construction materials, paints and coatings, plastics and other industrial uses.",
    applications: [
      "Construction",
      "Decorative Paints",
      "Industrial Coatings",
      "Wood Coatings",
      "Plastic",
      "Other Pigment Applications",
    ],
    categories: ["Pigments"],
  },
  {
    id: "lamirsa",
    name: "LAMIRSA",
    shortName: "LAMIRSA",
    logo: "/assets/partners/lamirsa.webp",
    logoOnDark: true,
    focus: "Specialty biocides and defoamers for paint, adhesives, leather and cosmetics.",
    description:
      "LAMIRSA provides specialty additives including CONTRAPEN defoamers and MIRECIDE biocides for paints, adhesives, residual water treatment, leather and cosmetics.",
    applications: ["Decorative Paints", "Adhesives", "Leather", "Cosmetics", "Industrial Coatings"],
    categories: ["Additives"],
  },
];

export const partnerById = Object.fromEntries(partners.map((p) => [p.id, p])) as Record<
  Exclude<Partner["id"], "smartchem-cell">,
  Partner
>;
