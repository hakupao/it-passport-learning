// D-217 H3 — local stand-in for "Cloudflare static assets (out/) + the Worker" for e2e (never :3000).
// `wrangler dev` cannot serve the 16k-file out/ on this machine (spawn EBADF, wrangler 4.156 and
// 4.160: failures/phase5/hosting/step_H1-5_attempt_1_wrangler.md, step_H3_attempt_1_wrangler_dev.md),
// but it runs the Worker fine with a tiny assets dir. So:
//   - this server answers every non-/api request from out/, emulating the asset layer (from H1-5):
//     _redirects (static + one splat, top-most wins, query kept, before assets), _headers (path + host
//     patterns, :placeholders, one splat, repeated headers comma-joined, `! Name` detach),
//     html_handling auto-trailing-slash, not_found_handling 404-page, the default
//     `Cache-Control: public, max-age=0, must-revalidate` + ETag / 304;
//   - /api/* (assets.run_worker_first) is proxied (method, headers incl. Cookie, body; response
//     status, headers incl. every Set-Cookie, body) to `--api`, e.g. a `wrangler dev` of
//     worker/index.ts on another port (worker/local/wrangler.jsonc). Only an absolute Location on the
//     upstream origin is rewritten to this server's origin.
// Not emulated: edge cache, compression, HTTP/2, Cloudflare's exact Content-Type table, and the
// real behaviour of `_redirects` query keeping / `/` as a source (checked on the preview, H4).
//
//   node scripts/local-cf.ts --out out --port 3150 --api http://127.0.0.1:3152 [--log file.tsv]

import { createHash } from "node:crypto";
import { appendFileSync, existsSync, readFileSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: { out: { type: "string", default: "out" }, port: { type: "string" }, api: { type: "string" }, log: { type: "string" } },
});
const ROOT = path.resolve(values.out!);
const PORT = Number(values.port);
if (!PORT || PORT === 3000 || !values.api) {
  console.error("usage: node scripts/local-cf.ts --out out --port <≠3000> --api <worker origin> [--log file]");
  process.exit(2);
}
const API = new URL(values.api);
const LOG = values.log;

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const lines = (f: string): string[] => (existsSync(f) ? readFileSync(f, "utf-8").split("\n") : []);
const redirects = lines(path.join(ROOT, "_redirects"))
  .filter((l) => l.trim() && !l.startsWith("#"))
  .map((l) => l.trim().split(/\s+/));
interface HeaderRule {
  pattern: string;
  set: [string, string][];
  detach: string[];
}
const headerRules: HeaderRule[] = [];
for (const l of lines(path.join(ROOT, "_headers"))) {
  if (!l.trim() || l.startsWith("#")) continue;
  const last = headerRules.at(-1);
  if (!/^\s/.test(l)) headerRules.push({ pattern: l.trim(), set: [], detach: [] });
  else if (/^\s+!\s/.test(l)) last?.detach.push(l.trim().slice(2).trim().toLowerCase());
  else {
    const i = l.indexOf(":");
    last?.set.push([l.slice(0, i).trim(), l.slice(i + 1).trim()]);
  }
}

function patternRe(p: string, delim: string): RegExp {
  const esc = p
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, "(.*)")
    .replace(/:[A-Za-z]\w*/g, `([^${delim}]+)`);
  return new RegExp(`^${esc}$`);
}
function headerMatch(pattern: string, host: string, pathname: string): boolean {
  if (pattern.startsWith("https://")) {
    const u = pattern.slice(8);
    const slash = u.indexOf("/");
    return patternRe(u.slice(0, slash), ".").test(host.replace(/:\d+$/, "")) && patternRe(u.slice(slash), "/").test(pathname);
  }
  return patternRe(pattern, "/").test(pathname);
}

