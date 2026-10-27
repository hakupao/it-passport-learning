// Stage 7 Phase 3 (D-196 §0-1 / §0-6) — the unit-end confirmation questions: pickConfirm's ids
// (3〜5, no chumon group members) as one practice set. Task 3 turns the link into the
// click-time `from=unit&unit=…&run=…` href and applies orderConfirm in the browser.

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import styles from "./reader.module.css";

export function ConfirmBlock({ ids }: { ids: readonly string[] }): React.ReactElement | null {
  const t = useTranslations("Textbook");
  if (ids.length === 0) return null;
  return (
    <section id="confirm" className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("confirmTitle")}</h2>
      <p className={styles.confirmCount}>{t("confirmCount", { n: ids.length })}</p>
      <Link href={`/practice?ids=${ids.join(",")}`} className={styles.confirmStart}>
        {t("confirmStart")}
        <span aria-hidden="true"> →</span>
      </Link>
    </section>
  );
}
