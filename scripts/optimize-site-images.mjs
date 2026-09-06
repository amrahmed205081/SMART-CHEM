import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const siteDir = resolve(root, "public/assets/site");

const jobs = [
  { input: "hero.png", output: "hero.webp", width: 1672, quality: 78 },
  { input: "aboutus.png", output: "aboutus.webp", width: 1200, quality: 78 },
  { input: "pigmentscatigories.png", output: "pigmentscatigories.webp", width: 900, quality: 78 },
  { input: "resins.png", output: "resins.webp", width: 900, quality: 78 },
  { input: "additives.png", output: "additives.webp", width: 900, quality: 78 },
];

mkdirSync(siteDir, { recursive: true });

for (const job of jobs) {
  const input = resolve(siteDir, job.input);
  const output = resolve(siteDir, job.output);
  const info = await sharp(input)
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality })
    .toFile(output);
  console.log(`[images] ${job.output} → ${(info.size / 1024).toFixed(1)} KB`);
}

writeFileSync(
  resolve(root, "public/assets/site/.optimized-readme.txt"),
  "WebP derivatives generated for performance. Original PNGs retained.\n",
);
