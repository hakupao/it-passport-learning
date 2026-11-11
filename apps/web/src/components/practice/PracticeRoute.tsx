// D-217 H1-3 — the body of /[locale]/practice, in the browser: the URL query (useSearchParams) →
// resolvePracticeView over the static data (lib/practice/practiceView, the server page's former
// logic) → the setup panel or the session. A "replace" view (order=rand without a seed, a unit set
// without a run) is router.replace to the same URL plus the nonce, as the server redirect was. Until
// the first view resolves the page shows a loading line; a later query keeps the current view on
// screen until the next one resolves (like the server navigation did). A failed load shows a line
// asking to reload. The session fetches each answered question's explanation (staticData).
// The page wraps this in Suspense (useSearchParams; the static HTML holds the fallback).

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { useRouter } from "@/i18n/navigation";
import { resolvePracticeView, searchParamsOf, type SessionView, type SetupView } from "@/lib/practice/practiceView";
import { staticData } from "@/lib/staticData/client";
import type { StaticLocale } from "@/lib/staticData/shards";

import { PracticeSession } from "./PracticeSession";
import { PracticeSetup } from "./PracticeSetup";
import styles from "./browse.module.css";

type Shown = SetupView | SessionView | "failed" | null;

/** The loading / failed screen of a client-loaded page. */
export function PracticePending({ failed = false }: { failed?: boolean }): React.ReactElement {
  const t = useTranslations("Practice");
  return (
    <main className={styles.page} data-pending={failed ? undefined : ""} data-load-failed={failed ? "" : undefined}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.lead} role="status" aria-busy={!failed}>
        {t(failed ? "loadFailed" : "loading")}
      </p>
    </main>
  );
}

export function PracticeRoute({ locale }: { locale: StaticLocale }): React.ReactElement {
  const params = useSearchParams();
  const query = params?.toString() ?? "";
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [shown, setShown] = useState<Shown>(null);

  useEffect(() => {
    let live = true;
    resolvePracticeView(searchParamsOf(new URLSearchParams(query)), locale, staticData).then(
      (view) => {
        if (!live) return;
        if (view.kind === "replace") routerRef.current.replace({ pathname: "/practice", query: view.query });
        else setShown(view);
      },
      (err: unknown) => {
        console.error("[practice] the static data could not be loaded", err);
        if (live) setShown("failed");
      },
    );
    return () => {
      live = false;
    };
  }, [query, locale]);

  if (shown === null || shown === "failed") return <PracticePending failed={shown === "failed"} />;
  if (shown.kind === "setup") {
    return (
      <PracticeSetup
        key={shown.key}
        index={shown.index}
        exams={shown.exams}
        initial={shown.initial}
        prefilled={shown.prefilled}
      />
    );
  }
  return (
    <PracticeSession
      key={shown.key}
      questions={shown.questions}
      locale={locale}
      termCards={shown.termCards}
      topics={shown.topics}
      folds={shown.folds}
      from={shown.from}
      today={shown.today}
      run={shown.run}
      kindParam={shown.kindParam}
      loadExplanation={staticData.fetchExplanation}
    />
  );
}
