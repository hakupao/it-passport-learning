// D-181 Phase B Task B2 — the AI 先生 topic review on a topic page (/practice/browse/<topic_id>,
// Stage 7 TopicPage).
//
// A 「AI 先生と復習する」 button in the topic page header opens the page's panel
// (SenseiHost) on this topic's review thread: kind "review", anchorId
// `<topic_id>:<local YYYY-MM-DD>` (one thread per topic per day). The anchor text
// is a snapshot of the learning record taken when the panel opens (reviewAnchor),
// so answering more questions while the thread is open does not change it.
//
// Arriving from the today page's 「AI 分析」 link (WeakTopics, `?review=1`): once the
// learning record has loaded, the flag is removed from the URL (history.replaceState:
// no RSC refetch of the page, and a reload never sees it again) and the panel opens.
// The opener text (which SenseiPanel sends once into an empty thread) is passed
// only when that link's click intent (lib/sensei/reviewIntent: this topic, ≤ 30 s
// old) is taken too; a bookmark or a copied `?review=1` link opens the panel with
// the opener offered as a suggestion chip, nothing sent.
// Arriving from a /sensei thread row (`&thread=<YYYY-MM-DD>`, strictly validated):
// the panel opens that dated thread (a past day's review stays reachable), never
// sends, and its anchor is a fresh snapshot of today's record. Both parameters are
// removed in the same replaceState. They are read with useSearchParams, so they
// are gone again after the replace (also on a back / forward to this entry);
// `consumed` guards effect re-runs before that. useSearchParams sits under a Suspense boundary
// whose fallback is the button as it first renders (disabled), so the page can be prerendered.
// The button stays disabled until the record has loaded (an earlier click would
// freeze an empty-record anchor into the snapshot).
// The page sends light rows only (D-193 §0-1): opening first takes the ≤ 5 wrong ids
// (reviewWrongIds) of the record snapshot and, when there are any, fetches their full
// text from the static data (D-217 H1-3: reviewIds over index.json — the checks the former
// GET /api/quiz/questions made — then the exam shards + explanation chunks; the button is aria-busy
// and disabled meanwhile); a failed fetch (or ids reviewIds refuses) leaves each of them as its
// `- #id（出典）` line in the anchor.
// That degraded anchor (id lines only, no question text) is accepted as is — documented, not
// retried (Stage 7 Phase 2 final review M-2).

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { hasLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useLearningRecord } from "@/hooks/useLearningRecord";
import { routing } from "@/i18n/routing";
import type { TermCard } from "@/lib/glossary/dictionary";
import type { TopicRow } from "@/lib/practice/topicRows";
import type { QuizQuestion } from "@/lib/quiz/quizModel";
import { staticData } from "@/lib/staticData/client";
import { reviewIds } from "@/lib/staticData/shards";
import { reviewAnchor, reviewWrongIds } from "@/lib/sensei/anchors";
import { reviewIntentStorage, takeReviewIntent } from "@/lib/sensei/reviewIntent";
import { REVIEW_THREAD_PARAM, reviewAnchorId, reviewThreadDate } from "@/lib/sensei/threadLinks";

import { useSenseiHost } from "./AskSensei";

export const REVIEW_PARAM = "review";

type ReviewLauncherProps = {
  topicId: string;
  /** The topic name: the thread title and the anchor's 分野 line. */
  title: string;
  /** The topic's light rows (D-193 §0-1). */
  rows: TopicRow[];
  termCards: Record<string, TermCard>;
  locale: string;
};

export function ReviewLauncher(props: ReviewLauncherProps): React.ReactElement {
  return (
    <Suspense fallback={<PendingButton />}>
      <ReviewLauncherBody {...props} />
    </Suspense>
  );
}

/** The button as it first renders (the record not loaded yet: disabled). */
function PendingButton(): React.ReactElement | null {
  const t = useTranslations("Sensei");
  if (!useSenseiHost()) return null;
  return (
    <Button type="button" variant="outline" size="sm" aria-haspopup="dialog" data-testid="review-launcher" disabled>
      {t("reviewButton")}
    </Button>
  );
}

function ReviewLauncherBody({
  topicId,
  title,
  rows,
  termCards,
  locale,
}: ReviewLauncherProps): React.ReactElement | null {
  const t = useTranslations("Sensei");
  const openFor = useSenseiHost();
  const { record, loaded } = useLearningRecord();
  const params = useSearchParams();
  const arrivedForReview = params?.get(REVIEW_PARAM) === "1";
  const threadDate = reviewThreadDate(params?.get(REVIEW_THREAD_PARAM));
  const buttonRef = useRef<HTMLButtonElement>(null);
  const consumed = useRef(false);
  const [busy, setBusy] = useState(false);
  const appLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;

  /** Open the review thread of `date` (default: today), sending `opener` into an empty one. */
  async function openReview({ opener, date }: { opener?: string; date?: string } = {}): Promise<void> {
    const trigger = buttonRef.current;
    if (!openFor || !trigger || busy) return;
    const snapshot = record;
    const ids = reviewWrongIds(rows, snapshot);
    const full = new Map<string, QuizQuestion>();
    if (ids.length > 0) {
      setBusy(true);
      try {
        const accepted = reviewIds(topicId, ids, await staticData.fetchQuizIndex());
        if (!accepted) throw new Error(`questions: ids refused (${ids.join(",")})`);
        for (const q of await staticData.fetchQuestions(accepted, appLocale, { explanations: true })) full.set(q.id, q);
      } catch (err) {
        console.error("[review] wrong questions fetch failed; the anchor lists their ids only", err);
      } finally {
        setBusy(false);
      }
    }
    openFor(
      {
        kind: "review",
        anchorId: date ? `${topicId}:${date}` : reviewAnchorId(topicId, new Date()),
        title,
        anchorText: reviewAnchor(rows, full, snapshot, appLocale, termCards, title),
        opener,
      },
      trigger,
    );
  }
  // The effect below must see this render's record. Effects run in declaration
  // order, so this openRef update has to stay above the consume effect.
  const openRef = useRef(openReview);
  useEffect(() => {
    openRef.current = openReview;
  });

  useEffect(() => {
    if ((!arrivedForReview && !threadDate) || !loaded || consumed.current) return;
    consumed.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete(REVIEW_PARAM);
    url.searchParams.delete(REVIEW_THREAD_PARAM);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    const intended = arrivedForReview && takeReviewIntent(reviewIntentStorage(), topicId, Date.now());
    void openRef.current({ opener: intended ? t("reviewOpener") : undefined, date: threadDate ?? undefined });
  }, [arrivedForReview, threadDate, loaded, topicId, t]);

  if (!openFor) return null;
  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="outline"
      size="sm"
      aria-haspopup="dialog"
      data-testid="review-launcher"
      disabled={!loaded || busy}
      aria-busy={busy}
      onClick={() => void openReview()}
    >
      {t("reviewButton")}
    </Button>
  );
}
