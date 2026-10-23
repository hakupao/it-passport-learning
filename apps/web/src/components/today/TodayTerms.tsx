// Stage 7 Phase 1 Task 11 (D-189 §6.1 / D-190 §0-20, mockup A4-Home) — the spot box 「今天的 3 个用语」:
// headword (JP, a link to /glossary/<id>; the UI-language gloss after it when it differs) → its
// one-line definition in the UI language. No cards (none picked, still loading, or the dictionary
// failed) → no box.

"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { TodayTermCard } from "@/lib/practice/practiceIndex";

import styles from "./today.module.css";

export function TodayTerms({ cards }: { cards: TodayTermCard[] | null }): React.ReactElement | null {
  const t = useTranslations("Today");
  if (cards === null || cards.length === 0) return null;
  return (
    <section className={styles.termsBox} aria-labelledby="today-terms-title" data-terms="">
      <h2 id="today-terms-title" className={styles.termsHead}>
        {t("termsTitle")}
      </h2>
      <ul className={styles.terms}>
        {cards.map((c) => (
          <li key={c.id}>
            <Link href={`/glossary/${c.id}`} className={styles.termLink} lang="ja">
              {c.term}
            </Link>
            {c.gloss !== c.term ? <span className={styles.gloss}>（{c.gloss}）</span> : null} → {c.definition}
          </li>
        ))}
      </ul>
    </section>
  );
}
