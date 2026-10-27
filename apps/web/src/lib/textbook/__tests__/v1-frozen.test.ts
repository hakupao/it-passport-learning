// Stage 7 Phase 3 batch B4 (D-201 §0-9) — the frozen v1 fixtures are real v1 units: schema v1, in
// unit_index with the same headwords (invariant across the rewrite), and identical to the live file
// for as long as the live file is still v1.
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { V1_SCHEMA } from "./v1Snapshot";
import { FROZEN_V1_IDS, frozenV1, frozenV1Path } from "./v1Frozen";

const TB = path.resolve(__dirname, "../../../../../../data/ip/textbook");
const LIVE = (id: string) => path.join(TB, "units", `${id}.json`);
type Index = { topics: { units: { unit_id: string; terms: { term: string }[] }[] }[] };

describe("__fixtures__/v1-frozen", () => {
  it.each(FROZEN_V1_IDS)("%s: v1, indexed with the same headwords, = the live file while that is v1", (id) => {
    const u = frozenV1(id);
    expect(u.schema_version).toBe(V1_SCHEMA);
    expect(u.unit_id).toBe(id);
    const index = JSON.parse(readFileSync(path.join(TB, "unit_index.json"), "utf-8")) as Index;
    const iu = index.topics.flatMap((t) => t.units).find((x) => x.unit_id === id);
    expect(iu, id).toBeDefined();
    expect(u.terms.map((t) => t.term)).toEqual(iu!.terms.map((t) => t.term));
    const live = readFileSync(LIVE(id), "utf-8");
    if ((JSON.parse(live) as { schema_version: string }).schema_version === V1_SCHEMA) {
      expect(readFileSync(frozenV1Path(id), "utf-8")).toBe(live);
    }
  });
});
