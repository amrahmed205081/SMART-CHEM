import type { Category } from "../types";

export const categories: Category[] = [
  {
    id: "pigments",
    name: "Pigments",
    description:
      "Iron oxide pigments from TODA and HYROX for construction, coatings, plastics and industrial coloration.",
    partners: ["toda", "hyrox"],
  },
  {
    id: "resins",
    name: "Resins",
    description:
      "Eagle Chemicals emulsions, alkyds, acrylics and specialty binders for decorative paints, wood coatings, adhesives, construction and road marking.",
    partners: ["eagle-chemicals"],
  },
  {
    id: "additives",
    name: "Additives",
    description:
      "Rheology modifiers, dispersants, biocides and defoamers from Eagle Chemicals and LAMIRSA.",
    partners: ["eagle-chemicals", "lamirsa"],
  },
  {
    id: "smartchem-cell",
    name: "SmartChem Cell",
    description:
      "SmartChem’s own cellulose ethers and redispersible polymer powders for paints, mortars and dry-mix systems.",
    partners: [],
  },
];

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
