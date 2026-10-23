// Stage 7 Phase 1 Task 10 (D-189 §6.2 设置面板 / D-190 §0-12) — /practice without a scope (or with
// prefill=1): choose the scope, the number of questions and the order, then start.
//
//   - Scope (one of): 分野・領域 (the three fields → their topics, multi-select; a field's 「すべて」
//     box selects / clears all its topics) | 年度 (one exam, newest first) | 間違えた問題 | 今日の復習
//     | ランダム. The last three come from the browser's record (practiceSetup: mistakeIds / dueIds /
//     randomIds), so their counts appear only once the record has loaded, and until then 「始める」
//     (and 「前回の条件で続ける」 for such last settings) is disabled with a waiting hint, which goes
//     away by itself when the record arrives.
//   - Count 10 / 20 / 50 / 全部 (全部 = the whole topic / exam; at most 100 for the record-based
//     scopes, MAX_SCOPE_IDS), order 問題番号順 / ランダム (random draws are random already: the order
//     is fixed to 番号順 and disabled for ランダム).
//   - Start (the form's submit) → setupHref with a fresh seed and run nonce → router.push; the
//     settings are saved as the last ones (localStorage itp:practice:last:v1). Nothing to practise →
//     a status line says why, no navigation. Exams come in newest first from the page
//     (examsNewestFirst, shared with the browse page).
//   - 「前回の条件で続ける」 (when last settings are stored): starts them in one click. The last
//     settings are read after mount (never in the first render: no hydration mismatch); without a
//     URL pre-selection they also pre-fill the form.
// Book look: dotted-rule legends, options on rule lines, topics in text columns (no card grid,
// no pills); native radios / checkboxes in ink.

"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link, useRouter } from "@/i18n/navigation";
import { toLocalDay } from "@/lib/learning/schedule";
import { poolFromIndex, type TodayIndex } from "@/lib/practice/practiceIndex";
import { PRACTICE_CATEGORY_LABEL_KEYS, PRACTICE_CATEGORY_ORDER, starText } from "@/lib/practice/practiceLabels";
import {
  SETUP_COUNTS,
  dueIds,
  loadLastSettings,
  mistakeIds,
  saveLastSettings,
  setupHref,
  type SetupKind,
  type SetupSettings,
} from "@/lib/practice/practiceSetup";
import type { StorageLike } from "@/lib/storage";

import styles from "./browse.module.css";

export interface PracticeSetupProps {
  /** the today payload (§0-20; topicTerms unused): topics, ★, question ids, chumon groups, exam labels */
  index: TodayIndex;
  /** every exam, newest first (examsNewestFirst) */
  exams: { id: string; label: string }[];
  /** the settings the form opens with (settingsFromPrefill) */
  initial: SetupSettings;
  /** the URL pre-selected a topic / exam (the last settings then do not replace the form) */
  prefilled: boolean;
}

const RECORD_KINDS: ReadonlySet<SetupKind> = new Set(["mistakes", "due", "random"]);

