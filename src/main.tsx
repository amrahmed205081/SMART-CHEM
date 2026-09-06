import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("SmartChem root element #root was not found.");
}

/**
 * Playwright prerender writes browser-serialized HTML into #root.
 * That markup is excellent for crawlers/LCP, but it is not React SSR output,
 * so hydrateRoot would warn on attribute/class differences from client-only UI.
 * createRoot mounts the SPA cleanly; the prerendered HTML remains in the
 * initial HTTP response for SEO until JavaScript takes over.
 */
createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
