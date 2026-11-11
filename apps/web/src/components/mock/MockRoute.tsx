// D-217 H1-3 — the body of /[locale]/mock/run, in the browser: the URL query (useSearchParams) →
// resolveMockView over the static data (lib/mock/mockView, the server page's former logic) → MockRun.
// No scope → router.replace("/mock") (was a server redirect); an unknown exam or an id without a
// question → notFound() (the not-found page, rendered client-side: the response itself is the
// static page). Until the questions resolve it shows MockRun's own pending screen; a failed load,
// a line asking to reload. The page wraps this in Suspense (useSearchParams).

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { notFound, useSearchParams } from "next/navigation";

import { useRouter } from "@/i18n/navigation";
import { resolveMockView, type MockRunView } from "@/lib/mock/mockView";
import { searchParamsOf } from "@/lib/practice/practiceView";
import { staticData } from "@/lib/staticData/client";
import type { StaticLocale } from "@/lib/staticData/shards";

import { MockRun } from "./MockRun";
import styles from "./mock.module.css";

/** MockRun's pending screen (data-pending), or the load failure. */
export function MockPending({ failed = false }: { failed?: boolean }): React.ReactElement {
  const t = useTranslations("Mock");
  const tp = useTranslations("Practice");
  return (
    <main className={styles.page} data-pending={failed ? undefined : ""} data-load-failed={failed ? "" : undefined}>
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.lead}>{failed ? tp("loadFailed") : t("loading")}</p>
    </main>
  );
}

export function MockRoute({ locale }: { locale: StaticLocale }): React.ReactElement {
  const params = useSearchParams();
  const query = params?.toString() ?? "";
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [shown, setShown] = useState<MockRunView | "notFound" | "failed" | null>(null);

  useEffect(() => {
    let live = true;
    resolveMockView(searchParamsOf(new URLSearchParams(query)), locale, staticData).then(
      (view) => {
        if (!live) return;
        if (view.kind === "replace") routerRef.current.replace(view.href);
        else setShown(view.kind === "notFound" ? "notFound" : view);
      },
      (err: unknown) => {
        console.error("[mock] the static data could not be loaded", err);
        if (live) setShown("failed");
      },
    );
    return () => {
      live = false;
    };
  }, [query, locale]);

  if (shown === "notFound") notFound();
  if (shown === null || shown === "failed") return <MockPending failed={shown === "failed"} />;
  return (
    <MockRun
      key={shown.key}
      kind={shown.scopeKind}
      examId={shown.examId}
      examLabel={shown.examLabel}
      questions={shown.questions}
      locale={locale}
      folds={shown.folds}
      stars={shown.stars}
    />
  );
}
