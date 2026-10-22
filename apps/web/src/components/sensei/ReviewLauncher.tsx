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
// RSC refetch of the set, and a reload never sees it again) and the panel opens
// with the opener text, which SenseiPanel sends once into an empty thread. The
// flag is read with useSearchParams, so it is false again after the replace (also
// on a back / forward to this entry); `consumed` guards effect re-runs before that.

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
import { reviewAnchorId } from "@/lib/sensei/threadLinks";

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
  const arrivedForReview = useSearchParams()?.get(REVIEW_PARAM) === "1";
  const buttonRef = useRef<HTMLButtonElement>(null);
  const consumed = useRef(false);
  const appLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;

  function openReview(opener?: string): void {
    const trigger = buttonRef.current;
    if (!openFor || !trigger) return;
    openFor(
      {
        kind: "review",
        anchorId: reviewAnchorId(topicId, new Date()),
        title,
        anchorText: reviewAnchor(questions, record, appLocale, termCards, title),
        opener,
      },
      trigger,
    );
  }
  // the effect below must see this render's record
  const openRef = useRef(openReview);
  useEffect(() => {
    openRef.current = openReview;
  });

  useEffect(() => {
    if (!arrivedForReview || !loaded || consumed.current) return;
    consumed.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete(REVIEW_PARAM);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    openRef.current(t("reviewOpener"));
  }, [arrivedForReview, loaded, t]);

  if (!openFor) return null;
  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="outline"
      size="sm"
      aria-haspopup="dialog"
      data-testid="review-launcher"
      onClick={() => openReview()}
    >
      {t("reviewButton")}
    </Button>
  );
}
