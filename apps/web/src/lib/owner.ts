// D-148 — owner gate (Session 126).
//
// Single-user site owner identity, shared by the AI routes (D-148: 503 unless
// owner) and the learning-record sync (D-180). (The D-149 quiz feedback was removed, D-229.)
//
//   - env `OWNER_KEY` = the secret. Opening `/api/owner?key=<OWNER_KEY>&next=/ja` once (the Worker,
//     lib/ownerActivation.ts, D-217 H3) — or any page with `?owner_key=<OWNER_KEY>`, forwarded there
//     by lib/ownerLegacy.ts (the middleware under `next dev`) — sets the `itp_owner` cookie.
//   - Cookie value = hex SHA-256 of OWNER_KEY — the plaintext key is never
//     stored client-side.
//   - Fail-closed: OWNER_KEY unset/empty ⇒ nobody is owner.
//
// Edge-safe: uses Web Crypto (`crypto.subtle`) rather than `node:crypto`
// because src/middleware.ts runs on the Edge runtime. No memo of the hash so a
// rotated OWNER_KEY takes effect immediately (and tests can stub the env).

export const OWNER_COOKIE = "itp_owner";

// H1-1 (D-217) — readable UI hint set / cleared next to OWNER_COOKIE by the middleware, so pages need
// no server cookie read (static prerender). Not a secret, not httpOnly: it only gates UI (the learning
// sync attempt) via useOwner(); the API routes still check OWNER_COOKIE, so a
// forged hint only earns 403s.
export const OWNER_HINT_COOKIE = "itp_owner_hint";
export const OWNER_HINT_VALUE = "1";

/** Cookie lifetime: 1 year. */
export const OWNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

/** Expected cookie value (hex SHA-256 of OWNER_KEY), or null when unset. */
export async function ownerCookieValue(): Promise<string | null> {
  const key = process.env.OWNER_KEY;
  if (!key) return null;
  return sha256Hex(key);
}

/** Constant-time string compare (length leak only — both sides are 64 hex chars). */
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True iff `cookieValue` equals the owner hash. False when OWNER_KEY is unset. */
export async function isOwner(
  cookieValue: string | undefined | null,
): Promise<boolean> {
  const expected = await ownerCookieValue();
  if (expected === null || !cookieValue) return false;
  return timingSafeEqualStr(cookieValue, expected);
}

/** True iff the raw OWNER_KEY candidate (from `?owner_key=`) is correct. */
export async function isOwnerKey(candidate: string): Promise<boolean> {
  if (!candidate) return false;
  return isOwner(await sha256Hex(candidate));
}

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return undefined;
}

/** Route-handler helper: plain `Request` (not NextRequest) → parse Cookie header. */
export async function isOwnerRequest(request: Request): Promise<boolean> {
  return isOwner(readCookie(request.headers.get("cookie"), OWNER_COOKIE));
}
