// D-217 H3 — the Cloudflare Worker: static assets (out/, the `output: 'export'` build) are served by
// the platform without invoking this code; wrangler.jsonc `assets.run_worker_first: ["/api/*"]` sends
// only /api/* here. The Worker serves the owner-only API:
//
//   /api/learning        GET, PUT  → lib/learning/syncRoute.ts   (D-180 / D-190 learning-record sync)
//   /api/owner           GET       → lib/ownerActivation.ts      (D-148 owner cookie + hint)
//   other /api/*                   → 404 JSON; a known path with another method → 405 + Allow
//   any non-GET with Sec-Fetch-Site present and not same-origin → 403 first (lib/apiGuards.ts)
//
// The handlers are the ones `next dev` runs (app/api/**/route.dev.ts re-export them). They read env
// from process.env (OWNER_KEY; UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN): wrangler.jsonc
// sets `nodejs_compat` with a compatibility date ≥ 2025-04-01, so `process.env` holds the Worker's
// vars and secrets (developers.cloudflare.com/workers/runtime-apis/nodejs/process/). `env` is only
// used for the ASSETS binding.
//
// Every /api response gets the headers out/_headers would have given the path (the CSP of
// lib/export/headers.ts — `_headers` rules do not apply to Worker responses) plus
// `Cache-Control: no-store` and `X-Robots-Tag: noindex`.
//
// A request outside /api/* reaches this code only when it matched no asset and is not a navigation
// (developers.cloudflare.com/workers/static-assets/routing/static-site-generation/: with a Worker,
// non-navigation misses invoke it). It is handed back to the assets, which answer with the
// not_found_handling 404 page.

import { isCrossSiteWrite } from "../src/lib/apiGuards";
import { contentSecurityPolicy } from "../src/lib/export/headers";
import { GET as learningGet, PUT as learningPut } from "../src/lib/learning/syncRoute";
import { OWNER_ACTIVATION_PATH, ownerActivation } from "../src/lib/ownerActivation";

/** The bindings this Worker uses (hand-written: the app's tsconfig has no workers-types). */
export interface Env {
  ASSETS?: { fetch(request: Request): Promise<Response> };
}

type Handler = (request: Request) => Promise<Response>;

const ROUTES = new Map<string, Readonly<Record<string, Handler>>>([
  ["/api/learning", { GET: learningGet, PUT: learningPut }],
  [OWNER_ACTIVATION_PATH, { GET: ownerActivation }],
]);

/** The CSP has no analytics hosts: an API response loads no beacon. */
const API_CSP = contentSecurityPolicy(false);

function json(status: number, data: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extra },
  });
}

/** `res` with the /api security headers set (replacing any the handler gave). */
function withApiHeaders(res: Response): Response {
  const out = new Response(res.body, res);
  out.headers.set("Content-Security-Policy", API_CSP);
  out.headers.set("Cache-Control", "no-store");
  out.headers.set("X-Robots-Tag", "noindex");
  return out;
}

async function handleApi(request: Request, pathname: string): Promise<Response> {
  // CSRF defence in depth, before anything else (the PUT / POST handlers check it again for next dev).
  if (isCrossSiteWrite(request)) return json(403, { error: "cross-site request" });
  const route = ROUTES.get(pathname);
  if (!route) return json(404, { error: "not found" });
  const handler = Object.hasOwn(route, request.method) ? route[request.method] : undefined;
  if (!handler) return json(405, { error: "method not allowed" }, { Allow: Object.keys(route).join(", ") });
  try {
    return await handler(request);
  } catch (err) {
    // The handlers catch store errors themselves; this is the last guard. Name only (no message / body).
    console.error("[worker-error]", JSON.stringify({ path: pathname, error: err instanceof Error ? err.name : typeof err }));
    return json(500, { error: "internal error" });
  }
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return withApiHeaders(await handleApi(request, pathname));
  }
  if (env.ASSETS) return env.ASSETS.fetch(request);
  return new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

const worker = { fetch: handleRequest };
export default worker;
