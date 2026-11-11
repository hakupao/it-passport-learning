#!/usr/bin/env node
// D-217 H1-5 — runs right after `next build` (output: 'export') and finishes out/ as the deployable
// static site (Cloudflare Workers static assets):
//   1. D-223 (A′): delete the .txt payloads of practice/q/<id> and glossary/<termId> (lib/export/prune)
//   2. out/_redirects: `/` → /ja, locale-less sections → /ja/… (lib/export/redirects; D-219)
//   3. out/_headers: CSP (+ the Web Analytics hosts iff CF_WEB_ANALYTICS_TOKEN), immutable
//      /_next/static/*, noindex on *.workers.dev (lib/export/headers)
//   4. out/index.html: a static fallback for `/` (meta refresh to /ja) where _redirects is not read
//   5. out/sitemap.xml from the crawlable pages, after checking every page's canonical (lib/export/sitemap)
// Run (Node ≥ 23 native type stripping): node scripts/postexport.ts [out-dir]   (default: out)
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { headersFile } from "../src/lib/export/headers.ts";
import { pruneDetailPayloads } from "../src/lib/export/prune.ts";
import { redirectsFile, sectionsOf } from "../src/lib/export/redirects.ts";
import { writeSitemap } from "../src/lib/export/sitemap.ts";

const outDir = path.resolve(process.argv[2] ?? "out");

const pruned = pruneDetailPayloads(outDir);
for (const [k, v] of Object.entries(pruned)) {
  if (v.html === 0 || v.deleted !== v.html) throw new Error(`prune ${k}: ${v.deleted} payloads deleted for ${v.html} pages`);
}

const sections = sectionsOf(
  readdirSync(path.join(outDir, "ja"), { withFileTypes: true }).map((e) => ({ name: e.name, isDir: e.isDirectory() })),
);
writeFileSync(path.join(outDir, "_redirects"), redirectsFile(sections));

const analytics = Boolean(process.env.CF_WEB_ANALYTICS_TOKEN?.trim());
writeFileSync(path.join(outDir, "_headers"), headersFile({ analytics }));

writeFileSync(
  path.join(outDir, "index.html"),
  '<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="robots" content="noindex">' +
    '<meta http-equiv="refresh" content="0;url=/ja"><title>ITパスポート 過去問ノート</title></head>' +
    '<body><a href="/ja">ITパスポート 過去問ノート</a></body></html>\n',
);

const sitemap = writeSitemap(outDir);

console.log(
  JSON.stringify(
    {
      pruned,
      redirects: { sections },
      headers: { analytics },
      sitemap,
    },
    null,
    2,
  ),
);
