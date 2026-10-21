// Stage 6 (D-179 / D-180) Task 7 — term chip on quiz questions.
// Same SSR approach as GlossaryList.ssr.test.ts (node env, renderToStaticMarkup,
// createElement instead of JSX, NextIntlClientProvider with the real catalogs).
import { describe, expect, it, vi } from "vitest";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { readFileSync } from "node:fs";
import path from "node:path";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    locale,
    children,
    className,
  }: {
    href: string;
    locale: string;
    children: React.ReactNode;
    className?: string;
  }) => h("a", { href: `/${locale}${href}`, className }, children),
}));

import { TermChip } from "../TermChip";
import type { TermCard } from "@/lib/glossary/dictionary";

const CARD: TermCard = {
  id: "t0123456789abcdef",
  term: "RPA",
  gloss: "机器人流程自动化",
  definition: "定义-RPA",
  memoryHook: "口诀-RPA",
  senseCount: 1,
  questionCount: 3,
};

function render(
  card: TermCard | undefined,
  label: string,
  locale: "ja" | "zh" | "en" = "ja",
  defaultOpen?: boolean,
): string {
  const messages = JSON.parse(
    readFileSync(path.resolve(__dirname, `../../../../messages/${locale}.json`), "utf-8"),
  );
  return renderToStaticMarkup(
    h(NextIntlClientProvider, { locale, messages, children: h(TermChip, { card, label, locale, defaultOpen }) }),
  );
}

describe("TermChip (SSR)", () => {
  it("with a card: a collapsed button labelled with the JP term, popover not rendered", () => {
    const out = render(CARD, "RPA");
    expect(out).toMatch(/<button[^>]*aria-expanded="false"[^>]*>RPA<\/button>/);
    expect(out).not.toContain("定义-RPA");
    expect(out).not.toContain("口诀-RPA");
    expect(out).not.toContain("/glossary/");
    expect(out).not.toContain("aria-controls");
  });

  it("open, single sense: card fields + glossary link, no other-senses hint", () => {
    const out = render(CARD, "RPA", "ja", true);
    expect(out).toMatch(/<button[^>]*aria-expanded="true"/);
    expect(out).toContain("定义-RPA");
    expect(out).toContain("口诀-RPA");
    expect(out).toContain(`href="/ja/glossary/${CARD.id}"`);
    expect(out).not.toContain("ほかの単元での説明");
  });

  it("open, multi-sense: hints the other units with n = senseCount - 1", () => {
    const multi = { ...CARD, senseCount: 3 };
    expect(render(multi, "RPA", "ja", true)).toContain("ほかの単元での説明（2）");
    expect(render(multi, "RPA", "zh", true)).toContain("其他单元中的释义（2）");
    expect(render(multi, "RPA", "en", true)).toContain("In other units (2)");
    // collapsed: the hint lives in the popover only
    expect(render(multi, "RPA", "ja")).not.toContain("ほかの単元での説明");
  });

  it("without a card: plain text only, no button", () => {
    const out = render(undefined, "販売促進");
    expect(out).toContain("販売促進");
    expect(out).not.toContain("<button");
    expect(out).not.toContain("aria-expanded");
  });
});
