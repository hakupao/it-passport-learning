// D-180 §0-7 / D-190 §0-3 — /api/learning (owner-only learning-record sync).
// Speaks both record versions so v1 clients (old tabs) keep working while the
// stored document is v2:
//
//   GET                  → 200 v1 record: the stored record downgraded (downgradeToV1)
//   GET ?v=2             → 200 v2 wire (encodeRecord) of the stored record
//   PUT  body=v1 record  → upgraded, merged with stored, written back → 200 merged, downgraded to v1
//   PUT  body=v2 wire    → merged with stored, written back → 200 merged v2 wire
//
// Only `?v=2` exactly selects v2 on GET; anything else is v1. PUT answers in the
// body's version. Stored = empty, or learn:owner:v2, or learn:owner:v1 upgraded
// (see syncStore); `now` for every v1 upgrade is Date.now() of the request.
//
// Check order: owner (D-148 cookie, 403) → Redis configured (503) → body
// (invalid JSON / neither v1 nor v2 / > 1048576 bytes actually read, 400) →
// corrupt stored doc (500, nothing written) → Redis failure (502). Logs name
// the failure only — never the record, the cookie, or an error message (Upstash
// parse errors embed the response body).
// A successful PUT whose stored document is over 768 KiB also logs
// `[learning-sync-size] {"bytes":N}` (mergeAndStore; the byte count only).

import { isOwnerRequest } from "@/lib/owner";
import { encodeRecord, type LearningRecord } from "@/lib/learning/record";
import { downgradeToV1, parseAnyRecord } from "@/lib/learning/recordV1";
import {
  CorruptStoredRecordError,
  loadLearningRedis,
  mergeAndStore,
  readStored,
} from "@/lib/learning/syncStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1048576;

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** The record in the wire form of `version`: v2 → encodeRecord, v1 → downgradeToV1. */
const wireFor = (r: LearningRecord, version: 1 | 2): unknown => (version === 2 ? encodeRecord(r) : downgradeToV1(r));

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
  const version = new URL(request.url).searchParams.get("v") === "2" ? 2 : 1;
  try {
    return json(200, wireFor(await readStored(redis, Date.now()), version));
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
  const now = Date.now();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json(400, { error: "invalid JSON body" });
  }
  const incoming = parseAnyRecord(body, now);
  if (!incoming) return json(400, { error: "invalid learning record" });

  try {
    return json(200, wireFor(await mergeAndStore(redis, incoming.record, now), incoming.version));
  } catch (err) {
    return storeError("PUT", err);
  }
}
