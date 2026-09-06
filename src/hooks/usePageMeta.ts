import { useEffect } from "react";
import type { SeoInput } from "../seo/useSeo";
import { useSeo } from "../seo/useSeo";

/** @deprecated Prefer importing useSeo from ../seo/useSeo — kept for compatibility. */
export function usePageMeta(
  title: string,
  description: string,
  extras?: Omit<SeoInput, "title" | "description">,
) {
  useSeo({ title, description, ...extras });
}

/** Ensures document language is set. */
export function useDocumentLang(lang = "en") {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}
