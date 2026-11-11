import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import {
  OWNER_COOKIE,
  OWNER_COOKIE_MAX_AGE,
  OWNER_HINT_COOKIE,
  OWNER_HINT_VALUE,
  isOwnerKey,
  sha256Hex,
} from "@/lib/owner";

const handleI18nRouting = createMiddleware(routing);

const OWNER_PARAM = "owner_key";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // D-148 owner activation: `?owner_key=<OWNER_KEY>` on any page sets the
  // hashed owner cookie (plus the readable UI hint, H1-1); `?owner_key=logout`
  // clears both. Either way (including a
  // wrong key) the param is stripped via redirect so the secret does not stay
  // in the address bar / history. Handled before i18n routing, which would
  // otherwise return its own rewrite/redirect.
  const candidate = req.nextUrl.searchParams.get(OWNER_PARAM);
  if (candidate !== null) {
    const clean = req.nextUrl.clone();
    clean.searchParams.delete(OWNER_PARAM);
    const res = NextResponse.redirect(clean);
    if (candidate === "logout") {
      res.cookies.delete(OWNER_COOKIE);
      res.cookies.delete(OWNER_HINT_COOKIE);
    } else if (await isOwnerKey(candidate)) {
      res.cookies.set(OWNER_COOKIE, await sha256Hex(candidate), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: OWNER_COOKIE_MAX_AGE,
      });
      // H1-1: readable UI hint for useOwner() (pages no longer read cookies on the server).
      res.cookies.set(OWNER_HINT_COOKIE, OWNER_HINT_VALUE, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: OWNER_COOKIE_MAX_AGE,
      });
    }
    return res;
  }

  return handleI18nRouting(req);
}

export const config = {
  // Exclude framework internals + static public assets. quiz-figures/ holds the
  // committed WebP exam figures (D-134) served statically — without this the
  // i18n middleware would rewrite /quiz-figures/<id>.webp → /ja/quiz-figures/…
  // (Session 86). The trailing slash anchors it to the real dir so an unrelated
  // path like /quiz-figuresX is still processed (Rule D LOW, Session 86).
  // robots.txt (D-217) is the static public file: without the exclusion the i18n
  // middleware redirected /robots.txt → /ja/robots.txt (a 404 rendered per request).
  // data/ (D-217 H1-2) holds the build-time static JSON files (src/app/data): the i18n middleware
  // would redirect /data/… → /ja/data/… (a 404).
  // Same form as the Next.js matcher docs (no end anchor).
  matcher: "/((?!_next/static|_next/image|favicon.ico|robots.txt|quiz-figures/|data/).*)",
};
