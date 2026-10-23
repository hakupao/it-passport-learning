// D-180 Task 12 — per-topic progress island on the quiz landing (QuizBrowser
// stays a server component). Reads the page's learning record and shows
// `answered/total` plus accuracy for one topic. Until the local record has
// loaded it renders the same slot empty (no misleading 0/N, no layout jump).

"use client";

import { useTranslations } from "next-intl";

import { useLearningRecord } from "@/hooks/useLearningRecord";
import { topicStats } from "@/lib/learning/record";

import styles from "./quiz.module.css";

export function TopicProgress({ topicId, ids }: { topicId: string; ids: string[] }): React.ReactElement {
  const t = useTranslations("Quiz");
  const { record, loaded } = useLearningRecord();
  if (!loaded) return <span className={styles.rowProgress} aria-hidden="true" />;
  const stat = topicStats(record, ids.map((id) => ({ id, topic_id: topicId }))).get(topicId);
  const answered = stat?.answered ?? 0;
  const correct = stat?.correct ?? 0;
  return (
    <span className={styles.rowProgress}>
      {t("progress", {
        answered,
        total: ids.length,
        accuracy: answered > 0 ? correct / answered : 0,
      })}
    </span>
  );
}
