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
// builds at prerender), their senses are fetched from /api/sensei/terms, and the panel
// opens with the question as its opener (sent once into the empty thread); on close,
// focus returns to the input. Sending needs a saved key (the disabled Send is described
// by the key-missing reason). While the terms load the input is read-only and the form
// aria-busy. If the terms cannot be fetched nothing is sent, the question stays and a
// notice is shown. A free thread whose first question cannot be read back (no stored
// user message, or storage unavailable) does not open: its own notice is shown.
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
import { deriveFreeAnchor, fetchTermContexts, firstUserText, freeAnchorId, freeThreadTitle } from "@/lib/sensei/freeQuestion";
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
  // "free": the free question's terms failed to load; "threads": a reopened free thread's
  // terms failed to load; "threadMissing": its first question could not be read back
  const [failedAt, setFailedAt] = useState<"free" | "threads" | "threadMissing" | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function remove(id: string): void {
    const storage = browserStorage();
    if (storage) deleteThread(storage, id);
    refresh();
  }

  const anchorFor = (q: string): Promise<string> =>
    deriveFreeAnchor(q, termIndex, locale, (ids) => fetchTermContexts(ids, locale));

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
    setFailedAt(null);
    // The anchor is derived from the first question; without it the thread would open
    // on a different (no-match) anchor than it was asked with.
    const storage = browserStorage();
    const first = storage ? firstUserText(loadThreadMessages(storage, th.id)) : "";
    if (first.trim() === "") {
      setFailedAt("threadMissing");
      return;
    }
    setPending(true);
    preloadPanel();
    try {
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
    <main className="mx-auto max-w-3xl space-y-10 pt-8 pb-14 text-ink">
      <header>
        <h1 className="border-b-2 border-dotted border-spot pb-2 text-[28px] leading-snug font-bold">{t("panelTitle")}</h1>
        <p className="mt-3 text-sm">{t("pageIntro")}</p>
      </header>

      <div className="space-y-2">
        <KeySettings onChange={setHasKey} />
        {!hasKey && (
          <p className="text-sm" data-testid="sensei-key-howto">
            {t("keyHowTo")}{" "}
            <a href={KEYS_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-[3px] decoration-ink-muted hover:decoration-ink">
              {t("keyHowToLink")}
            </a>
          </p>
        )}
      </div>

      <section className="space-y-2" aria-labelledby="sensei-threads-title">
        <h2 id="sensei-threads-title" className="border-b-2 border-dotted border-spot pb-1.5 text-[17px] font-bold">
          {t("threadsTitle")}
        </h2>
        <p className="text-xs text-ink-muted">{t("threadsNote", { max: MAX_THREADS })}</p>
        {failedAt === "threads" ? (
          <p role="alert" className="border border-spot bg-tint p-2 text-sm text-ink" data-testid="sensei-reopen-failed">
            {t("freeTermsFailed")}
          </p>
        ) : null}
        {failedAt === "threadMissing" ? (
          <p role="alert" className="border border-spot bg-tint p-2 text-sm text-ink" data-testid="sensei-thread-missing">
            {t("threadMissing")}
          </p>
        ) : null}
        {threads !== null && threads.length === 0 && (
          <p className="text-sm text-ink-muted" data-testid="sensei-threads-empty">
            {t("threadsEmpty")}
          </p>
        )}
        {threads !== null && threads.length > 0 && (
          <ul className="divide-y divide-rule border-b border-rule" data-testid="sensei-threads">
            {threads.map((th) => {
              const href = THREAD_HREF[th.kind](th.anchorId);
              return (
                <li key={th.id} className="flex items-center gap-3 py-3" data-testid="sensei-thread">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {href ? (
                        <Link href={href} className="underline underline-offset-[3px] decoration-ink-muted hover:decoration-ink">
                          {th.title}
                        </Link>
                      ) : th.kind === "free" ? (
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          className="max-w-full truncate text-left underline underline-offset-[3px] decoration-ink-muted hover:decoration-ink"
                          data-testid="sensei-thread-open"
                          onClick={(e) => void reopen(th, e.currentTarget)}
                        >
                          {th.title}
                        </button>
                      ) : (
                        th.title
                      )}
                    </p>
                    <p className="text-xs text-ink-muted">
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
        <h2 id="sensei-free-title" className="border-b-2 border-dotted border-spot pb-1.5 text-[17px] font-bold">
          {t("freeTitle")}
        </h2>
        <p id={`${freeId}-hint`} className="text-xs text-ink-muted">
          {t("freeHint")}
        </p>
        <form
          className="space-y-2"
          aria-busy={pending}
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
            className="w-full resize-none rounded-none border-[1.5px] border-ink bg-paper p-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            readOnly={pending}
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
            <p role="alert" className="border border-spot bg-tint p-2 text-sm text-ink" data-testid="sensei-free-failed">
              {t("freeTermsFailed")}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <span id={`${freeId}-send-note`} className="text-xs text-ink-muted">
              {hasKey ? t("sendHint") : t("keyMissing")}
            </span>
            <Button
              type="submit"
              disabled={!canSend}
              aria-describedby={hasKey ? undefined : `${freeId}-send-note`}
              data-testid="sensei-free-send"
            >
              {t("send")}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
