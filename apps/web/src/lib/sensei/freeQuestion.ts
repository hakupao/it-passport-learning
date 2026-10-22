// D-181 Phase C (§0-9) — the /sensei free question. Each question starts a new
// thread, anchorId `free:<epoch ms in base 36>`, title = the question (shortened).
// The anchor is fixed by the thread's FIRST question: matchTerms over the page's
// light index → the cards from GET /api/sensei/terms → freeAnchor. Reopening the
// thread on /sensei derives it again from the stored first user message, so the
// same question gives a byte-equal anchor (prompt cache, Review Focus 4). A failed
// card fetch rejects: the caller shows a notice and sends nothing, rather than
// sending a different (no-match) anchor.
// Client-safe: no AI SDK runtime here (the /sensei page loads it only with the panel).

import type { UIMessage } from "ai";

import type { AppLocale } from "@/i18n/routing";
import type { TermCard, TermIndexEntry } from "@/lib/glossary/dictionary";

import { freeAnchor } from "./anchors";
import { matchTerms } from "./termMatch";

export const FREE_TITLE_MAX = 40;

export function freeAnchorId(nowMs: number): string {
  return `free:${nowMs.toString(36)}`;
}

/** The question with whitespace collapsed, cut at FREE_TITLE_MAX code points (+ "…"). */
export function freeThreadTitle(question: string): string {
  const chars = [...question.replace(/\s+/g, " ").trim()];
  return chars.length > FREE_TITLE_MAX ? `${chars.slice(0, FREE_TITLE_MAX).join("")}…` : chars.join("");
}

/** The text of the first user message ("" when there is none). */
export function firstUserText(messages: readonly UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  return first ? first.parts.map((p) => (p.type === "text" ? p.text : "")).join("") : "";
}

/** The anchor for a free thread whose first question is `question`. */
export async function deriveFreeAnchor(
  question: string,
  index: readonly TermIndexEntry[],
  locale: AppLocale,
  fetchCards: (ids: string[]) => Promise<TermCard[]>,
): Promise<string> {
  const ids = matchTerms(question, index);
  const cards = ids.length > 0 ? await fetchCards(ids) : [];
  return freeAnchor(cards, locale);
}

/** GET /api/sensei/terms; throws on a non-2xx status or an unexpected body. */
export async function fetchTermCards(
  ids: string[],
  locale: AppLocale,
  fetchImpl: (url: string) => Promise<Response> = (url) => fetch(url),
): Promise<TermCard[]> {
  const res = await fetchImpl(`/api/sensei/terms?${new URLSearchParams({ ids: ids.join(","), locale })}`);
  if (!res.ok) throw new Error(`terms ${res.status}`);
  const body = (await res.json()) as { cards?: unknown };
  if (!Array.isArray(body?.cards)) throw new Error("terms: unexpected body");
  return body.cards as TermCard[];
}
