// D-148 / D-217 H3 — /api/owner (owner activation) for `next dev` only (`*.dev.ts` is left out of
// the export build). Same handler as the Cloudflare Worker: lib/ownerActivation.ts.

export { ownerActivation as GET } from "@/lib/ownerActivation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
