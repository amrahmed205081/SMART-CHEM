import type { Application } from "../types";

export const applications: Application[] = [
  {
    id: "decorative-paints",
    name: "Decorative Paints",
    description:
      "Binders, pigments, additives and cellulose ethers for architectural and decorative coating systems.",
    categories: ["Resins", "Pigments", "Additives", "SmartChem Cell"],
    partners: ["eagle-chemicals", "toda", "hyrox", "lamirsa"],
  },
  {
    id: "industrial-coatings",
    name: "Industrial Coatings",
    description:
      "Pigments and specialty additives for industrial, coil, powder, marine and protective coating applications.",
    categories: ["Pigments", "Additives", "Resins"],
    partners: ["toda", "hyrox", "lamirsa", "eagle-chemicals"],
  },
  {
    id: "wood-coatings",
    name: "Wood Coatings",
    description:
      "Wood coating resins and pigment grades for primers, top coats and industrial wood finishing systems.",
    categories: ["Resins", "Pigments"],
    partners: ["eagle-chemicals", "hyrox"],
  },
  {
    id: "construction",
    name: "Construction",
    description:
      "Cementitious binders, construction-grade pigments, cellulose ethers and redispersible powders for mortars, concrete and protective systems.",
    categories: ["Resins", "Pigments", "Additives", "SmartChem Cell"],
    partners: ["eagle-chemicals", "toda", "hyrox"],
  },
  {
    id: "adhesives",
    name: "Adhesives",
    description:
      "Vinyl acetate emulsions, specialty adhesive binders and defoamers for wood, paper, packaging and industrial adhesives.",
    categories: ["Resins", "Additives", "SmartChem Cell"],
    partners: ["eagle-chemicals", "lamirsa"],
  },
  {
    id: "road-marking",
    name: "Road Marking",
    description:
      "Waterborne binders, thermoplastic acrylics and cold-plastic methacrylic resins for traffic marking systems.",
    categories: ["Resins"],
    partners: ["eagle-chemicals"],
  },
  {
    id: "leather",
    name: "Leather",
    description:
      "Leather biocides and selected pigment grades used in leather and related industrial applications.",
    categories: ["Additives", "Pigments"],
    partners: ["lamirsa", "toda"],
  },
  {
    id: "cosmetics",
    name: "Cosmetics",
    description:
      "Cosmetic biocides and selected cellulose ethers for personal-care and related formulation needs.",
    categories: ["Additives", "SmartChem Cell"],
    partners: ["lamirsa"],
  },
  {
    id: "plastic",
    name: "Plastic",
    description:
      "Iron oxide pigments for plastics, rubber, masterbatch and polymer coloration.",
    categories: ["Pigments"],
    partners: ["toda", "hyrox"],
  },
  {
    id: "other-pigment-applications",
    name: "Other Pigment Applications",
    description:
      "Pigment uses beyond core coatings, including paper, ceramics, fertilizers and related industrial coloration.",
    categories: ["Pigments"],
    partners: ["toda", "hyrox"],
  },
];
