// Stage 6 (D-179 / D-180 §0-3) — /[locale]/glossary/[termId] : dictionary term detail.
//
// termId arrives from the URL (user-controlled): anything not shaped like
// termId() or absent from the dictionary → notFound(). Loads the localized unit
// titles (ReaderIndex) and each sense's generated SVG, then renders TermDetail.
// No LLM on the server (D-179 §2). Self-contained surface, no ThemedPage.
// D-181 Phase C: also builds the AI 先生 term anchor (every sense under its JP unit
// title) for the page's 「AI 先生に聞く」 button; the browser sends it.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { TermDetail } from "@/components/glossary/TermDetail";
import { toTermCard, type DictEntry } from "@/lib/glossary/dictionary";
import { loadDictionary } from "@/lib/glossary/dictionaryReader";
import { isValidTermId } from "@/lib/glossary/termId";
import { routing } from "@/i18n/routing";
import { termAnchor } from "@/lib/sensei/textbookAnchors";
import { loadGeneratedSvg, loadReaderIndex, pick } from "@/lib/textbook/reader";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; termId: string }> };

async function findEntry(id: string): Promise<DictEntry | undefined> {
  if (!isValidTermId(id)) return undefined;
  return (await loadDictionary()).byId.get(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, termId } = await params;
  const entry = await findEntry(termId);
  return entry ? { title: toTermCard(entry, locale).gloss } : {};
}

export default async function TermPage({ params }: Props): Promise<React.ReactElement> {
  const { locale, termId } = await params;
  setRequestLocale(locale);

  const entry = await findEntry(termId);
  if (!entry) notFound();

  const [index, svgs] = await Promise.all([
    loadReaderIndex(),
    Promise.all(
      entry.senses.map((s) => (s.term.figure ? loadGeneratedSvg(s.term.figure.svg_path) : Promise.resolve(null))),
    ),
  ]);
  const unitTitles: Record<string, string> = {};
  const unitTitlesJp: Record<string, string> = {};
  for (const u of index.topics.flatMap((t) => t.units ?? [])) {
    unitTitles[u.unit_id] = pick(u as unknown as Record<string, unknown>, "title", locale);
    unitTitlesJp[u.unit_id] = u.title_jp;
  }
  const appLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;

  return (
    <TermDetail
      locale={locale}
      entry={entry}
      unitTitles={unitTitles}
      svgs={svgs}
      senseiAnchorText={termAnchor(entry, appLocale, unitTitlesJp)}
    />
  );
}
