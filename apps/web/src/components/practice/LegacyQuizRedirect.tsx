// Stage 7 Phase 1 Task 13 (DESIGN §4) — the legacy /quiz page's client redirect. Only the browser
// sees the `#<question_id>` fragment, so this island reads location.search + hash once, computes the
// target (legacyQuizTarget) and replaces the history entry through the i18n router (locale kept).
// Before that (SSR, no JS) it shows one line and a plain link, which points at the browse page until
// the effect has computed the real target. It never writes a review intent: a bookmarked
// `?review=1` only opens the review panel on the topic page, it does not send (D-181 Phase B).

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/navigation";
import { legacyQuizTarget } from "@/lib/practice/legacyLinks";

import styles from "./legacy.module.css";

export function LegacyQuizRedirect({ locale }: { locale: string }): React.ReactElement {
  const t = useTranslations("Practice");
  const router = useRouter();
  const [target, setTarget] = useState("/practice/browse");

  useEffect(() => {
    const to = legacyQuizTarget(window.location.search, window.location.hash);
    setTarget(to);
    router.replace(to);
  }, [router]);

  return (
    <main className={styles.legacy}>
      <p role="status">{t("legacyMoving")}</p>
      <p>
        <Link href={target} locale={locale}>
          {t("legacyOpen")}
        </Link>
      </p>
    </main>
  );
}