function resolveAsset(pathname: string): { file: string } | { redirect: string } | null {
  const f = (p: string): string | null => {
    const full = path.join(ROOT, p);
    return full.startsWith(ROOT) && existsSync(full) && statSync(full).isFile() ? full : null;
  };
  if (pathname.endsWith("/index.html")) return { redirect: pathname.slice(0, -10) };
  if (pathname.endsWith(".html") && f(pathname)) return { redirect: pathname.slice(0, -5) };
  if (pathname.endsWith("/")) {
    const index = f(pathname + "index.html");
    if (index) return { file: index };
    if (pathname !== "/" && f(pathname.slice(0, -1) + ".html")) return { redirect: pathname.slice(0, -1) };
    return null;
  }
  const exact = f(pathname) ?? f(pathname + ".html");
  if (exact) return { file: exact };
  if (f(pathname + "/index.html")) return { redirect: pathname + "/" };
  return null;
}

async function proxyApi(req: http.IncomingMessage, res: http.ServerResponse): Promise<number> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined || k === "connection" || k === "content-length") continue;
    headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  }
  const upstream = await fetch(new URL(req.url ?? "/", API), {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
    redirect: "manual",
  });
  const out: Record<string, string | string[]> = {};
  upstream.headers.forEach((v, k) => {
    if (k !== "set-cookie" && k !== "content-encoding" && k !== "content-length" && k !== "transfer-encoding") out[k] = v;
  });
  // wrangler dev sees its own origin in request.url (the Host header is not kept), so an absolute
  // Location points at it: map it back to this server (like a reverse proxy's proxy_redirect).
  const location = upstream.headers.get("location");
  if (location?.startsWith(API.origin)) out.location = `http://${req.headers.host ?? ""}${location.slice(API.origin.length)}`;
  const cookies = upstream.headers.getSetCookie();
  if (cookies.length) out["set-cookie"] = cookies;
  res.writeHead(upstream.status, out);
  res.end(Buffer.from(await upstream.arrayBuffer()));
  return upstream.status;
}

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://x");
    const pathname = decodeURIComponent(url.pathname);
    const host = req.headers.host ?? "";
    const done = (status: number | string, extra = ""): void => {
      if (LOG) {
        appendFileSync(
          LOG,
          `${new Date().toISOString()}\t${req.method}\t${status}\t${url.pathname}${url.pathname.startsWith("/api/") ? "" : url.search}\t${req.headers["sec-fetch-mode"] ?? ""}\t${extra}\n`,
        );
      }
    };
    if (url.pathname.startsWith("/api/")) {
      // The query is not logged: /api/owner?key=… carries the owner key.
      proxyApi(req, res).then(
        (s) => done(s, "worker"),
        () => {
          res.writeHead(502).end();
          done(502, "worker unreachable");
        },
      );
      return;
    }
    for (const [src, dst, code = "302"] of redirects) {
      const m = patternRe(src!, "/").exec(pathname);
      if (m) {
        const loc = dst!.replace(":splat", m[1] ?? "") + url.search;
        res.writeHead(Number(code), { Location: loc });
        res.end();
        return done(code, loc);
      }
    }
    let r = resolveAsset(pathname);
    let status = 200;
    if (r && "redirect" in r) {
      res.writeHead(307, { Location: r.redirect + url.search });
      res.end();
      return done(307, r.redirect);
    }
    if (!r) {
      r = { file: path.join(ROOT, "404.html") };
      status = 404;
    }
    const body = readFileSync(r.file);
    const etag = `"${createHash("sha1").update(body).digest("hex")}"`;
    const headers: Record<string, string> = {
      "Content-Type": TYPES[path.extname(r.file)] ?? "application/octet-stream",
      ETag: etag,
      "Cache-Control": "public, max-age=0, must-revalidate",
    };
    const custom: Record<string, string> = {};
    for (const rule of headerRules) {
      if (!headerMatch(rule.pattern, host, pathname)) continue;
      for (const [k, v] of rule.set) custom[k] = custom[k] ? `${custom[k]}, ${v}` : v;
      for (const d of rule.detach) {
        for (const k of Object.keys(headers)) if (k.toLowerCase() === d) delete headers[k];
      }
    }
    Object.assign(headers, custom);
    if (status === 200 && req.headers["if-none-match"] === etag) {
      res.writeHead(304, headers);
      res.end();
      return done(304);
    }
    res.writeHead(status, headers);
    res.end(req.method === "HEAD" ? undefined : body);
    done(status);
  })
  .listen(PORT, "127.0.0.1", () => console.log(`local-cf: ${ROOT} on :${PORT}, /api/* → ${API.origin}`));
