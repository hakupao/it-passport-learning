// D-181 Phase B Task B2 — the AI 先生 topic review on a topic set page.
//
// A 「AI 先生と復習する」 button in the set header opens the page's panel
// (SenseiHost) on this topic's review thread: kind "review", anchorId
// `<topic_id>:<local YYYY-MM-DD>` (one thread per topic per day). The anchor text
// is a snapshot of the learning record taken when the panel opens (reviewAnchor),
// so answering more questions while the thread is open does not change it.
//
// Arriving from the quiz landing's review card (`?review=1`): once the learning
// record has loaded, the flag is removed from the URL (history.replaceState: no
// RSC refetch of the set, and a reload never sees it again) and the panel opens.
// The opener text (which SenseiPanel sends once into an empty thread) is passed
// only when the card's click intent (lib/sensei/reviewIntent: this topic, ≤ 30 s
// old) is taken too; a bookmark or a copied `?review=1` link opens the panel with
// the opener offered as a suggestion chip, nothing sent.
// Arriving from a /sensei thread row (`&thread=<YYYY-MM-DD>`, strictly validated):
// the panel opens that dated thread (a past day's review stays reachable), never
// sends, and its anchor is a fresh snapshot of today's record. Both parameters are
// removed in the same replaceState. They are read with useSearchParams, so they
// are gone again after the replace (also on a back / forward to this entry);
// `consumed` guards effect re-runs before that.
// The button stays disabled until the record has loaded (an earlier click would
// freeze an empty-record anchor into the snapshot).

"use client";

import { useEffect, useRef } from "react";
import { hasLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useLearningRecord } from "@/hooks/useLearningRecord";
import { routing } from "@/i18n/routing";
import type { TermCard } from "@/lib/glossary/dictionary";
import type { QuizQuestion } from "@/lib/quiz/quizModel";
import { reviewAnchor } from "@/lib/sensei/anchors";
import { reviewIntentStorage, takeReviewIntent } from "@/lib/sensei/reviewIntent";
import { REVIEW_THREAD_PARAM, reviewAnchorId, reviewThreadDate } from "@/lib/sensei/threadLinks";

import { useSenseiHost } from "./AskSensei";

export const REVIEW_PARAM = "review";

export function ReviewLauncher({
  topicId,
  title,
  questions,
  termCards,
  locale,
}: {
  topicId: string;
  /** The topic name: the thread title and the anchor's 分野 line. */
  title: string;
  questions: QuizQuestion[];
  termCards: Record<string, TermCard>;
  locale: string;
}): React.ReactElement | null {
  const t = useTranslations("Sensei");
  const openFor = useSenseiHost();
  const { record, loaded } = useLearningRecord();
  const params = useSearchParams();
  const arrivedForReview = params?.get(REVIEW_PARAM) === "1";
  const threadDate = reviewThreadDate(params?.get(REVIEW_THREAD_PARAM));
  const buttonRef = useRef<HTMLButtonElement>(null);
  const consumed = useRef(false);
  const appLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;

  /** Open the review thread of `date` (default: today), sending `opener` into an empty one. */
  function openReview({ opener, date }: { opener?: string; date?: string } = {}): void {
    const trigger = buttonRef.current;
    if (!openFor || !trigger) return;
    openFor(
      {
        kind: "review",
        anchorId: date ? `${topicId}:${date}` : reviewAnchorId(topicId, new Date()),
        title,
        anchorText: reviewAnchor(questions, record, appLocale, termCards, title),
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
    openRef.current({ opener: intended ? t("reviewOpener") : undefined, date: threadDate ?? undefined });
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
      disabled={!loaded}
      onClick={() => openReview()}
    >
      {t("reviewButton")}
    </Button>
  );
}
