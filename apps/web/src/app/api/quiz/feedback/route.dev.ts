// D-149 — /api/quiz/feedback for `next dev` only (D-217 H1-5: `*.dev.ts` is left out of the export
// build). The handlers are lib/quiz/feedbackRoute.ts, shared with the Cloudflare Worker
// (worker/index.ts, D-217 H3) — the contract is documented there.

export { GET, POST } from "@/lib/quiz/feedbackRoute";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
