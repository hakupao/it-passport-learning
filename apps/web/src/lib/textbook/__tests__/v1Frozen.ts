// Stage 7 Phase 3 batch B4 (D-201 §0-9) — frozen v1 copies of corpus units that tests pin to.
// The batch rewrite turns live units into v2, so a test that asserts v1 content of a specific unit
// reads the copy under __fixtures__/v1-frozen/<id>.json instead (taken byte-for-byte from the
// committed v1 file at e27abf7; v1-frozen.test.ts checks it against the live file while that is v1).
import { readFileSync } from "node:fs";
import path from "node:path";

import type { TextbookUnit } from "../types";

export const FROZEN_V1_IDS = ["management-08-25-u01", "strategy-01-02-u14", "technology-21-54-u01"] as const;
export type FrozenV1Id = (typeof FROZEN_V1_IDS)[number];

export const frozenV1Path = (id: FrozenV1Id): string => path.join(__dirname, "..", "__fixtures__", "v1-frozen", `${id}.json`);

export function frozenV1(id: FrozenV1Id): TextbookUnit {
  return JSON.parse(readFileSync(frozenV1Path(id), "utf-8")) as TextbookUnit;
}
