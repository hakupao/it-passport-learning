// Stage 7 Phase 3 (D-196 §0-4) — the explicit 読了 button at the end of a unit (replaces the
// on-mount MarkUnitRead). One-way: unitsRead merges by min, so an undo would be synced back;
// once read it shows 「✓ 読了 M/D」 (the date of the first read, browser-local) and is disabled.
// Until the learning record has loaded it stays disabled (the read state is not known yet).

"use client";

import { useTranslations } from "next-intl";

import { useLearningRecord } from "@/hooks/useLearningRecord";

import styles from "./reader.module.css";

export interface ReadButtonViewProps {
  /** epoch ms of the first read; null when unread */
  readAt: number | null;
  /** the learning record has loaded */
  ready: boolean;
  onRead: () => void;
}

export function ReadButtonView({ readAt, ready, onRead }: ReadButtonViewProps): React.ReactElement {
  const t = useTranslations("Textbook");
  if (readAt !== null) {
    const d = new Date(readAt);
    return (
      <button type="button" data-part="read" className={`${styles.readBtn} ${styles.readBtnDone}`} disabled>
        <span aria-hidden="true">✓</span> {t("readDoneOn", { date: `${d.getMonth() + 1}/${d.getDate()}` })}
      </button>
    );
  }
  return (
    <button type="button" data-part="read" className={styles.readBtn} disabled={!ready} onClick={onRead}>
      {t("readDone")}
    </button>
  );
}

export function ReadButton({ unitId }: { unitId: string }): React.ReactElement {
  const { record, loaded, readUnit } = useLearningRecord();
  const readAt =
    loaded && Object.prototype.hasOwnProperty.call(record.unitsRead, unitId) ? record.unitsRead[unitId]! : null;
  return <ReadButtonView readAt={readAt} ready={loaded} onRead={() => readUnit(unitId)} />;
}
