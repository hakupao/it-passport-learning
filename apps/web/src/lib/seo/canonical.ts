// D-217 H1-5 — canonical URL + hreflang alternates for every page (the static site has one host:
// https://itlearn.bojiangz.com). `path` is the locale-less path ("" for the today page, "/practice",
// "/practice/q/<id>" …); each page's generateMetadata passes its own, since the layout cannot know it.
import type { Metadata } from "next";

import { routing } from "@/i18n/routing";

export { SITE_ORIGIN } from "./site";

export function pageAlternates(locale: string, path: string): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = `/${l}${path}`;
  languages["x-default"] = `/${routing.defaultLocale}${path}`;
  return { canonical: `/${locale}${path}`, languages };
}
