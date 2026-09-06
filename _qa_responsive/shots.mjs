import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:5173";
const shots = path.resolve("_qa_responsive/shots");
fs.mkdirSync(shots, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const cases = [
  { w: 320, route: "/", name: "home-320" },
  { w: 375, route: "/", name: "home-375" },
  { w: 430, route: "/", name: "home-430" },
  { w: 768, route: "/", name: "home-768" },
  { w: 1024, route: "/", name: "home-1024" },
  { w: 1440, route: "/", name: "home-1440" },
  { w: 320, route: "/products", name: "products-320" },
  { w: 768, route: "/products/category/pigments/toda/universal", name: "family-768" },
  { w: 390, route: "/contact", name: "contact-390" },
  { w: 1024, route: "/partners", name: "partners-1024" },
  { w: 320, route: "/products/category/pigments/toda/universal", name: "family-320" },
];

for (const c of cases) {
  await page.setViewportSize({ width: c.w, height: 900 });
  await page.goto(BASE + c.route, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(shots, `${c.name}.png`), fullPage: false });
  // footer shot
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(shots, `${c.name}-footer.png`), fullPage: false });
  console.log("shot", c.name);
}

// tablet menu open
await page.setViewportSize({ width: 768, height: 900 });
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.click('header button[aria-label*="Open" i]');
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(shots, "menu-768.png"), fullPage: false });

await browser.close();
console.log("done");
