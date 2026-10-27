// Stage 6 (Session 85) — production single-unit reader; Stage 7 Phase 3 (D-196 §0-4〜§0-6):
// single column in the D-195 skeleton over the reader model (normalizeUnit).
//
// Async server component, single-language per the active locale. Order: header
// (breadcrumb → h1 → meta → 「AI 先生に聞く」 → term index; v2: 学習目標 → 用語総表) → each term
// (TermBlock; v2: each 易混 pair right after the later of its two terms, D-195 §4) →
// 要点 (summary.key_points) → 確認問題 (#confirm, pickConfirm's ids) → the topic's past
// questions (secondary link) → 「読了」 → in-topic
// prev/next. Not shown (§0-6): overview.intro, summary.memory_hooks, fallback inline_quiz.
// The unit is marked read only by the 読了 button (§0-4; the page mounts the
// LearningRecordProvider).

import { getTranslations } from "next-intl/server";
import { Fragment } from "react";

import { AskSensei, SenseiHost } from "@/components/sensei/AskSensei";
import { Link } from "@/i18n/navigation";
import { pastCount } from "@/lib/textbook/confirm";
import { parseInline } from "@/lib/textbook/inline";
import {
  loadGeneratedSvg,
  toDataLang,
  type ReaderUnit,
  type UnitNeighbors,
  type UnitPlace,
} from "@/lib/textbook/reader";

import { ConfirmBlock } from "./ConfirmBlock";
import { PairBlock } from "./PairBlock";
import { ReadButton } from "./ReadButton";
import { TermBlock } from "./TermBlock";
import { UnitHeader } from "./UnitHeader";
import styles from "./reader.module.css";

interface Props {
  unit: ReaderUnit;
  place: UnitPlace | null;
  neighbors: UnitNeighbors;
  locale: string;
  /** The AI 先生 unit anchor (lib/sensei/textbookAnchors unitAnchor). */
  senseiAnchorText: string;
  /** pickConfirm(unit, members) */
  confirm: string[];
}

export async function UnitReader({
  unit,
  place,
  neighbors,
  locale,
  senseiAnchorText,
  confirm,
}: Props): Promise<React.ReactElement> {
  const t = await getTranslations({ locale, namespace: "Textbook" });
  const dl = toDataLang(locale);

  // Preload the v1 SVGs (parallel) before rendering.
  const svgs = await Promise.all(
    unit.terms.map((tm) => (tm.fig?.kind === "svg" ? loadGeneratedSvg(tm.fig.data.path) : Promise.resolve(null))),
  );

  const title = unit.title[dl] || unit.title.jp;
  const keyPoints = unit.keyPoints[dl].length > 0 ? unit.keyPoints[dl] : unit.keyPoints.jp;
  const v2 = unit.schema === "v2";
  // a pair goes after the later of its two terms (validateV2 keeps a before b; max() is the safe reading)
  const pairsAfter = (i: number) =>
    unit.pairs.filter((p) => Math.max(unit.terms.findIndex((x) => x.term === p.a), unit.terms.findIndex((x) => x.term === p.b)) === i);

  return (
    <main className={`${styles.page} ${styles.unitPage}`}>
      <UnitHeader unit={unit} place={place} locale={locale} pastCount={pastCount(unit)}>
        <SenseiHost>
          <div className={styles.askSensei}>
            <AskSensei kind="unit" anchorId={unit.id} title={title} anchorText={senseiAnchorText} />
          </div>
        </SenseiHost>
      </UnitHeader>

      {/* v2: the term articles' h3s would otherwise sit under 「この単元の目標」 in the outline */}
      {v2 ? <h2 className="sr-only">{t("termsHeading")}</h2> : null}
      {unit.terms.map((tm, i) =>
        v2 ? (
          <Fragment key={tm.id}>
            <TermBlock term={tm} unitId={unit.id} svg={svgs[i] ?? null} locale={locale} v2 />
            {pairsAfter(i).map((p) => (
              <PairBlock key={`${p.a}|${p.b}`} pair={p} terms={unit.terms} locale={locale} />
            ))}
          </Fragment>
        ) : (
          <TermBlock key={tm.id} term={tm} unitId={unit.id} svg={svgs[i] ?? null} locale={locale} />
        ),
      )}

      {keyPoints.length > 0 ? (
        <section data-part="key-points" className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("keyPoints")}</h2>
          <ul className={styles.list}>
            {keyPoints.map((p, i) => (
              <li key={i}>{v2 ? parseInline(p, { key: styles.kw, jp: styles.jpWord }) : p}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <ConfirmBlock ids={confirm} unitId={unit.id} />
      {/* Stage 7 Task 13: every past question of the topic (the confirm set is only 3〜5 of them) */}
      <p data-part="topic-past" className={styles.topicPast}>
        <Link href={`/practice/browse/${unit.topicId}`}>
          {t("topicPast")}
          <span aria-hidden="true"> →</span>
        </Link>
      </p>

      <div className={styles.readRow}>
        <ReadButton unitId={unit.id} />
      </div>

      <nav aria-label={t("pager")} className={styles.pager}>
        {neighbors.prev ? (
          <Link href={`/textbook/${neighbors.prev.unit_id}`} className={styles.pagerBtn}>
            ← {neighbors.prev.title_jp}
          </Link>
        ) : (
          <span />
        )}
        {neighbors.next ? (
          <Link href={`/textbook/${neighbors.next.unit_id}`} className={`${styles.pagerBtn} ${styles.pagerNext}`}>
            {neighbors.next.title_jp} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
