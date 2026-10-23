// D-180 §0-7 — /api/learning (owner-only learning-record sync).
//
//   GET                       → 200 LearningRecord (stored, or empty)
//   PUT  body=LearningRecord  → 200 merged LearningRecord (merged with stored, written back)
//
// Check order: owner (D-148 cookie, 403) → Redis configured (503) → body
// (invalid JSON / schema / > 524288 bytes actually read, 400) → corrupt stored
// doc (500, nothing written) → Redis failure (502). Logs name the failure only —
// never the record, the cookie, or an error message (Upstash parse errors embed
// the response body).

import { isOwnerRequest } from "@/lib/owner";
import { parseRecord, type LearningRecord } from "@/lib/learning/recordV1";
import {
  CorruptStoredRecordError,
  loadLearningRedis,
  mergeAndStore,
  readStored,
} from "@/lib/learning/syncStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 524288;

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** Corrupt stored doc → 500; any other store/network failure → 502. */
function storeError(method: string, err: unknown): Response {
  const corrupt = err instanceof CorruptStoredRecordError;
  console.error(
    "[learning-sync-error]",
    JSON.stringify({ method, error: err instanceof Error ? err.name : typeof err }),
  );
  return corrupt
    ? json(500, { error: "stored learning record is corrupt" })
    : json(502, { error: "learning store error" });
}

/** The body as text, or null when it is missing, over the cap, unreadable, or not UTF-8. */
async function readCappedBody(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (declared > MAX_BODY_BYTES) return null;
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
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

export async function GET(request: Request): Promise<Response> {
  if (!(await isOwnerRequest(request))) return json(403, { error: "forbidden" });
  const redis = await loadLearningRedis();
  if (!redis) return json(503, { error: "learning store not configured" });
  try {
    return json(200, await readStored(redis));
  } catch (err) {
    return storeError("GET", err);
  }
}

export async function PUT(request: Request): Promise<Response> {
  if (!(await isOwnerRequest(request))) return json(403, { error: "forbidden" });
  const redis = await loadLearningRedis();
  if (!redis) return json(503, { error: "learning store not configured" });

  const text = await readCappedBody(request);
  if (text === null) return json(400, { error: "invalid or oversized body" });
  let incoming: LearningRecord | null;
  try {
    incoming = parseRecord(JSON.parse(text));
  } catch {
    return json(400, { error: "invalid JSON body" });
  }
  if (!incoming) return json(400, { error: "invalid learning record" });

  try {
    return json(200, await mergeAndStore(redis, incoming));
  } catch (err) {
    return storeError("PUT", err);
  }
}
