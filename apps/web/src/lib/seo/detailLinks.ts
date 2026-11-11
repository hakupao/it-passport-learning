// D-223 細目 (H2 訂正) — the two detail families (practice/q/<id>, glossary/<termId>) are prerendered
// HTML whose RSC payloads (.txt) are deleted after export. A Next client transition into one would
// fetch the missing .txt (on Cloudflare a non-navigation miss can invoke the H3 Worker and count
// against the free daily requests), so every way in is a plain full-page navigation: <DetailLink>
// (a plain <a>, no prefetch) or detailNavigate (location.assign / replace).

/** Locale-less `/practice/q/<id>` or `/glossary/<termId>` (one segment, no query / fragment). */
const DETAIL_PATH = /^\/(?:practice\/q|glossary)\/[^/?#]+$/;

export function isDetailPath(path: string): boolean {
  return DETAIL_PATH.test(path);
}

/** The locale-prefixed URL of a locale-less app path. */
export function localeHref(locale: string, path: string): string {
  return `/${locale}${path === "/" ? "" : path}`;
}

/** A full-page navigation (never the client router) to a locale-less app path. */
export function detailNavigate(locale: string, path: string, mode: "assign" | "replace" = "assign"): void {
  window.location[mode](localeHref(locale, path));
}
