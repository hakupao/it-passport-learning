import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { NAV_ITEMS } from "../navItems";

function nav(locale: string): Record<string, string> {
  const file = path.resolve(__dirname, `../../../../messages/${locale}.json`);
  return (JSON.parse(readFileSync(file, "utf-8")) as { Nav: Record<string, string> }).Nav;
}

describe("NAV_ITEMS (shared by the three shells)", () => {
  it("lists textbook, quiz, glossary and the AI 先生 page, in that order", () => {
    expect(NAV_ITEMS).toEqual([
      { href: "/textbook", key: "textbook" },
      { href: "/quiz", key: "quiz" },
      { href: "/glossary", key: "glossary" },
      { href: "/sensei", key: "sensei" },
    ]);
  });

  for (const locale of ["ja", "zh", "en"]) {
    it(`${locale}: every item has a Nav label`, () => {
      const labels = nav(locale);
      for (const item of NAV_ITEMS) expect(labels[item.key], item.key).toBeTruthy();
    });
  }

  it("labels the AI 先生 item per locale", () => {
    expect([nav("ja").sensei, nav("zh").sensei, nav("en").sensei]).toEqual(["AI 先生", "AI 老师", "AI Tutor"]);
  });
});
