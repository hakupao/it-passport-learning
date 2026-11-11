// D-180 §0-7 / D-190 §0-3 — /api/learning for `next dev` only (D-217 H1-5: `*.dev.ts` is left out
// of the export build). The handlers are lib/learning/syncRoute.ts, shared with the Cloudflare
// Worker (worker/index.ts, D-217 H3) — the contract is documented there.

export { GET, PUT } from "@/lib/learning/syncRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
