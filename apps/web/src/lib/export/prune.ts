// D-223 (A′) — after export, delete the RSC payload (`<id>.txt`) of every page of the two detail
// families, so the whole site fits Cloudflare Free's 20,000 files / version. Next 15.5 export
// writes per app page only `<route>.html` + `<route>.txt` (segment prefetch files `__next.*.txt`
// only with clientSegmentCache, off here; the prune would remove those too). Matching is by strict id
// shape inside `<locale>/practice/q/` and `<locale>/glossary/`, never by a glob, so
// `<locale>/glossary.txt` and `<locale>/practice.txt` (the list pages) stay.
import { readdirSync, rmSync } from "node:fs";
import path from "node:path";

export const LOCALES = ["ja", "zh", "en"] as const;
export const FAMILIES = [
  { dir: "practice/q", id: /^\d{4}[a-z0-9]{1,16}-q\d{3}$/ },
  { dir: "glossary", id: /^t[0-9a-f]{16}$/ },
] as const;

export type PruneStats = Record<string, { html: number; deleted: number }>;

/** Payload files of one detail page: `<id>.txt` and any `<id>.__next.*.txt` / `<id>/__next.*.txt`. */
function isPayload(name: string, id: RegExp): boolean {
  const m = /^(.+?)(?:\.__next\..*)?\.txt$/.exec(name);
  return m !== null && id.test(m[1]!);
}

export function pruneDetailPayloads(outDir: string): PruneStats {
  const stats: PruneStats = {};
  for (const l of LOCALES) {
    for (const f of FAMILIES) {
      const dir = path.join(outDir, l, f.dir);
      const entries = readdirSync(dir, { withFileTypes: true });
      let html = 0;
      let deleted = 0;
      for (const e of entries) {
        if (e.isFile() && e.name.endsWith(".html") && f.id.test(e.name.slice(0, -5))) html++;
        else if (e.isFile() && isPayload(e.name, f.id)) {
          rmSync(path.join(dir, e.name));
          deleted++;
        } else if (e.isDirectory() && f.id.test(e.name)) {
          // a segment-prefetch directory of one page (not emitted today)
          rmSync(path.join(dir, e.name), { recursive: true });
          deleted++;
        }
      }
      stats[`${l}/${f.dir}`] = { html, deleted };
    }
  }
  return stats;
}
