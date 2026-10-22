// D-181 §0-9 — /api/sensei/terms (the free question's terms; the one new fs-reading
// route of Stage 6).
//
//   GET ?ids=<termId>,…&locale=<ja|zh|en>
//     → 200 { terms: { id, term, senses: { unitTitleJp, definitionJp, definitionLocale?,
//               explanationJp?, explanationLocale?, memoryHookJp?, memoryHookLocale? }[] }[] }
//
// Every sense of each term, in dictionary order, under its unit's JP title; the JP
// definition always, the JP explanation / memory hook and the `locale` fields for
// zh / en (JP only for ja) when not blank. Empty id segments are dropped, then at most
// 8 ids (else 400). Ids that are not termId-shaped (isValidTermId) or not in the dictionary
// are skipped, a repeated id is returned once, and the terms follow the requested
// order. A missing / unknown locale or no ids → 400. A 200 is cacheable at the edge
// (`public, s-maxage=86400, stale-while-revalidate=604800`: the committed data only
// changes on deploy, and a deploy starts a fresh cache); errors are `no-store`. Read-only: the committed
// dictionary and unit index (memoized loaders) and nothing else — no LLM, no owner
// gate, no cookies. A failed load → 500; the log names the error type only.

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { isValidTermId } from "@/lib/glossary/termId";
import type { SenseiTermContext } from "@/lib/sensei/anchors";
import { termContext } from "@/lib/sensei/textbookAnchors";
import { loadReaderIndex } from "@/lib/textbook/reader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IDS = 8;

const CACHE_OK = "public, s-maxage=86400, stale-while-revalidate=604800";

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": status === 200 ? CACHE_OK : "no-store",
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const locale = params.get("locale");
  if (!locale || !hasLocale(routing.locales, locale)) return json(400, { error: "invalid locale" });
  const ids = (params.get("ids") ?? "").split(",").filter((id) => id !== "");
  if (ids.length === 0) return json(400, { error: "ids required" });
  if (ids.length > MAX_IDS) return json(400, { error: `at most ${MAX_IDS} ids` });

  let dict, index;
  try {
    [dict, index] = await Promise.all([loadDictionary(), loadReaderIndex()]);
  } catch (err) {
    console.error("[sensei-terms-error]", JSON.stringify({ error: err instanceof Error ? err.name : typeof err }));
    return json(500, { error: "dictionary unavailable" });
  }

  const unitTitlesJp: Record<string, string> = {};
  for (const u of index.topics.flatMap((t) => t.units ?? [])) unitTitlesJp[u.unit_id] = u.title_jp;

  const terms: SenseiTermContext[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (!isValidTermId(id) || seen.has(id)) continue;
    seen.add(id);
    const entry = dict.byId.get(id);
    if (entry) terms.push(termContext(entry, locale, unitTitlesJp));
  }
  return json(200, { terms });
}
