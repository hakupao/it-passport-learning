// Stage 6 (D-179 / D-180 §0-3) Task 7 — question anchors + term chips on QuizSet.
// Same SSR approach as QuizFeedback.ssr.test.ts (node env, renderToStaticMarkup,
// createElement instead of JSX, real questions.json + message catalogs).
import { describe, expect, it, vi } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    h("a", { href, className }, children),
}));

import { QuizSet } from "../QuizSet";
import type { TermCard } from "@/lib/glossary/dictionary";
import type { QuizQuestion } from "@/lib/quiz/quizModel";

const ROOT = path.resolve(__dirname, "../../../../../..");
const Q = JSON.parse(readFileSync(path.join(ROOT, "data/ip/quiz/questions.json"), "utf-8"))
  .questions as QuizQuestion[];
const QUESTION = Q.find((q) => q.id === "2024r06-q001")!;

const CARD: TermCard = {
  id: "t0123456789abcdef",
  term: "RPA",
  gloss: "RPA",
  definition: "def",
  memoryHook: "hook",
  senseCount: 1,
  questionCount: 1,
};

function render(termCards: Record<string, TermCard>): string {
  const messages = JSON.parse(readFileSync(path.resolve(__dirname, "../../../../messages/ja.json"), "utf-8"));
  return renderToStaticMarkup(
    h(NextIntlClientProvider, {
      locale: "ja",
      messages,
      children: h(QuizSet, { locale: "ja", label: "L", sublabel: "S", questions: [QUESTION], termCards }),
    }),
  );
}

describe("QuizSet anchors + term chips (SSR)", () => {
  it("fixture question carries the expected terms", () => {
    expect(QUESTION.terms).toEqual(["ダイレクトマーケティング", "販売促進", "RPA"]);
  });

  it("renders each question as <article id={question id}>", () => {
    expect(render({})).toMatch(/<article[^>]*id="2024r06-q001"/);
  });

  it("terms with a card become chip buttons; the rest stay plain text", () => {
    const out = render({ RPA: CARD });
    expect((out.match(/aria-expanded="false"/g) ?? []).length).toBe(1);
    expect(out).toMatch(/<button[^>]*aria-expanded="false"[^>]*>RPA<\/button>/);
    expect(out).toContain("ダイレクトマーケティング");
    expect(out).toContain("販売促進");
  });

  it("no cards: every term is plain text", () => {
    const out = render({});
    expect(out).not.toContain("aria-expanded");
    expect(out).toContain("RPA");
  });
});
