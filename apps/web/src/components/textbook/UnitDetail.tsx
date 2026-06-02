// Stage 4 step3 — full unit renderer (4-part structure: overview / terms / summary / challenge).
//
// Async server component: figures are read from disk and inlined here.
//  - generated Mermaid SVG  → inlined as markup (trusted, self-generated content)
//  - source exam PNG        → inlined as base64 data-URI
// inline_quiz / challenge ids are listed with a resolution badge (against question_bank).

import { loadGeneratedSvg, loadSourcePngDataUri } from "@/lib/textbook/loader";
import type { TextbookUnit } from "@/lib/textbook/types";

import styles from "./textbook.module.css";
import { TrilingualList, TrilingualText } from "./Trilingual";

function QuizRefs({ ids, resolved }: { ids: string[]; resolved: Set<string> }) {
  if (ids.length === 0) return <span className={styles.mono}>（なし）</span>;
  return (
    <div className={styles.quizRow}>
      {ids.map((id) => {
        const ok = resolved.has(id);
        return (
          <code
            key={id}
            className={`${styles.chip} ${ok ? styles.chipOk : styles.chipDead}`}
            title={ok ? "resolved in question_bank" : "NOT FOUND in question_bank"}
          >
            {id}
            {ok ? "" : " ✗"}
          </code>
        );
      })}
    </div>
  );
}

export async function UnitDetail({
  unit,
  resolvedIds,
}: {
  unit: TextbookUnit;
  resolvedIds: Set<string>;
}) {
  // Preload all figure assets before rendering.
  const termSvgs = await Promise.all(
    unit.terms.map((t) =>
      t.figure ? loadGeneratedSvg(t.figure.svg_path) : Promise.resolve(null),
    ),
  );
  const sourceImgs = await Promise.all(
    (unit.source_figures ?? []).map((s) => loadSourcePngDataUri(s.figure_path)),
  );

  return (
    <div>
      {/* ---- header ---- */}
      <h1 className={styles.h1}>
        {unit.title_jp}
        <span className={styles.badge}>{unit.overview.freq_badge}</span>
        <span className={styles.badge}>~{unit.overview.est_minutes}min</span>
      </h1>
      <p className={styles.sub}>
        <span className={styles.mono}>{unit.unit_id}</span> · topic{" "}
        <span className={styles.mono}>{unit.topic_id}</span> · schema{" "}
        <span className={styles.mono}>{unit.schema_version}</span> · lang_status{" "}
        <span className={styles.mono}>
          jp:{unit.lang_status.jp} zh:{unit.lang_status.zh} en:{unit.lang_status.en}
        </span>
        {unit.prerequisites.length > 0 ? (
          <>
            {" "}
            · prereq{" "}
            <span className={styles.mono}>{unit.prerequisites.join(", ")}</span>
          </>
        ) : null}
      </p>
      <TrilingualText
        jp={unit.title_jp}
        zh={unit.title_zh}
        en={unit.title_en}
        label="title"
      />
      <TrilingualText
        jp={unit.unit_summary_jp}
        zh={unit.unit_summary_zh}
        en={unit.unit_summary_en}
        label="unit_summary"
      />

      {/* ---- overview ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>① 概要 / Overview</h2>
        <TrilingualText
          jp={unit.overview.intro_jp}
          zh={unit.overview.intro_zh}
          en={unit.overview.intro_en}
          label="intro"
        />
      </section>

      {/* ---- terms ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          ② 用語講解 / Terms ({unit.terms.length})
        </h2>
        {unit.terms.map((t, i) => (
          <div key={t.term} className={styles.term}>
            <p className={styles.termName}>
              {t.term} <span className="zh">／ {t.term_zh}</span>{" "}
              <span className="en">／ {t.term_en}</span>
            </p>
            <TrilingualText
              jp={t.definition_jp}
              zh={t.definition_zh}
              en={t.definition_en}
              label="definition"
            />
            <TrilingualText
              jp={t.explanation_jp}
              zh={t.explanation_zh}
              en={t.explanation_en}
              label="explanation"
            />
            <TrilingualText
              jp={t.analogy_jp}
              zh={t.analogy_zh}
              en={t.analogy_en}
              label="analogy (例え)"
            />
            <TrilingualText
              jp={t.memory_hook_jp}
              zh={t.memory_hook_zh}
              en={t.memory_hook_en}
              label="memory hook (○○といえば××)"
            />
            {t.figure && termSvgs[i] ? (
              <div className={styles.figure}>
                {/* Trusted, self-generated Mermaid SVG from our own pipeline. */}
                <div dangerouslySetInnerHTML={{ __html: termSvgs[i] as string }} />
                <div className={styles.figCaption}>
                  generated figure · {t.figure.svg_path}
                </div>
              </div>
            ) : t.figure ? (
              <div className={`${styles.figure} ${styles.fail}`}>
                ⚠ figure unresolved: {t.figure.svg_path}
              </div>
            ) : null}
            <div className={styles.fieldLabel}>即時チェック (inline_quiz)</div>
            <QuizRefs ids={t.inline_quiz ?? []} resolved={resolvedIds} />
          </div>
        ))}
      </section>

      {/* ---- summary ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>③ まとめ / Summary</h2>
        <TrilingualList
          jp={unit.summary.key_points_jp}
          zh={unit.summary.key_points_zh}
          en={unit.summary.key_points_en}
          label="key points"
        />
        <div style={{ height: "1rem" }} />
        <TrilingualList
          jp={unit.summary.memory_hooks_jp}
          zh={unit.summary.memory_hooks_zh}
          en={unit.summary.memory_hooks_en}
          label="memory hooks"
        />
      </section>

      {/* ---- challenge ---- */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>④ チャレンジ問題 / Challenge</h2>
        <QuizRefs ids={unit.challenge_questions ?? []} resolved={resolvedIds} />
      </section>

      {/* ---- source figures (traceability) ---- */}
      {(unit.source_figures ?? []).length > 0 ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            source_figures (溯源 / Stage 2 origin)
          </h2>
          {unit.source_figures.map((s, i) => (
            <div key={s.figure_path} className={styles.figure}>
              <div className={styles.figCaption}>
                {s.figure_type} · {s.question_id} · {s.figure_path}
                {s.figure_description ? ` · ${s.figure_description}` : ""}
              </div>
              {sourceImgs[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.sourceImg}
                  src={sourceImgs[i] as string}
                  alt={s.question_id}
                />
              ) : (
                <div className={styles.fail}>⚠ png unresolved: {s.figure_path}</div>
              )}
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
