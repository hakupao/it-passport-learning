// D-217 H3 test helper — an in-memory emulation of the Upstash Redis REST API, enough for the
// commands the owner API sends through @upstash/redis (not a *.test.ts, so vitest does not run it).
// Used by the Worker unit tests (as `fetch`), the CPU benchmark and the local e2e server (as an HTTP
// endpoint on 127.0.0.1). No external service is contacted.
//
// Emulated (developers' view of upstash.com/docs/redis/features/restapi, as @upstash/redis 1.38
// speaks it — every call is a POST):
//   POST <base>              body = one command array      → { result }
//   POST <base>/pipeline     body = array of commands      → [{ result }, …]
//   POST <base>/multi-exec   body = array of commands      → [{ result }, …] (applied in order)
//   Authorization: Bearer <token> (else 401 { error }); `Upstash-Encoding: base64` → string results
//   (and strings inside array results) base64-encoded, "OK" left as is — the client's default.
//   Commands: GET, SET key value (all /api/learning sends). Anything else → 400 { error: "ERR unknown
//   command …" }. (MGET / ZADD / ZRANGE went with the D-149 question reports, D-229.)
// Not emulated: expiry, options of SET (NX, XX …), sync tokens (the `upstash-sync-token` header is
// ignored), latency, size limits, partial MULTI failure.

export interface FakeUpstash {
  readonly url: string;
  readonly token: string;
  /** key → stored string (what SET wrote, JSON as the client serialized it). */
  readonly strings: Map<string, string>;
  /** Command names in call order (lower case), e.g. ["get", "get", "set"]. */
  readonly calls: string[];
  /** When set, every request answers this status with an error body (simulates an outage). */
  failWith: number | null;
  /** A `fetch` that answers requests to `url` and throws for any other URL. */
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  /** The REST handler itself (Request in, Response out). */
  handle(request: Request): Promise<Response>;
}

type Command = (string | number)[];

const toB64 = (s: string): string => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  return btoa(bin);
};

function encodeResult(result: unknown, base64: boolean): unknown {
  if (!base64) return result;
  if (typeof result === "string") return result === "OK" ? result : toB64(result);
  if (Array.isArray(result)) return result.map((v) => (typeof v === "string" ? toB64(v) : v));
  return result;
}

export function createFakeUpstash(url = "https://fake-upstash.test", token = "fake-token"): FakeUpstash {
  const strings = new Map<string, string>();
  const calls: string[] = [];

  function run(cmd: Command): { result?: unknown; error?: string } {
    const [name, ...args] = cmd;
    const op = String(name).toLowerCase();
    calls.push(op);
    const s = (i: number): string => String(args[i]);
    switch (op) {
      case "get":
        return { result: strings.get(s(0)) ?? null };
      case "set":
        strings.set(s(0), s(1));
        return { result: "OK" };
      default:
        return { error: `ERR unknown command '${op}'` };
    }
  }

  const fake: FakeUpstash = {
    url,
    token,
    strings,
    calls,
    failWith: null,
    async handle(request: Request): Promise<Response> {
      const jsonRes = (status: number, data: unknown): Response =>
        new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
      if (fake.failWith !== null) return jsonRes(fake.failWith, { error: "fake outage" });
      if (request.headers.get("authorization") !== `Bearer ${token}`) return jsonRes(401, { error: "Unauthorized" });
      if (request.method !== "POST") return jsonRes(405, { error: "only POST is emulated" });
      const base64 = request.headers.get("upstash-encoding") === "base64";
      const path = new URL(request.url).pathname.replace(/\/+$/, "");
      const basePath = new URL(url).pathname.replace(/\/+$/, "");
      const body = (await request.json()) as unknown;
      if (path === basePath) {
        const r = run(body as Command);
        return r.error ? jsonRes(400, { error: r.error }) : jsonRes(200, { result: encodeResult(r.result, base64) });
      }
      if (path === `${basePath}/pipeline` || path === `${basePath}/multi-exec`) {
        const out = (body as Command[]).map((c) => {
          const r = run(c);
          return r.error ? { error: r.error } : { result: encodeResult(r.result, base64) };
        });
        return jsonRes(200, out);
      }
      return jsonRes(404, { error: "unknown path" });
    },
    async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const request = new Request(input, init);
      if (!request.url.startsWith(url)) throw new TypeError(`fakeUpstash: unexpected fetch to ${request.url}`);
      return fake.handle(request);
    },
  };
  return fake;
}
