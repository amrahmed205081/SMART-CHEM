import type { Product } from "../types";
import { productImage } from "../services/catalog";
import { absoluteAssetUrl } from "./site";
import { buildProductSchemaDescription } from "./productSeo";

/** Product schema — kept separate so Home/Layout do not import the product catalog. */
export function productJsonLd(product: Product, partnerName: string) {
  const image = productImage(product);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: buildProductSchemaDescription(product, partnerName),
    sku: product.code,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: partnerName,
    },
    manufacturer: {
      "@type": "Organization",
      name: partnerName,
    },
  };

  if (image) {
    data.image = absoluteAssetUrl(image);
  }

  return data;
}
