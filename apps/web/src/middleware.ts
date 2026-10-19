import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { OWNER_COOKIE, OWNER_COOKIE_MAX_AGE, isOwnerKey, sha256Hex } from "@/lib/owner";

const handleI18nRouting = createMiddleware(routing);

const OWNER_PARAM = "owner_key";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // D-148 owner activation: `?owner_key=<OWNER_KEY>` on any page sets the
  // hashed owner cookie; `?owner_key=logout` clears it. Either way (including a
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
    } else if (await isOwnerKey(candidate)) {
      res.cookies.set(OWNER_COOKIE, await sha256Hex(candidate), {
        httpOnly: true,
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
  matcher: "/((?!_next/static|_next/image|favicon.ico|quiz-figures/).*)",
};
