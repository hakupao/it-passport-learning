import { NextResponse, type NextRequest } from "next/server";

const REALM = "IT Passport Learning firewall";

export function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function middleware(req: NextRequest): NextResponse {
  const expected = process.env.FIREWALL_BASIC_AUTH;
  if (!expected) {
    return new NextResponse("Firewall misconfigured", { status: 503 });
  }
  const auth = req.headers.get("authorization");
  if (auth && timingSafeStringEqual(auth, `Basic ${expected}`)) {
    return NextResponse.next();
  }
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}"`,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
