import { Link, useLocation } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";

export function NotFound() {
  const location = useLocation();
  usePageMeta("Page Not Found | SmartChem", "The requested SmartChem page does not exist.", {
    noindex: true,
    path: location.pathname,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
      <h1 className="text-2xl font-bold text-navy sm:text-3xl md:text-4xl">Page not found</h1>
      <p className="mt-4 text-sm text-navy/65 sm:text-base">
        The page you requested is not part of the SmartChem website.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex min-h-[44px] items-center rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back to Home
      </Link>
    </div>
  );
}
