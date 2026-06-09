import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export function middleware(req: NextRequest): NextResponse {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
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
