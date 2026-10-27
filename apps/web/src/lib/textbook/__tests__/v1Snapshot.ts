// Stage 7 Phase 3 Task 6 (D-196 §0-9, Review Focus 4) — v1 output fingerprint.
//
// Per v1 unit: a hash of its dictionary senses (sense-level: a headword taught in
// a v1 and a v2 unit — ステークホルダ, アローダイアグラム — keeps only its v1
// sense here) and of unitAnchor in each locale. v2 units are skipped, so a pilot
// unit turning v2 never needs the snapshot regenerated. Not a *.test.ts file:
// v1-snapshot.test.ts and v2-compat.test.ts both use it.

import { createHash } from "node:crypto";

import type { Dictionary } from "../../glossary/dictionary";
import { unitAnchor } from "../../sensei/textbookAnchors";
import type { TextbookUnit } from "../types";

export const V1_SCHEMA = "stage4-unit-v1-trilingual";

export interface V1UnitHash {
  dict: string;
  anchor: { ja: string; zh: string; en: string };
}

/** JSON with object keys sorted at every level (hash independent of key order). */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

const hash = (s: string): string => createHash("sha256").update(s).digest("hex").slice(0, 16);

/** unit_id → hashes, for every v1 unit in `units`, keys in unit_id order. */
export function v1Fingerprint(dict: Dictionary, units: TextbookUnit[]): Record<string, V1UnitHash> {
  const v1 = units.filter((u) => u.schema_version === V1_SCHEMA);
  const senses = new Map<string, unknown[]>(v1.map((u) => [u.unit_id, []]));
  for (const e of dict.entries) {
    for (const s of e.senses) {
      senses.get(s.unitId)?.push({ entryId: e.id, entryTerm: e.term, unitId: s.unitId, topicId: s.topicId, category: s.category, term: s.term, questions: e.questions });
    }
  }
  const out: Record<string, V1UnitHash> = {};
  for (const u of [...v1].sort((a, b) => a.unit_id.localeCompare(b.unit_id))) {
    out[u.unit_id] = {
      dict: hash(canonical(senses.get(u.unit_id))),
      anchor: { ja: hash(unitAnchor(u, "ja")), zh: hash(unitAnchor(u, "zh")), en: hash(unitAnchor(u, "en")) },
    };
  }
  return out;
}
