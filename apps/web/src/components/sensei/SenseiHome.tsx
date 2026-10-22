// D-181 Task A5 / §0-10 — the /[locale]/sensei page body: key settings (with how
// to get a key while none is saved), the saved threads of this browser (newest
// first; each deletable) and the free question (Phase C, §0-9).
//
// Thread rows: a question / review / term / unit thread links back to its source —
// a review thread to its topic set with its date, `&thread=<YYYY-MM-DD>`, never
// `review=1`; a term / unit thread to its glossary term / textbook unit page. A free
// thread opens in place, in the AI 先生 panel on this page, with its anchor derived
// again from its stored first question (lib/sensei/freeQuestion).
//
// Free question: each send is a new thread (`free:<epoch ms base 36>`). The terms of
// the question are matched against `termIndex` (the light dictionary index the page
// builds at prerender), their cards are fetched from /api/sensei/terms, and the panel
// opens with the question as its opener (sent once into the empty thread); on close,
// focus returns to the input. Sending needs a saved key. If the cards cannot be fetched nothing is sent, the question
// stays and a notice is shown.
//
// The AI SDK is not in this page's first load: the panel (and through useSensei the
// SDK, after lib/sensei/zodJitless) is loaded via next/dynamic in SenseiHost when it
// first opens, and preloaded when the free-question input is first focused.
//
// Like KeySettings, the first render (server and client) shows no threads; the
// index is read after mount, so there is no hydration mismatch.

"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { hasLocale, useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import type { TermIndexEntry } from "@/lib/glossary/dictionary";
import { deriveFreeAnchor, fetchTermCards, firstUserText, freeAnchorId, freeThreadTitle } from "@/lib/sensei/freeQuestion";
import { questionThreadHref, reviewThreadHref, termThreadHref, unitThreadHref } from "@/lib/sensei/threadLinks";
import {
  deleteThread,
  listThreads,
  loadThreadMessages,
  MAX_THREADS,
  type ThreadKind,
  type ThreadMeta,
} from "@/lib/sensei/threadStore";
import type { StorageLike } from "@/lib/storage";

import { SenseiHost, useSenseiHost } from "./AskSensei";
import { KeySettings } from "./KeySettings";

/** Where a saved thread links back to: its question, topic set, glossary term or textbook unit
 *  (null: a free thread, which opens in place). */
const THREAD_HREF: Record<ThreadKind, (anchorId: string) => string | null> = {
  question: questionThreadHref,
  review: reviewThreadHref,
  term: termThreadHref,
  unit: unitThreadHref,
  free: () => null,
};

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

/** Preload the panel chunk (and with it the AI SDK) ahead of the first send. */
function preloadPanel(): void {
  void import("./SenseiPanel");
}

export function SenseiHome({ termIndex }: { termIndex: TermIndexEntry[] }): React.ReactElement {
  const [threads, setThreads] = useState<ThreadMeta[] | null>(null);

  const refresh = useCallback((): void => {
    const storage = browserStorage();
    setThreads(storage ? listThreads(storage) : []);
  }, []);

  useEffect(refresh, [refresh]);

  return (
    <SenseiHost onClose={refresh}>
      <SenseiHomeBody termIndex={termIndex} threads={threads} refresh={refresh} />
    </SenseiHost>
  );
}

function SenseiHomeBody({
  termIndex,
  threads,
  refresh,
}: {
  termIndex: TermIndexEntry[];
  threads: ThreadMeta[] | null;
  refresh: () => void;
}): React.ReactElement {
  const t = useTranslations("Sensei");
  const rawLocale = useLocale();
  const locale: AppLocale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
  const openFor = useSenseiHost();
  const freeId = useId();
  const [hasKey, setHasKey] = useState(false);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [failedAt, setFailedAt] = useState<"free" | "threads" | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function remove(id: string): void {
    const storage = browserStorage();
    if (storage) deleteThread(storage, id);
    refresh();
  }

  const anchorFor = (q: string): Promise<string> =>
    deriveFreeAnchor(q, termIndex, locale, (ids) => fetchTermCards(ids, locale));

  async function sendFree(): Promise<void> {
    const q = question.trim();
    if (q === "" || pending || !hasKey || !openFor) return;
    setPending(true);
    setFailedAt(null);
    preloadPanel();
    try {
      const anchorText = await anchorFor(q);
      openFor(
        { kind: "free", anchorId: freeAnchorId(Date.now()), title: freeThreadTitle(q), anchorText, opener: q },
        inputRef.current ?? document.body,
      );
      setQuestion("");
    } catch {
      setFailedAt("free");
    } finally {
      setPending(false);
    }
  }

  async function reopen(th: ThreadMeta, trigger: HTMLElement): Promise<void> {
    if (pending || !openFor) return;
    setPending(true);
    setFailedAt(null);
    preloadPanel();
    try {
      const storage = browserStorage();
      const first = storage ? firstUserText(loadThreadMessages(storage, th.id)) : "";
      const anchorText = await anchorFor(first);
      openFor({ kind: "free", anchorId: th.anchorId, title: th.title, anchorText }, trigger);
    } catch {
      setFailedAt("threads");
    } finally {
      setPending(false);
    }
  }

  const canSend = hasKey && !pending && question.trim() !== "";

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
        {failedAt === "threads" ? (
          <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-800" data-testid="sensei-reopen-failed">
            {t("freeTermsFailed")}
          </p>
        ) : null}
        {threads !== null && threads.length === 0 && (
          <p className="text-sm opacity-70" data-testid="sensei-threads-empty">
            {t("threadsEmpty")}
          </p>
        )}
        {threads !== null && threads.length > 0 && (
          <ul className="divide-y rounded-md border" data-testid="sensei-threads">
            {threads.map((th) => {
              const href = THREAD_HREF[th.kind](th.anchorId);
              return (
                <li key={th.id} className="flex items-center gap-3 p-3" data-testid="sensei-thread">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {href ? (
                        <Link href={href} className="underline">
                          {th.title}
                        </Link>
                      ) : th.kind === "free" ? (
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          className="max-w-full truncate text-left underline"
                          data-testid="sensei-thread-open"
                          onClick={(e) => void reopen(th, e.currentTarget)}
                        >
                          {th.title}
                        </button>
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
          {t("freeTitle")}
        </h2>
        <p id={`${freeId}-hint`} className="text-xs opacity-70">
          {t("freeHint")}
        </p>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            void sendFree();
          }}
        >
          <label htmlFor={freeId} className="sr-only">
            {t("freeLabel")}
          </label>
          <textarea
            id={freeId}
            ref={inputRef}
            rows={3}
            data-testid="sensei-free-input"
            placeholder={t("freePlaceholder")}
            aria-describedby={`${freeId}-hint`}
            className="w-full resize-none rounded-md border bg-transparent p-2 text-sm"
            value={question}
            onFocus={preloadPanel}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void sendFree();
              }
            }}
          />
          {failedAt === "free" ? (
            <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-800" data-testid="sensei-free-failed">
              {t("freeTermsFailed")}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs opacity-70">{hasKey ? t("sendHint") : t("keyMissing")}</span>
            <Button type="submit" disabled={!canSend} data-testid="sensei-free-send">
              {t("send")}
            </Button>
          </div>
        </form>
      </section>

    </div>
  );
}
