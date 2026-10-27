// Stage 7 Phase 3 Task 6 (D-196 §0-9, Review Focus 4) — v1 units keep their
// dictionary senses and AI 先生 unit anchors byte-for-byte through the v2 schema
// work. The snapshot was recorded before any v2 change; it covers the v1 unit id
// set only: a unit that has since become v2 is skipped (its row stays, unused), a
// current v1 unit without a row fails. Re-record (only on purpose):
//   V1_SNAPSHOT_WRITE=1 pnpm exec vitest run src/lib/textbook/__tests__/v1-snapshot.test.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadDictionary } from "../../glossary/dictionaryReader";
import { loadAllUnits } from "../reader";
import { v1Fingerprint, type V1UnitHash } from "./v1Snapshot";

const FILE = path.join(__dirname, "__snapshots__", "v1-units.json");

describe("v1 snapshot", () => {
  it("every current v1 unit matches its recorded dictionary senses and unit anchors", async () => {
    const [dict, units] = await Promise.all([loadDictionary(), loadAllUnits()]);
    const now = v1Fingerprint(dict, units);
    if (process.env.V1_SNAPSHOT_WRITE === "1") writeFileSync(FILE, `${JSON.stringify(now, null, 1)}\n`);
    expect(existsSync(FILE), FILE).toBe(true);
    const saved = JSON.parse(readFileSync(FILE, "utf-8")) as Record<string, V1UnitHash>;
    expect(Object.keys(now).length).toBeGreaterThan(0);
    for (const [id, h] of Object.entries(now)) {
      expect(saved[id], id).toEqual(h);
    }
  });
});
