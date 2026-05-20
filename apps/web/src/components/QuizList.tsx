// Phase 2 Step 10 — <QuizList /> client component (D-085 §2.4 Quiz Explain mode).
//
// Session 42 4Q-locked design:
//   - Renders the question cards.
//   - URL `?qid=...` is the single source of truth (Q3=a). The active question
//     is derived from `useSearchParams().get('qid')`, so:
//       - Browser back/forward navigation toggles the modal naturally.
//       - The URL is shareable + reload-survives.
//       - Closing the modal calls `router.replace` to clear `?qid=` without
//         growing the history stack.
//
// Pure client component; the server <QuizListPage /> hydrates it with pre-built
// QuizSummary[] derived from the corpus index.
//
// Session 46 Step 14 a11y polish (Full WCAG 2.1 AA):
//   - Contrast: text-black/50 → /60 (emptyHint, choices) / text-black/40 → /55
//     (page entity badge) — both bump above AA Normal 4.5:1.
//   - Focus: uniform focus-visible ring on the Explain button (LD-4).
//   - <main id="main-content" tabIndex={-1}> is the SkipLink target (LD-8).

"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { QuizExplain } from "./QuizExplain";
import type { QuizSummary } from "@/lib/quiz/quizScope";

interface QuizListProps {
  summaries: QuizSummary[];
}

const CHOICE_SEP = "／";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black focus-visible:ring-black dark:focus-visible:ring-white";

export function QuizList({ summaries }: QuizListProps): React.ReactElement {
  const t = useTranslations("QuizList");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeQid = searchParams.get("qid");

  // Defensive URL-credential strip (Session 41 Rule B archive 2 carry-over).
  // If the page is reached via `https://user:pass@host/quiz`, Chrome refuses to
  // construct any subsequent `fetch()` against `window.location.href`. The D-097
  // firewall's Basic Auth has already been honoured by the time this effect
  // runs (Chrome's HTTP auth cache carries the credentials for the session), so
  // replacing the URL with a credential-free copy is purely a fetch-construction
  // fix and does not weaken the firewall.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.href.includes("@")) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname + window.location.search + window.location.hash,
      );
    }
  }, []);

  const activeSummary = useMemo(() => {
    if (!activeQid) return null;
    return summaries.find((s) => s.questionId === activeQid) ?? null;
  }, [activeQid, summaries]);

  const handleSelect = useCallback(
    (questionId: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("qid", questionId);
      router.push(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleClose = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("qid");
    const qs = next.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }, [router, searchParams]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-col min-h-[calc(100vh-3rem)] max-w-5xl mx-auto p-4 sm:p-6 gap-4 focus:outline-none"
    >
      <header className="border-b border-black/[.08] dark:border-white/[.12] pb-3">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs sm:text-sm text-black/65 dark:text-white/65 mt-1">
          {t("subtitle")}
        </p>
      </header>

      {summaries.length === 0 ? (
        <p className="text-center text-sm text-black/60 dark:text-white/60 py-12">
          {t("emptyHint")}
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {summaries.map((s) => (
            <li
              key={s.questionId}
              className="border border-black/[.08] dark:border-white/[.14] rounded-xl p-4 bg-white dark:bg-black/40 flex flex-col gap-2 hover:border-black/30 dark:hover:border-white/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wider text-black/55 dark:text-white/55">
                  {t("pageEntity", {
                    page: s.page,
                    index: s.entityIndex + 1,
                  })}
                </span>
                {s.answerLetterJp && (
                  <span className="text-xs text-black/65 dark:text-white/65">
                    {t("answerPrefix")}
                    {s.answerLetterJp}
                  </span>
                )}
              </div>

              <p className="text-sm leading-snug text-black/85 dark:text-white/85" lang="ja">
                {s.stemJp}
              </p>

              {s.choices.length > 0 && (
                <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2" lang="ja">
                  {s.choices
                    .map((c) => `${c.letterJp}.${stripChoicePrefix(c.text.jp)}`)
                    .join(CHOICE_SEP)}
                </p>
              )}

              <button
                type="button"
                onClick={() => handleSelect(s.questionId)}
                className={`mt-1 self-start text-xs rounded-lg bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 hover:opacity-90 transition-opacity ${FOCUS_RING}`}
              >
                {tCommon("explain")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <QuizExplain summary={activeSummary} onClose={handleClose} />
    </main>
  );
}

/**
 * Choice strings in the corpus are already prefixed with "ア．" / "イ．" etc.
 * The card layout shows our own letter chip ("ア." rendered in code), so strip
 * the redundant prefix here for cleaner cards. Idempotent on missing prefix.
 */
function stripChoicePrefix(jp: string): string {
  return jp.replace(/^[アイウエ][．.]\s*/u, "");
}
