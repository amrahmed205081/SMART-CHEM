import { preview } from "vite";
import { chromium, devices } from "playwright";

const server = await preview({
  preview: { port: 4183, strictPort: true, host: "127.0.0.1" },
  logLevel: "error",
});
const base = server.resolvedUrls.local[0].replace(/\/$/, "");

async function measure(label, path, mobile = false) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(mobile ? devices["Pixel 7"] : { viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 60000 });

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paints = performance.getEntriesByType("paint");
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    const lcp = lcpEntries.length ? lcpEntries[lcpEntries.length - 1] : null;
    const cls = performance.getEntriesByType("layout-shift").reduce((sum, e) => {
      // @ts-expect-error browser type
      return e.hadRecentInput ? sum : sum + (e.value || 0);
    }, 0);

    return {
      ttfb: nav ? Math.round(nav.responseStart) : null,
      fcp: Math.round(paints.find((p) => p.name === "first-contentful-paint")?.startTime || 0),
      lcp: lcp ? Math.round(lcp.startTime) : null,
      lcpSize: lcp ? Math.round(lcp.size || 0) : null,
      cls: Number(cls.toFixed(3)),
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      load: nav ? Math.round(nav.loadEventEnd) : null,
      transferSize: nav ? Math.round((nav.transferSize || 0) / 1024) : null,
    };
  });

  await browser.close();
  return { label, path, mobile, ...metrics };
}

const results = [];
for (const [label, path] of [
  ["Home", "/"],
  ["Products", "/products"],
  ["ProductDetails", "/products/toda-ur101"],
]) {
  results.push(await measure(`${label} desktop`, path, false));
  results.push(await measure(`${label} mobile`, path, true));
}

console.log(JSON.stringify(results, null, 2));
await server.close();
