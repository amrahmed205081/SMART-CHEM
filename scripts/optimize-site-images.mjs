import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const siteDir = resolve(root, "public/assets/site");
const logoDir = resolve(root, "public/assets/logo");

const siteJobs = [
  { input: "hero.png", output: "hero-640.webp", width: 640, quality: 78 },
  { input: "hero.png", output: "hero-860.webp", width: 860, quality: 78 },
  { input: "hero.png", output: "hero-1200.webp", width: 1200, quality: 78 },
  // Canonical full-size hero (OG / SEO / 1672w srcset candidate)
  { input: "hero.png", output: "hero.webp", width: 1672, quality: 78 },
  { input: "aboutus.png", output: "aboutus.webp", width: 1200, quality: 78 },
  { input: "pigmentscatigories.png", output: "pigmentscatigories.webp", width: 900, quality: 78 },
  { input: "resins.png", output: "resins.webp", width: 900, quality: 78 },
  { input: "additives.png", output: "additives.webp", width: 900, quality: 78 },
];

mkdirSync(siteDir, { recursive: true });
mkdirSync(logoDir, { recursive: true });

for (const job of siteJobs) {
  const input = resolve(siteDir, job.input);
  const output = resolve(siteDir, job.output);
  const info = await sharp(input)
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality })
    .toFile(output);
  console.log(`[images] ${job.output} → ${(info.size / 1024).toFixed(1)} KB`);
}

// Nav/footer display ~48–64px tall / max ~320px CSS wide → ~480–640px @2x.
// Preserve transparency and aspect ratio from the source PNG wordmark.
const logoInput = resolve(logoDir, "smartchem.png");
const logoOutput = resolve(logoDir, "smartchem-mark.webp");
const logoInfo = await sharp(logoInput)
  .resize({ width: 480, withoutEnlargement: true })
  .webp({ quality: 82, alphaQuality: 100 })
  .toFile(logoOutput);
console.log(`[images] smartchem-mark.webp → ${(logoInfo.size / 1024).toFixed(1)} KB`);

writeFileSync(
  resolve(siteDir, ".optimized-readme.txt"),
  [
    "WebP derivatives generated for performance. Original PNGs retained.",
    "Hero responsive set: hero-640.webp, hero-860.webp, hero-1200.webp, hero.webp (1672w).",
    "Logo mark for nav/footer: /assets/logo/smartchem-mark.webp (transparent WebP).",
    "",
  ].join("\n"),
);
