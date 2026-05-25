"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import {
  findSummaryBySurface,
  parseTermParam,
  type GlossarySummary,
} from "@/lib/glossary/glossaryScope";

export interface GlossaryState {
  activeTerm: string | null;
  activeSummary: GlossarySummary | null;
  handleSelect: (surfaceJp: string) => void;
  handleClose: () => void;
}

export function useGlossaryState(summaries: GlossarySummary[]): GlossaryState {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTerm = parseTermParam(searchParams.get("term"));

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
    if (!activeTerm) return null;
    return findSummaryBySurface(summaries, activeTerm);
  }, [activeTerm, summaries]);

  const handleSelect = useCallback(
    (surfaceJp: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("term", surfaceJp);
      router.push(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleClose = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("term");
    const qs = next.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }, [router, searchParams]);

  return { activeTerm, activeSummary, handleSelect, handleClose };
}
