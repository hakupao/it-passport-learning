// Stage 7 Phase 3 (D-196 §0-11) — a figure label in the active locale (jp when that one is empty).
// Kept here, not in lib/textbook/reader (node:fs), so the client NetworkFig / StepStage can use it.

import type { Text3 } from "@/lib/textbook/types";

export function pick3(t: Text3, locale: string): string {
  const v = locale === "zh" ? t.zh : locale === "en" ? t.en : t.jp;
  return v || t.jp;
}
