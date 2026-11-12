// H5 local only: run the esbuild bundle of apps/web/worker/index.ts in Node (instead of wrangler dev)
// with fake env, on 127.0.0.1:<port>. No ASSETS binding (local-cf serves out/).
import http from "node:http";
const port = Number(process.argv[2]);
if (!port || port === 3000) process.exit(2);
Object.assign(process.env, {
  OWNER_KEY: "local-owner-key",
  UPSTASH_REDIS_REST_URL: "",
  UPSTASH_REDIS_REST_TOKEN: "",
  KV_REST_API_URL: "http://127.0.0.1:3161",
  KV_REST_API_TOKEN: "fake-token",
  UPSTASH_DISABLE_TELEMETRY: "1",
});
const { handleRequest } = await import(new URL("./worker.mjs", import.meta.url).href);
http
  .createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (Array.isArray(v)) for (const x of v) headers.append(k, x);
      else if (typeof v === "string") headers.set(k, v);
    }
    const body = ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks);
    const r = await handleRequest(new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers, body }), {});
    const out = {};
    for (const [k, v] of r.headers) if (k !== "set-cookie") out[k] = v;
    const sc = r.headers.getSetCookie();
    if (sc.length) out["set-cookie"] = sc;
    res.writeHead(r.status, out);
    res.end(Buffer.from(await r.arrayBuffer()));
    console.log(`${req.method} ${req.url.split("?")[0]} ${r.status}`);
  })
  .listen(port, "127.0.0.1", () => console.log(`worker-node on :${port}`));
