// D-217 H3 — request guards shared by the owner API handlers (lib/learning/syncRoute.ts,
// lib/quiz/feedbackRoute.ts) and the Worker (worker/index.ts), so `next dev` and Cloudflare behave
// the same.

/**
 * CSRF defence in depth (the owner cookie is SameSite=Lax already): a state-changing request (any
 * method but GET) whose `Sec-Fetch-Site` header is present and not `same-origin` is cross-site or
 * same-site-but-other-origin → true (answer 403). A missing header (old browsers, curl, scripts) is
 * let through: the owner cookie check still applies.
 */
export function isCrossSiteWrite(request: Request): boolean {
  if (request.method === "GET") return false;
  const site = request.headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin";
}

/** True iff the Content-Type media type is application/json (parameters such as charset allowed). */
export function isJsonContentType(request: Request): boolean {
  const type = request.headers.get("content-type");
  return type !== null && type.split(";")[0]!.trim().toLowerCase() === "application/json";
}

/**
 * The body as text, or null when it is missing, over `maxBytes` (declared Content-Length or bytes
 * actually read), unreadable, or not UTF-8.
 */
export async function readCappedBody(request: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (declared > maxBytes) return null;
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null; // aborted / errored upload
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}
