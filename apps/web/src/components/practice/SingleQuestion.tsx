// Stage 7 Phase 1 Task 10 (D-189 §4 /practice/q/<qid>) — one question as a reference view: where the
// summary's wrong list, an AI 先生 reply's `#<question_id>` outside the group and the old
// `#<question_id>` links land.
//
//   - The face (PracticeQuestion, readOnly): on the latest attempt's choice once the record has loaded
//     (○ / × as after answering); never answered → no choice is "yours", the keyed answer carries ○.
//     Picking does nothing here — 「この問題を練習する」 (/practice?ids=<qid>; a 中問 member brings its
//     whole group, the practice page expands it) is the way to answer again.
//   - The explanation always (ExplanationPane reveal): "← あなたの答え" only on the latest choice; the
//     「AI 先生に聞く」 anchor is `<qid>:<choice>` or `<qid>:reveal`. The 解答栏 under the face.
//   - 解答の記録: the stored attempts (≤ 10), newest first, ○ / ×, the choice and the local date —
//     after the record has loaded (the list keeps a minimum height before).
//   - Translation: shown by default when settings.transDefault = "shown"; the toggle is not saved.

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { SenseiHost } from "@/components/sensei/AskSensei";
import { useLearningRecord } from "@/hooks/useLearningRecord";
import { Link } from "@/i18n/navigation";
import type { TermCard } from "@/lib/glossary/dictionary";
import { latestResult, settingValue } from "@/lib/learning/record";
import type { Stars } from "@/lib/practice/practiceIndex";
import { PRACTICE_CATEGORY_LABEL_KEYS } from "@/lib/practice/practiceLabels";
import { attemptHistory } from "@/lib/practice/practiceRows";
import { localDateKey, recentResults } from "@/lib/practice/practiceSession";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

import { AnswerBar } from "./AnswerBar";
import styles from "./browse.module.css";
import { ExplanationPane } from "./ExplanationPane";
import { FreshLink } from "./FreshLink";
import { PracticeQuestion } from "./PracticeQuestion";
import session from "./session.module.css";

export interface SingleQuestionProps {
  q: QuizQuestion;
  locale: string;
  isOwner: boolean;
  termCards: Record<string, TermCard>;
  stars: Stars;
  topic: { id: string; category: string; /** JP 「中分類 › 小分類」 */ path: string };
}

export function SingleQuestion({ q, locale, isOwner, termCards, stars, topic }: SingleQuestionProps): React.ReactElement {
  const t = useTranslations("Practice");
  const { record, loaded } = useLearningRecord();
  const [trOverride, setTrOverride] = useState<boolean | null>(null);
  const latest = loaded ? latestResult(record, q.id) : undefined;
  const picked = latest?.choice ?? null;
  const history = loaded ? attemptHistory(record, q.id) : [];
  const showTranslation = trOverride ?? settingValue(record, "transDefault") === "shown";
  const catKey = PRACTICE_CATEGORY_LABEL_KEYS[topic.category];

  return (
    <SenseiHost>
      <main className={session.session} data-single={q.id}>
        <h1 className="sr-only" lang="ja">
          {q.source_label}
        </h1>
        <div className={session.topBar}>
          {catKey ? (
            <span className={session.catTag} lang="ja">
              {t(catKey)}
            </span>
          ) : null}
          <Link href={`/practice/browse/${topic.id}`} className={`${session.path} ${styles.link}`} lang="ja">
            {topic.path}
          </Link>
        </div>
        <p className={styles.lead}>{t("singleLead")}</p>

        <div className={session.columns}>
          <div className={session.faceCol}>
            <PracticeQuestion
              key={q.id}
              q={q}
              locale={locale}
              picked={picked}
              onPick={() => {}}
              readOnly
              recent={recentResults(loaded ? record.attempts[q.id] : undefined, picked !== null)}
              stars={stars}
              showTranslation={showTranslation}
              onToggleTranslation={() => setTrOverride(!showTranslation)}
              preambleChars={null}
              foldPreamble={false}
            />
            <div className={styles.singleFooter}>
              <AnswerBar q={q} />
              <FreshLink href={`/practice?ids=${q.id}`} className={styles.btnPrimary}>
                {t("practiceThis")}
              </FreshLink>
            </div>

            <h2 className={styles.h2}>{t("historyTitle")}</h2>
            {loaded && history.length === 0 ? (
              <p className={styles.lead} data-history-none="">
                {t("historyNone")}
              </p>
            ) : (
              <ol className={styles.history} data-history="">
                {history.map((a) => (
                  <li key={`${a.at}-${a.choice}`} className={styles.historyRow} data-history-at={a.at}>
                    <time dateTime={new Date(a.at).toISOString()}>{localDateKey(new Date(a.at))}</time>
                    <span className={`${styles.result} ${a.correct ? styles.resultRight : styles.resultWrong}`}>
                      <span aria-hidden="true">{a.correct ? "○" : "×"}</span>
                      <span className="sr-only">{t(a.correct ? "resultRight" : "resultWrong")}</span>
                    </span>
                    <span>
                      {t("historyChoice")}
                      <span className={styles.letterInk} lang="ja">
                        {a.choice}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className={session.explCol}>
            <ExplanationPane
              key={q.id}
              q={q}
              locale={locale}
              picked={picked}
              termCards={termCards}
              isOwner={isOwner}
              reveal
            />
          </div>
        </div>
      </main>
    </SenseiHost>
  );
}
