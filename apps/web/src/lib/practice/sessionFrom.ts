// Stage 7 Phase 3 (D-196 §0-2) — the practice page's `from` (server only).
//
// from=today needs nothing else. from=unit&unit=<id> touches the textbook only then: the id must
// match UNIT_ID_RE and be in the reader index, and the unit is loaded for its title (active locale)
// and terms (the summary's 「単元に戻る」, the explanation's link back, §0-8). Any failure there
// (index or unit unreadable) is logged and the set runs without a `from` — the practice itself
// never depends on the textbook.

import "server-only";

import { termId } from "../glossary/termId";
import { loadReaderIndex, loadUnit, toDataLang, UNIT_ID_RE, type ReaderIndex, type TextbookUnit } from "../textbook/reader";
import { parseFrom, type SearchParams, type SessionFrom } from "./practiceSession";

export interface SessionFromDeps {
  loadReaderIndex: () => Promise<Pick<ReaderIndex, "topics">>;
  loadUnit: (unitId: string) => Promise<TextbookUnit>;
}

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

export async function resolveSessionFrom(
  sp: SearchParams,
  locale: string,
  deps: SessionFromDeps = { loadReaderIndex, loadUnit },
): Promise<SessionFrom | null> {
  if (first(sp.from) !== "unit") return first(sp.from) === "today" ? { kind: "today" } : null;
  try {
    const index = await deps.loadReaderIndex();
    const known = new Set(index.topics.flatMap((t) => t.unit_order));
    const from = parseFrom(sp, (id) => UNIT_ID_RE.test(id) && known.has(id));
    if (from?.kind !== "unit") return null;
    const unit = await deps.loadUnit(from.unitId);
    const dl = toDataLang(locale);
    return {
      kind: "unit",
      unitId: from.unitId,
      title: unit[`title_${dl}`] || unit.title_jp,
      terms: unit.terms.map((t) => ({ id: termId(t.term), term: t.term })),
    };
  } catch (err) {
    console.error("[practice] from=unit: the unit could not be loaded; the set runs without it", err);
    return null;
  }
}
