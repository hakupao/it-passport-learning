// Stage 7 Phase 3 (D-196 §0-1 / §0-6) — the unit-end confirmation questions: pickConfirm's ids
// (3〜5, no chumon group members) as one practice set: UnitPracticeLink (from=unit, click-time
// run, orderConfirm once the record has loaded).

import { useTranslations } from "next-intl";

import styles from "./reader.module.css";
import { UnitPracticeLink } from "./UnitPracticeLink";

export function ConfirmBlock({ ids, unitId }: { ids: readonly string[]; unitId: string }): React.ReactElement | null {
  const t = useTranslations("Textbook");
  if (ids.length === 0) return null;
  return (
    <section id="confirm" className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("confirmTitle")}</h2>
      <p className={styles.confirmCount}>{t("confirmCount", { n: ids.length })}</p>
      <UnitPracticeLink ids={ids} unitId={unitId} order className={styles.confirmStart}>
        {t("confirmStart")}
        <span aria-hidden="true"> →</span>
      </UnitPracticeLink>
    </section>
  );
}
