import { partnerById, partners } from "./partners";
import type { Partner, PartnerId } from "../types";

export const cellPortfolio: Partner = {
  id: "smartchem-cell",
  name: "SmartChem Cell",
  shortName: "CELL",
  logo: "/assets/logo/smartchem.webp",
  focus: "SmartChem’s own cellulose ethers and redispersible polymer powders.",
  description:
    "SmartChem Cell is SmartChem’s own product portfolio of selected cellulose ethers and redispersible polymer powders for water-based paints, mortars, putties, tile adhesives and dry-mix systems.",
  applications: ["Decorative Paints", "Construction", "Adhesives", "Industrial Coatings", "Cosmetics"],
  categories: ["SmartChem Cell"],
};

export function getSource(id: string | undefined): Partner | undefined {
  if (!id) return undefined;
  if (id === "smartchem-cell") return cellPortfolio;
  return partnerById[id as Exclude<PartnerId, "smartchem-cell">];
}

export function isExternalPartner(id: string) {
  return partners.some((partner) => partner.id === id);
}
