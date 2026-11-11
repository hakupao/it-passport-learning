// D-217 H3 — serve the in-memory Upstash REST emulation (worker/testing/fakeUpstash.ts) over HTTP on
// 127.0.0.1 for local runs of the Worker (wrangler dev / e2e). State lives in memory only; nothing
// external is contacted. Token: `fake-token`.
//
//   node scripts/fake-upstash.ts --port 3161

import http from "node:http";
import { parseArgs } from "node:util";

import { createFakeUpstash } from "../worker/testing/fakeUpstash.ts";

const { values } = parseArgs({ options: { port: { type: "string" } } });
const port = Number(values.port);
if (!port || port === 3000) {
  console.error("usage: node scripts/fake-upstash.ts --port <≠3000>");
  process.exit(2);
}
const fake = createFakeUpstash(`http://127.0.0.1:${port}`, "fake-token");

http
  .createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
    const r = await fake.handle(
      new Request(`http://127.0.0.1:${port}${req.url ?? "/"}`, {
        method: req.method,
        headers,
        body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
      }),
    );
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
    console.log(`${req.method} ${req.url} ${r.status} ${fake.calls.slice(-1).join("")}`);
  })
  .listen(port, "127.0.0.1", () => console.log(`fake-upstash on :${port}`));
