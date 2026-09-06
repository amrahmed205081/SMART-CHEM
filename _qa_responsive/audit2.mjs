import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:5173";
const VIEWPORTS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const ROUTES = [
  "/",
  "/about",
  "/products",
  "/products/category/pigments",
  "/products/category/pigments/toda",
  "/products/category/pigments/toda/universal-grade",
  "/products/category/pigments/hyrox/red",
  "/partners",
  "/partners/eagle-chemicals",
  "/applications",
  "/applications/decorative-paints",
  "/contact",
];

const issues = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const width of VIEWPORTS) {
  for (const route of ROUTES) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(150);
    const data = await page.evaluate(() => {
      const clientWidth = document.documentElement.clientWidth;
      const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
      const tiny = [];
      document.querySelectorAll("p, span, a, button, li, h1, h2, h3, label").forEach((el) => {
        const size = parseFloat(getComputedStyle(el).fontSize);
        const text = (el.textContent || "").trim();
        if (text && size > 0 && size < 11) tiny.push({ text: text.slice(0, 40), size });
      });
      const title = document.querySelector("h1")?.textContent?.trim() || "";
      return { overflowX: scrollWidth > clientWidth + 1, scrollWidth, clientWidth, tiny: tiny.slice(0, 5), title };
    });
    if (data.overflowX) issues.push({ type: "overflow", width, route, data });
    if (data.tiny.length) issues.push({ type: "tiny", width, route, data: data.tiny });
    if (/not found/i.test(data.title)) issues.push({ type: "not-found", width, route, title: data.title });
  }
  process.stdout.write(`done ${width}\n`);
}

await browser.close();
fs.writeFileSync(path.resolve("_qa_responsive/issues2.json"), JSON.stringify(issues, null, 2));
console.log("ISSUES", issues.length);
console.log(JSON.stringify(issues, null, 2));
