// D-181 §0-9 — /api/sensei/terms (the free question's term cards; the one new
// fs-reading route of Stage 6).
//
//   GET ?ids=<termId>,…&locale=<ja|zh|en>  → 200 { cards: TermCard[] }
//
// At most 8 ids (else 400). Ids that are not termId-shaped (isValidTermId) or not in
// the dictionary are skipped, a repeated id is returned once, and the cards follow the
// requested order. A missing / unknown locale or no ids → 400. Read-only: the
// committed dictionary (lib/glossary/dictionaryReader, memoized) and nothing else —
// no LLM, no owner gate, no cookies. A failed dictionary load → 500; the log names the
// error type only.

import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import { toTermCard, type TermCard } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { isValidTermId } from "@/lib/glossary/termId";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IDS = 8;

function json(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const locale = params.get("locale");
  if (!locale || !hasLocale(routing.locales, locale)) return json(400, { error: "invalid locale" });
  const raw = params.get("ids");
  if (!raw) return json(400, { error: "ids required" });
  const ids = raw.split(",");
  if (ids.length > MAX_IDS) return json(400, { error: `at most ${MAX_IDS} ids` });

  let dict;
  try {
    dict = await loadDictionary();
  } catch (err) {
    console.error("[sensei-terms-error]", JSON.stringify({ error: err instanceof Error ? err.name : typeof err }));
    return json(500, { error: "dictionary unavailable" });
  }

  const cards: TermCard[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (!isValidTermId(id) || seen.has(id)) continue;
    seen.add(id);
    const entry = dict.byId.get(id);
    if (entry) cards.push(toTermCard(entry, locale));
  }
  return json(200, { cards });
}
