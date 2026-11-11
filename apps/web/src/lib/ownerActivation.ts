// D-148 / D-217 H3 — owner activation at a Worker path (static pages cannot set an httpOnly cookie,
// and Cloudflare's `run_worker_first` matches paths, not query strings).
//
//   GET /api/owner?key=<OWNER_KEY>&next=/ja/…  → itp_owner (sha256 hex, httpOnly) + itp_owner_hint=1
//   GET /api/owner?key=logout&next=…           → both cleared
//   any other / missing / wrong key            → nothing set
// Every case answers 307 to `next` (safeNextUrl: a same-origin page URL, checked after
// normalisation, else /ja), so the key never stays in the address bar. Cookie attributes are the ones src/middleware.dev.ts sets
// (Secure, SameSite=Lax, Path=/, 1 year; the hint is readable by useOwner(), H1-1).
// `Referrer-Policy: no-referrer` on the redirect: the request to `next` then carries no Referer
// (the referrer would otherwise be the page that sent the key).
//
// Shared by the Worker (worker/index.ts) and `next dev` (app/api/owner/route.dev.ts). The old
// `?owner_key=` on a page is forwarded here by OWNER_LEGACY_REDIRECT_SCRIPT (lib/ownerLegacy.ts).

import {
  OWNER_COOKIE,
  OWNER_COOKIE_MAX_AGE,
  OWNER_HINT_COOKIE,
  OWNER_HINT_VALUE,
  isOwnerKey,
  sha256Hex,
} from "@/lib/owner";

export const OWNER_ACTIVATION_PATH = "/api/owner";
export const DEFAULT_NEXT = "/ja";

const LEGACY_PARAM = "owner_key";

/**
 * The redirect target for `raw` as an absolute URL object on `origin`; `origin` + DEFAULT_NEXT when
 * `raw` is missing or unsafe. Two layers:
 *   1. the raw string must start with a single `/` and carry no backslash or control character
 *      (browsers read `/\x` and `/<tab>/x` as `//x`);
 *   2. the NORMALISED URL (dot segments and `%2e` collapsed by the WHATWG parser, so `/.//evil.com`
 *      becomes pathname `//evil.com`) must keep `origin`, must not have a pathname starting with `//`
 *      and must not point into /api.
 * The caller uses the returned object as is (`.href`) — it is never re-parsed from a string
 * (S154 H3 attempt 1: the path string `//evil.com` re-parsed against the origin left the site).
 * A leftover `owner_key` param is dropped.
 */
export function safeNextUrl(raw: string | null, origin: string): URL {
  const fallback = (): URL => new URL(DEFAULT_NEXT, origin);
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback();
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return fallback();
  let url: URL;
  try {
    url = new URL(raw, origin);
  } catch {
    return fallback();
  }
  if (url.origin !== origin) return fallback();
  if (url.pathname.startsWith("//") || url.pathname.includes("\\")) return fallback();
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return fallback();
  if (url.searchParams.has(LEGACY_PARAM)) url.searchParams.delete(LEGACY_PARAM);
  return url;
}

/** safeNextUrl as a same-origin path (pathname + search + hash) — for display and tests only. */
export function safeNextPath(raw: string | null, origin: string): string {
  const url = safeNextUrl(raw, origin);
  return url.pathname + url.search + url.hash;
}

const ATTRS = `Path=/; Secure; SameSite=Lax`;
const CLEAR = `Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax`;

export async function ownerActivation(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const headers = new Headers({
    Location: safeNextUrl(url.searchParams.get("next"), url.origin).href,
    "Referrer-Policy": "no-referrer",
  });
  if (key === "logout") {
    headers.append("Set-Cookie", `${OWNER_COOKIE}=; ${CLEAR}; HttpOnly`);
    headers.append("Set-Cookie", `${OWNER_HINT_COOKIE}=; ${CLEAR}`);
  } else if (key !== null && (await isOwnerKey(key))) {
    const maxAge = `Max-Age=${OWNER_COOKIE_MAX_AGE}`;
    headers.append("Set-Cookie", `${OWNER_COOKIE}=${await sha256Hex(key)}; ${ATTRS}; ${maxAge}; HttpOnly`);
    headers.append("Set-Cookie", `${OWNER_HINT_COOKIE}=${OWNER_HINT_VALUE}; ${ATTRS}; ${maxAge}`);
  }
  return new Response(null, { status: 307, headers });
}
