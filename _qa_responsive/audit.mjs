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
  "/products/category/pigments/toda/universal",
  "/partners",
  "/partners/eagle-chemicals",
  "/applications",
  "/applications/decorative-paints",
  "/contact",
];

const outDir = path.resolve("_qa_responsive");
fs.mkdirSync(outDir, { recursive: true });

const issues = [];

async function measure(page, route, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(250);

  const data = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
    const clientWidth = doc.clientWidth;

    const overflowing = [];
    document.querySelectorAll("body *").forEach((el) => {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      if (rect.right > clientWidth + 1 || rect.left < -1) {
        const tag = el.tagName.toLowerCase();
        const cls = (el.className && typeof el.className === "string" ? el.className : "").slice(0, 80);
        overflowing.push({
          tag,
          cls,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      }
    });

    const tinyText = [];
    document.querySelectorAll("p, span, a, button, li, h1, h2, h3, label, dt, dd").forEach((el) => {
      const style = getComputedStyle(el);
      const size = parseFloat(style.fontSize);
      const text = (el.textContent || "").trim();
      if (text && size > 0 && size < 11) {
        tinyText.push({ text: text.slice(0, 40), size, cls: (el.className || "").toString().slice(0, 60) });
      }
    });

    const smallButtons = [];
    document.querySelectorAll("a, button").forEach((el) => {
      const style = getComputedStyle(el);
      if (style.display === "none") return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (rect.height < 36 && (el.textContent || "").trim().length > 0) {
        smallButtons.push({
          text: (el.textContent || "").trim().slice(0, 40),
          h: Math.round(rect.height),
          w: Math.round(rect.width),
        });
      }
    });

    const nav = document.querySelector("header");
    const navRect = nav ? nav.getBoundingClientRect() : null;
    const logo = document.querySelector('header img[alt*="SmartChem"]');
    const logoRect = logo ? logo.getBoundingClientRect() : null;

    return {
      scrollWidth,
      clientWidth,
      overflowX: scrollWidth > clientWidth + 1,
      overflowing: overflowing.slice(0, 8),
      tinyText: tinyText.slice(0, 8),
      smallButtons: smallButtons.slice(0, 8),
      navHeight: navRect ? Math.round(navRect.height) : null,
      logoHeight: logoRect ? Math.round(logoRect.height) : null,
      logoWidth: logoRect ? Math.round(logoRect.width) : null,
    };
  });

  if (data.overflowX) {
    issues.push({
      type: "horizontal-scroll",
      route,
      width,
      detail: `scrollWidth=${data.scrollWidth} clientWidth=${data.clientWidth}`,
      elems: data.overflowing,
    });
  }
  if (data.tinyText.length) {
    issues.push({ type: "tiny-text", route, width, detail: data.tinyText });
  }

  // Open mobile menu check on small widths
  if (width < 1024) {
    const toggle = page.locator('header button[aria-label*="menu" i], header button[aria-label*="Open" i]');
    if (await toggle.count()) {
      await toggle.first().click();
      await page.waitForTimeout(350);
      const menuOpen = await page.evaluate(() => {
        const panel = document.querySelector(".mobile-nav-panel");
        const open = panel && panel.classList.contains("is-open");
        const bodyLocked = document.body.classList.contains("nav-open");
        const links = [...document.querySelectorAll(".mobile-nav-panel a")].map((a) => a.textContent.trim());
        return { open, bodyLocked, links, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth };
      });
      if (!menuOpen.open) issues.push({ type: "mobile-menu", route, width, detail: "menu did not open" });
      if (!menuOpen.bodyLocked) issues.push({ type: "mobile-menu", route, width, detail: "body scroll not locked" });
      if (menuOpen.scrollWidth > menuOpen.clientWidth + 1) {
        issues.push({ type: "horizontal-scroll-menu", route, width, detail: menuOpen });
      }
      // close
      const closeBtn = page.locator('header button[aria-label*="Close" i]');
      if (await closeBtn.count()) await closeBtn.first().click();
      else await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }
  }

  return data;
}

const summary = [];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const width of VIEWPORTS) {
  for (const route of ROUTES) {
    try {
      const data = await measure(page, route, width);
      summary.push({ width, route, ok: !data.overflowX, logoH: data.logoHeight, navH: data.navHeight });
      process.stdout.write(`OK ${width} ${route}\n`);
    } catch (e) {
      issues.push({ type: "error", route, width, detail: String(e) });
      process.stdout.write(`ERR ${width} ${route} ${e}\n`);
    }
  }
}

await browser.close();
fs.writeFileSync(path.join(outDir, "issues.json"), JSON.stringify(issues, null, 2));
fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log("\nISSUES:", issues.length);
console.log(JSON.stringify(issues.slice(0, 40), null, 2));
