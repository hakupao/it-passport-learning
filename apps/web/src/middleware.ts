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
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
