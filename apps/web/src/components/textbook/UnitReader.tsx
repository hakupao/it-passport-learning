// Stage 6 (Session 85) — production single-unit reader; Stage 7 Phase 3 (D-196 §0-4〜§0-6):
// single column in the D-195 skeleton over the reader model (normalizeUnit).
//
// Async server component, single-language per the active locale. Order: header
// (breadcrumb → h1 → meta → 「AI 先生に聞く」 → term index) → each term (TermBlock) →
// 要点 (summary.key_points) → 確認問題 (#confirm, pickConfirm's ids) → 「読了」 → in-topic
// prev/next. Not shown (§0-6): overview.intro, summary.memory_hooks, fallback inline_quiz.
// The unit is marked read only by the 読了 button (§0-4; the page mounts the
// LearningRecordProvider).

import { getTranslations } from "next-intl/server";

import { AskSensei, SenseiHost } from "@/components/sensei/AskSensei";
import { Link } from "@/i18n/navigation";
import { pastCount } from "@/lib/textbook/confirm";
import {
  loadGeneratedSvg,
  toDataLang,
  type ReaderUnit,
  type UnitNeighbors,
  type UnitPlace,
} from "@/lib/textbook/reader";

import { ConfirmBlock } from "./ConfirmBlock";
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

  return (
    <main className={`${styles.page} ${styles.unitPage}`}>
      <UnitHeader unit={unit} place={place} locale={locale} pastCount={pastCount(unit)}>
        <SenseiHost>
          <div className={styles.askSensei}>
            <AskSensei kind="unit" anchorId={unit.id} title={title} anchorText={senseiAnchorText} />
          </div>
        </SenseiHost>
      </UnitHeader>

      {unit.terms.map((tm, i) => (
        <TermBlock key={tm.id} term={tm} svg={svgs[i] ?? null} locale={locale} />
      ))}

      {keyPoints.length > 0 ? (
        <section data-part="key-points" className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("keyPoints")}</h2>
          <ul className={styles.list}>
            {keyPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <ConfirmBlock ids={confirm} />

      <p className={styles.readRow}>
        <ReadButton unitId={unit.id} />
      </p>

      <nav className={styles.pager}>
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
