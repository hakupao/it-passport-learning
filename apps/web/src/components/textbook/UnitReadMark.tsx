// D-180 Task 12 — read mark island for one textbook TOC row (TextbookToc stays a
// server component). Shows ✓ + Textbook.read once the learning record has
// loaded and lists the unit in unitsRead; otherwise the same slot stays empty.

"use client";

import { useTranslations } from "next-intl";

import { useLearningRecord } from "@/hooks/useLearningRecord";

import styles from "./reader.module.css";

export function UnitReadMark({ unitId }: { unitId: string }): React.ReactElement {
  const t = useTranslations("Textbook");
  const { record, loaded } = useLearningRecord();
  const read = loaded && Object.prototype.hasOwnProperty.call(record.unitsRead, unitId);
  if (!read) return <span className={styles.readMark} />;
  return (
    <span className={styles.readMark}>
      <span aria-hidden="true">✓</span> {t("read")}
    </span>
  );
}
