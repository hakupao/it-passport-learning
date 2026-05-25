"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import type { QuizSummary } from "@/lib/quiz/quizScope";

export interface QuizState {
  activeQid: string | null;
  activeSummary: QuizSummary | null;
  handleSelect: (questionId: string) => void;
  handleClose: () => void;
}

export function useQuizState(summaries: QuizSummary[]): QuizState {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeQid = searchParams.get("qid");

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
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }, [router, searchParams]);

  return { activeQid, activeSummary, handleSelect, handleClose };
}
