// D-223 (A′) — the post-export prune deletes exactly the detail families' payloads.
import { mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { pruneDetailPayloads } from "../prune";

function tree(files: string[]): string {
  const root = mkdtempSync(path.join(tmpdir(), "prune-"));
  for (const f of files) {
    mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    writeFileSync(path.join(root, f), "x");
  }
  return root;
}

function list(root: string, rel = ""): string[] {
  return readdirSync(path.join(root, rel), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? list(root, path.join(rel, e.name)) : [path.join(rel, e.name).split(path.sep).join("/")],
  );
}

describe("pruneDetailPayloads", () => {
  it("deletes <id>.txt of practice/q and glossary pages in every locale; keeps list pages, html and other trees", () => {
    const keep: string[] = [];
    const drop: string[] = [];
    for (const l of ["ja", "zh", "en"]) {
      keep.push(`${l}/practice/q/2009h21a-q054.html`, `${l}/glossary/t00219f657aedbb32.html`);
      drop.push(`${l}/practice/q/2009h21a-q054.txt`, `${l}/glossary/t00219f657aedbb32.txt`);
      keep.push(`${l}.txt`, `${l}/glossary.txt`, `${l}/glossary.html`, `${l}/practice.txt`, `${l}/practice/browse.txt`);
      keep.push(`${l}/practice/browse/technology-14-36.txt`, `${l}/textbook/management-08-25-u01.txt`);
      keep.push(`${l}/glossary/notes.txt`, `${l}/practice/q/readme.txt`); // not id-shaped: left alone
    }
    drop.push("ja/practice/q/2009h21a-q054.__next.practice.q.$d$qid.txt"); // segment prefetch shape
    const root = tree([...keep, ...drop]);
    const stats = pruneDetailPayloads(root);
    expect(list(root).sort()).toEqual([...keep].sort());
    expect(stats["ja/practice/q"]).toEqual({ html: 1, deleted: 2 });
    expect(stats["zh/glossary"]).toEqual({ html: 1, deleted: 1 });
    expect(Object.keys(stats)).toHaveLength(6);
  });
});
