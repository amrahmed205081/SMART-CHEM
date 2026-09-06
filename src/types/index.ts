export type PartnerId =
  | "eagle-chemicals"
  | "toda"
  | "hyrox"
  | "lamirsa"
  | "smartchem-cell";

export interface Product {
  id: string;
  name: string;
  code: string;
  partner: PartnerId;
  category: string;
  family?: string;
  group?: string;
  description?: string;
  applications?: string[];
  technicalData?: Record<string, string>;
  image?: string;
  color?: string;
  portfolios?: string[];
  searchText?: string;
}

export interface Partner {
  id: PartnerId;
  name: string;
  shortName: string;
  logo: string;
  logoOnDark?: boolean;
  focus: string;
  description: string;
  applications: string[];
  categories: string[];
}

export interface Application {
  id: string;
  name: string;
  description: string;
  categories: string[];
  partners: PartnerId[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  partners: PartnerId[];
}
