import type { Product } from "../types";
import raw from "./products.json";

export const products = raw as unknown as Product[];