function browserLocal(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

type Problem = "needTopic" | "needExam" | "emptyScope" | null;

export function PracticeSetup({ index, exams, initial, prefilled }: PracticeSetupProps): React.ReactElement {
  const t = useTranslations("Practice");
  const tm = useTranslations("Mistakes");
  const router = useRouter();
  const { record, loaded } = useLearningRecord();
  const [s, setS] = useState<SetupSettings>(initial);
  const [last, setLast] = useState<SetupSettings | null>(null);
  const [problem, setProblem] = useState<Problem>(null);

  const pool = useMemo(() => poolFromIndex(index), [index]);
  const validTopics = useMemo(() => new Set(index.topics.map((x) => x.id)), [index]);
  const validExams = useMemo(() => new Set(Object.keys(index.exams)), [index]);
  const byCategory = useMemo(
    () =>
      PRACTICE_CATEGORY_ORDER.map((category) => ({ category, topics: index.topics.filter((x) => x.category === category) })).filter(
        (c) => c.topics.length > 0,
      ),
    [index],
  );

  useEffect(() => {
    const stored = loadLastSettings(browserLocal(), validTopics, validExams);
    setLast(stored);
    if (stored && !prefilled) setS(stored);
  }, [validTopics, validExams, prefilled]);

  const counts = useMemo(() => {
    if (!loaded) return null;
    const today = toLocalDay(Date.now());
    return {
      mistakes: mistakeIds(record, pool, today, toLocalDay).length,
      due: dueIds(record, pool, today, toLocalDay).length,
    };
  }, [loaded, record, pool]);

  const update = (patch: Partial<SetupSettings>): void => {
    setProblem(null);
    setS((prev) => ({ ...prev, ...patch }));
  };

  /** a record-based scope cannot start before the record has loaded */
  const waits = (x: SetupSettings): boolean => RECORD_KINDS.has(x.kind) && !loaded;

  function start(settings: SetupSettings): void {
    if (waits(settings)) return;
    if (settings.kind === "topic" && settings.topics.length === 0) return setProblem("needTopic");
    if (settings.kind === "exam" && settings.exam === null) return setProblem("needExam");
    const now = Date.now();
    const href = setupHref(settings, {
      record,
      pool,
      today: toLocalDay(now),
      toDay: toLocalDay,
      seed: Math.floor(Math.random() * 2 ** 32),
      run: now,
    });
    if (href === null) return setProblem("emptyScope");
    saveLastSettings(browserLocal(), settings);
    router.push(href);
  }

  const scopeName = (x: SetupSettings): string =>
    x.kind === "topic"
      ? x.topics.length === 1
        ? (index.topics.find((tp) => tp.id === x.topics[0])?.name_jp ?? t("scope_topic"))
        : t("lastTopics", { n: x.topics.length })
      : x.kind === "exam"
        ? (index.exams[x.exam ?? ""] ?? t("scope_exam"))
        : t(`scope_${x.kind}`);
  const countName = (x: SetupSettings): string => (x.n === "all" ? t("countAll") : t("countN", { n: x.n }));

  const scopeCount = (k: "mistakes" | "due"): string =>
    counts === null ? t("scopeCountLoading") : t("scopeCount", { n: counts[k] });

  return (
    <main className={styles.page} data-setup="">
      <h1 className={styles.title}>{t("setupTitle")}</h1>
      <p className={styles.lead}>{t("setupLead")}</p>

      {last ? (
        <div className={styles.last} data-last="">
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={waits(last)}
            onClick={() => start(last)}
            data-continue-last=""
          >
            {t("continueLast")}
          </button>
          <span>
            {t("lastLabel", { scope: scopeName(last), count: countName(last), order: t(`order_${last.order}`) })}
          </span>
        </div>
      ) : null}

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          start(s);
        }}
      >
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("scopeTitle")}</legend>
          <ul className={styles.options}>
            {(["topic", "exam", "mistakes", "due", "random"] as const).map((k) => (
              <li key={k} className={styles.option}>
                <label className={styles.choice}>
                  <input
                    type="radio"
                    name="scope"
                    value={k}
                    checked={s.kind === k}
                    onChange={() => update({ kind: k, ...(k === "random" ? { order: "seq" as const } : {}) })}
                  />
                  <span>{t(`scope_${k}`)}</span>
                </label>
                {k === "topic" && s.topics.length > 0 ? (
                  <span className={styles.muted}>{t("topicsChosen", { n: s.topics.length })}</span>
                ) : null}
                {k === "mistakes" || k === "due" ? (
                  <span className={styles.muted} data-scope-count={k}>
                    {scopeCount(k)}
                  </span>
                ) : null}
                {k === "mistakes" && counts !== null && counts.mistakes > 0 ? (
                  <Link href="/practice/mistakes" className={`${styles.link} ${styles.small}`} data-mistakes-list="">
                    {tm("viewList")}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>

          {s.kind === "topic" ? (
            <div data-topic-picker="">
              {byCategory.map((c) => {
                const ids = c.topics.map((x) => x.id);
                const all = ids.every((id) => s.topics.includes(id));
                const label = PRACTICE_CATEGORY_LABEL_KEYS[c.category] ? t(PRACTICE_CATEGORY_LABEL_KEYS[c.category]!) : c.category;
                return (
                  <div key={c.category} data-cat={c.category}>
                    <div className={styles.catHead}>
                      <span className={styles.catTag} lang="ja">
                        {label}
                      </span>
                      <label className={styles.choice}>
                        <input
                          type="checkbox"
                          checked={all}
                          aria-label={t("selectAllIn", { category: label })}
                          onChange={() =>
                            update({
                              topics: all
                                ? s.topics.filter((id) => !ids.includes(id))
                                : [...s.topics, ...ids.filter((id) => !s.topics.includes(id))],
                            })
                          }
                        />
                        <span className={styles.muted}>{t("selectAll")}</span>
                      </label>
                    </div>
                    <ul className={styles.topics}>
                      {c.topics.map((x) => {
                        const on = s.topics.includes(x.id);
                        return (
                          <li key={x.id} className={styles.topic} data-topic-option={x.id}>
                            <input
                              id={`setup-topic-${x.id}`}
                              type="checkbox"
                              checked={on}
                              data-topic-input={x.id}
                              onChange={() =>
                                update({ topics: on ? s.topics.filter((id) => id !== x.id) : [...s.topics, x.id] })
                              }
                            />
                            <label htmlFor={`setup-topic-${x.id}`} className={styles.topicName} lang="ja">
                              {x.name_jp}
                            </label>
                            <span className={styles.stars} role="img" aria-label={t("starsAria", { n: x.stars })}>
                              {starText(x.stars)}
                            </span>
                            <span className={`${styles.num} ${styles.muted}`}>{x.questionCount}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : null}

          {s.kind === "exam" ? (
            <select
              className={styles.select}
              aria-label={t("examPick")}
              value={s.exam ?? ""}
              onChange={(e) => update({ exam: e.target.value === "" ? null : e.target.value })}
              lang="ja"
            >
              {s.exam === null ? <option value="">{t("examPick")}</option> : null}
              {exams.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          ) : null}
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("countTitle")}</legend>
          <div className={styles.inline}>
            {SETUP_COUNTS.map((n) => (
              <label key={String(n)} className={styles.choice}>
                <input type="radio" name="n" value={String(n)} checked={s.n === n} onChange={() => update({ n })} />
                <span>{n === "all" ? t("countAll") : t("countN", { n })}</span>
              </label>
            ))}
          </div>
          {RECORD_KINDS.has(s.kind) ? <p className={styles.note}>{t("countCapNote")}</p> : null}
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("orderTitle")}</legend>
          <div className={styles.inline}>
            {(["seq", "rand"] as const).map((o) => (
              <label key={o} className={styles.choice}>
                <input
                  type="radio"
                  name="order"
                  value={o}
                  checked={s.order === o}
                  disabled={s.kind === "random"}
                  onChange={() => update({ order: o })}
                />
                <span>{t(`order_${o}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.actions}>
          <button type="submit" className={styles.btnPrimary} disabled={waits(s)} data-start="">
            {t("start")}
          </button>
          <Link href="/practice/browse" className={styles.link}>
            {t("browseLink")}
          </Link>
        </div>
        <p className={styles.message} role="status" data-problem={waits(s) ? "waitRecord" : (problem ?? "")}>
          {waits(s) ? t("waitRecord") : problem ? t(problem) : null}
        </p>
      </form>
    </main>
  );
}
