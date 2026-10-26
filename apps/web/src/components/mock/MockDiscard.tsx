// Stage 7 Phase 2 Task 4 fix round 2 — the escape hatch for a stored mock that still owes its answers
// to the record (owesRecord) but should go anyway (e.g. it cannot be opened after a data update):
// a secondary 「記録せずに破棄」 button that first opens an in-page confirmation (no modal, no
// confirm()) warning that the answers will not reach the learning record.

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import styles from "./mock.module.css";

export function MockDiscard({ onDiscard }: { onDiscard: () => void }): React.ReactElement {
  const t = useTranslations("Mock");
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button type="button" className={styles.btn} onClick={() => setAsking(true)} data-discard="">
        {t("discardOwed")}
      </button>
    );
  }
  return (
    <section className={styles.confirm} aria-labelledby="mock-discard-title" data-discard-confirm="">
      <h3 id="mock-discard-title" className={styles.confirmTitle}>
        {t("discardWarn")}
      </h3>
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={onDiscard} data-discard-yes="">
          {t("discardYes")}
        </button>
        <button type="button" className={styles.btnPrimary} onClick={() => setAsking(false)}>
          {t("discardNo")}
        </button>
      </div>
    </section>
  );
}
