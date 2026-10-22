// D-181 Task A5 / §0-10 — the /[locale]/sensei page body: key settings (with how
// to get a key while none is saved), the saved threads of this browser (newest
// first, each linking back to its source — a review thread to its topic set,
// without `review=1` — each deletable) and the free-question
// input, disabled until Phase C (「近日公開」).
//
// Phase A loads no AI SDK here: nothing on this page sends a message, and the SDK
// would need lib/sensei/zodJitless imported first to stay inside the production
// CSP. Only the storage modules (keyStore, threadStore) are imported.
//
// Like KeySettings, the first render (server and client) shows no threads; the
// index is read after mount, so there is no hydration mismatch.

"use client";

import { useEffect, useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { questionThreadHref, reviewThreadHref } from "@/lib/sensei/threadLinks";
import { deleteThread, listThreads, MAX_THREADS, type ThreadMeta } from "@/lib/sensei/threadStore";
import type { StorageLike } from "@/lib/storage";

import { KeySettings } from "./KeySettings";

const KEYS_URL = "https://console.anthropic.com/settings/keys";

/** window.localStorage, or null where reading the property itself throws (blocked storage). */
function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function formatTime(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function SenseiHome(): React.ReactElement {
  const t = useTranslations("Sensei");
  const locale = useLocale();
  const freeId = useId();
  const [hasKey, setHasKey] = useState(false);
  const [threads, setThreads] = useState<ThreadMeta[] | null>(null);

  function refresh(): void {
    const storage = browserStorage();
    setThreads(storage ? listThreads(storage) : []);
  }

  useEffect(refresh, []);

  function remove(id: string): void {
    const storage = browserStorage();
    if (storage) deleteThread(storage, id);
    refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-xl font-bold">{t("panelTitle")}</h1>
        <p className="text-sm opacity-70">{t("pageIntro")}</p>
      </header>

      <div className="space-y-2">
        <KeySettings onChange={setHasKey} />
        {!hasKey && (
          <p className="text-sm" data-testid="sensei-key-howto">
            {t("keyHowTo")}{" "}
            <a href={KEYS_URL} target="_blank" rel="noopener noreferrer" className="underline">
              {t("keyHowToLink")}
            </a>
          </p>
        )}
      </div>

      <section className="space-y-2" aria-labelledby="sensei-threads-title">
        <h2 id="sensei-threads-title" className="text-base font-semibold">
          {t("threadsTitle")}
        </h2>
        <p className="text-xs opacity-70">{t("threadsNote", { max: MAX_THREADS })}</p>
        {threads !== null && threads.length === 0 && (
          <p className="text-sm opacity-70" data-testid="sensei-threads-empty">
            {t("threadsEmpty")}
          </p>
        )}
        {threads !== null && threads.length > 0 && (
          <ul className="divide-y rounded-md border" data-testid="sensei-threads">
            {threads.map((th) => {
              const href =
                th.kind === "question"
                  ? questionThreadHref(th.anchorId)
                  : th.kind === "review"
                    ? reviewThreadHref(th.anchorId)
                    : null;
              return (
                <li key={th.id} className="flex items-center gap-3 p-3" data-testid="sensei-thread">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {href ? (
                        <Link href={href} className="underline">
                          {th.title}
                        </Link>
                      ) : (
                        th.title
                      )}
                    </p>
                    <p className="text-xs opacity-70">
                      <span>{t(`kind_${th.kind}`)}</span>
                      {" · "}
                      <time dateTime={th.updatedAt}>{formatTime(th.updatedAt, locale)}</time>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={t("threadDeleteLabel", { title: th.title })}
                    onClick={() => remove(th.id)}
                  >
                    {t("threadDelete")}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-2" aria-labelledby="sensei-free-title">
        <h2 id="sensei-free-title" className="text-base font-semibold">
          {t("freeTitle")}{" "}
          <span className="rounded border px-1.5 py-0.5 text-xs font-normal opacity-70" data-testid="sensei-coming-soon">
            {t("comingSoon")}
          </span>
        </h2>
        <label htmlFor={freeId} className="sr-only">
          {t("freeLabel")}
        </label>
        <textarea
          id={freeId}
          rows={3}
          disabled
          placeholder={t("freePlaceholder")}
          className="w-full resize-none rounded-md border bg-transparent p-2 text-sm opacity-60"
        />
        <div className="flex justify-end">
          <Button type="button" disabled>
            {t("send")}
          </Button>
        </div>
      </section>
    </div>
  );
}
