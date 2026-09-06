import { createServer } from "vite";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
  optimizeDeps: { disabled: true },
});

try {
  const { products } = await vite.ssrLoadModule("/src/data/products.ts");
  const { getSource } = await vite.ssrLoadModule("/src/data/sources.ts");
  const { productImage } = await vite.ssrLoadModule("/src/services/catalog.ts");
  const { absoluteUrl } = await vite.ssrLoadModule("/src/seo/site.ts");
  const {
    buildProductSeoTitle,
    buildProductSeoDescription,
    productPath,
  } = await vite.ssrLoadModule("/src/seo/productSeo.ts");
  const { productJsonLd } = await vite.ssrLoadModule("/src/seo/productJsonLd.ts");

  const titles = new Map();
  const metas = new Map();
  const ids = new Map();
  const urls = new Map();
  const canonicals = new Map();
  const redundantTitles = [];
  const missingMeta = [];
  const schemaIssues = [];
  let missingImages = 0;
  let titlesOver70 = 0;

  for (const product of products) {
    const partner = getSource(product.partner);
    const manufacturer = partner?.name || "SmartChem";
    const title = buildProductSeoTitle(product, manufacturer);
    const meta = buildProductSeoDescription(product, manufacturer);
    const url = productPath(product);
    const canonical = absoluteUrl(url);

    ids.set(product.id, (ids.get(product.id) || 0) + 1);
    urls.set(url, (urls.get(url) || 0) + 1);
    canonicals.set(canonical, (canonicals.get(canonical) || 0) + 1);
    titles.set(title, (titles.get(title) || []).concat(product.id));
    metas.set(meta, (metas.get(meta) || []).concat(product.id));

    if (title.length > 70) titlesOver70 += 1;

    const parts = title.split(" | ").map((p) => p.trim().toLowerCase());
    if (parts.length >= 3 && parts[0] === parts[1]) {
      redundantTitles.push({ id: product.id, title });
    }

    if (!title || !meta) missingMeta.push(product.id);
    if (!productImage(product)) missingImages += 1;

    const jsonLd = productJsonLd(product, manufacturer);
    for (const key of ["name", "description", "sku", "category", "brand", "manufacturer"]) {
      if (!jsonLd[key]) schemaIssues.push(`${product.id}: missing ${key}`);
    }
    if ("offers" in jsonLd || "aggregateRating" in jsonLd || "review" in jsonLd) {
      schemaIssues.push(`${product.id}: forbidden commerce/review fields`);
    }
    if (jsonLd.image && !productImage(product)) {
      schemaIssues.push(`${product.id}: image without asset`);
    }
    if (product.description?.trim() && String(jsonLd.description).trim() !== product.description.trim()) {
      schemaIssues.push(`${product.id}: schema description mismatch`);
    }
  }

  const dupTitles = [...titles.entries()].filter(([, list]) => list.length > 1);
  const dupMetas = [...metas.entries()].filter(([, list]) => list.length > 1);
  const dupIds = [...ids.entries()].filter(([, n]) => n > 1);
  const dupUrls = [...urls.entries()].filter(([, n]) => n > 1);
  const dupCanonicals = [...canonicals.entries()].filter(([, n]) => n > 1);

  console.log(
    JSON.stringify(
      {
        totalProducts: products.length,
        uniqueIds: ids.size,
        uniqueUrls: urls.size,
        uniqueCanonicals: canonicals.size,
        uniqueTitles: titles.size,
        duplicateTitles: dupTitles.length,
        duplicateTitleSamples: dupTitles.slice(0, 5).map(([title, list]) => ({ title, ids: list })),
        uniqueMetas: metas.size,
        duplicateMetas: dupMetas.length,
        duplicateMetaSamples: dupMetas.slice(0, 5).map(([meta, list]) => ({
          meta: meta.slice(0, 140),
          ids: list,
        })),
        redundantTitles: redundantTitles.length,
        missingSeoMetadata: missingMeta.length,
        missingImages,
        titlesOver70,
        duplicateIds: dupIds,
        duplicateUrls: dupUrls,
        duplicateCanonicals: dupCanonicals,
        schemaIssues: schemaIssues.length,
        schemaIssueSamples: schemaIssues.slice(0, 10),
        formerlyDuplicate: {
          original: products.find((p) => p.id === "eagle-chemicals-wd-eagle-ss4-40-45")?.name,
          updated: products.find((p) => p.id === "eagle-chemicals-wd-eagle-ss4-40-45-special-additives")?.name,
        },
        sampleTitles: {
          eagle: buildProductSeoTitle(
            products.find((p) => p.partner === "eagle-chemicals"),
            "Eagle Chemicals",
          ),
          toda: buildProductSeoTitle(products.find((p) => p.partner === "toda"), "TODA / ZJUP"),
          hyrox: buildProductSeoTitle(products.find((p) => p.partner === "hyrox"), "HYROX"),
        },
        sampleMetas: {
          eagle: buildProductSeoDescription(
            products.find((p) => p.partner === "eagle-chemicals"),
            "Eagle Chemicals",
          ),
          toda: buildProductSeoDescription(products.find((p) => p.partner === "toda"), "TODA / ZJUP"),
        },
      },
      null,
      2,
    ),
  );
} finally {
  await vite.close();
}
