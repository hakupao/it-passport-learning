// Stage 7 Phase 3 (D-196 §0-4) — the explicit 読了 button at the end of a unit (replaces the
// on-mount MarkUnitRead). One-way: unitsRead merges by min, so an undo would be synced back.
// Unread → a button (disabled until the learning record has loaded: the read state is not known
// yet). Read → not a button but a status line 「✓ 読了 M/D」 (the first read, browser-local; en
// via Intl, e.g. "Oct 7"); after the click focus moves onto that status so it is announced and
// focus does not fall back to <body>.

"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { useLearningRecord } from "@/hooks/useLearningRecord";

import styles from "./reader.module.css";

export interface ReadButtonViewProps {
  /** epoch ms of the first read; null when unread */
  readAt: number | null;
  /** the learning record has loaded */
  ready: boolean;
  onRead: () => void;
  statusRef?: React.Ref<HTMLParagraphElement>;
}

/** The read date as the status shows it: en "Oct 7", ja / zh "10/7" (browser-local day). */
export function readDate(at: number, locale: string): string {
  const d = new Date(at);
  return locale === "en"
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(d)
    : `${d.getMonth() + 1}/${d.getDate()}`;
}

export function ReadButtonView({ readAt, ready, onRead, statusRef }: ReadButtonViewProps): React.ReactElement {
  const t = useTranslations("Textbook");
  const locale = useLocale();
  if (readAt !== null) {
    return (
      <p ref={statusRef} role="status" tabIndex={-1} data-part="read" className={styles.readDone}>
        <span aria-hidden="true">✓</span> {t("readDoneOn", { date: readDate(readAt, locale) })}
      </p>
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
  const clicked = useRef(false);
  const status = useRef<HTMLParagraphElement>(null);
  const readAt =
    loaded && Object.prototype.hasOwnProperty.call(record.unitsRead, unitId) ? record.unitsRead[unitId]! : null;
  useEffect(() => {
    if (readAt !== null && clicked.current) {
      clicked.current = false;
      status.current?.focus();
    }
  }, [readAt]);
  return (
    <ReadButtonView
      readAt={readAt}
      ready={loaded}
      statusRef={status}
      onRead={() => {
        clicked.current = true;
        readUnit(unitId);
      }}
    />
  );
}
