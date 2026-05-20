// Composed middleware (Phase 2 Step 12 — D-099 §2.5 LD-2 composition order):
//
//   1. D-097 Basic Auth firewall first: every matched request must present a
//      valid `Authorization: Basic <FIREWALL_BASIC_AUTH>` header. Missing/wrong
//      auth → 401 with WWW-Authenticate. Missing env → 503 fail-closed.
//
//   2. API routes: after firewall passes, fall through (NextResponse.next).
//      next-intl handler is intentionally skipped — APIs are locale-agnostic
//      and live at /api/*, not under [locale].
//
//   3. Page routes: forward to the next-intl handler so the [locale] segment
//      is resolved + unprefixed paths (e.g. /chat) are redirected to /ja/chat.
//
// Matcher excludes _next/static, _next/image, favicon.ico (no auth on static
// build artifacts; same as the D-097 baseline). Everything else — pages AND
// /api/* — is gated by the firewall.

import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const REALM = "IT Passport Learning firewall";

export function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

const handleI18nRouting = createMiddleware(routing);

export function middleware(req: NextRequest): NextResponse {
  // Step 1 — D-097 firewall (unchanged surface; same 401/503 behaviour).
  const expected = process.env.FIREWALL_BASIC_AUTH;
  if (!expected) {
    return new NextResponse("Firewall misconfigured", { status: 503 });
  }
  const auth = req.headers.get("authorization");
  if (!auth || !timingSafeStringEqual(auth, `Basic ${expected}`)) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="${REALM}"`,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  // Step 2 — /api/* routes bypass i18n routing.
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Step 3 — locale-prefix resolution + unprefixed redirect.
  return handleI18nRouting(req);
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
